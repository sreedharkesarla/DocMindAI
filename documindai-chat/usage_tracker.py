import os
import json
import logging
import pymysql
from typing import Optional, Dict, List, Any

logger = logging.getLogger(__name__)

class UsageTracker:
    """
    Track token usage and costs for AI operations (chat, embeddings, indexing).
    Integrates with AWS Bedrock pricing for Claude and Titan models.
    """
    
    # AWS Bedrock pricing (USD per 1M tokens) - Updated April 2024
    PRICING = {
        'amazon.titan-embed-text-v1': {
            'input': 0.1,  # $0.0001 per 1K tokens = $0.1 per 1M tokens
            'output': 0.0
        },
        'anthropic.claude-3-haiku-20240307-v1:0': {
            'input': 0.25,  # $0.25 per 1M input tokens
            'output': 1.25  # $1.25 per 1M output tokens
        },
        'anthropic.claude-3-sonnet-20240229-v1:0': {
            'input': 3.00,  # $3.00 per 1M input tokens
            'output': 15.00  # $15.00 per 1M output tokens
        },
    }
    
    def __init__(self):
        """Initialize database connection for usage tracking"""
        try:
            self.connection = pymysql.connect(
                host=os.environ.get("RDS_DB_INSTANCE", "mysql"),
                user=os.environ.get("RDS_DB_USER", "documindai_user"),
                password=os.environ.get("RDS_DB_PASSWORD", "documindai_pass"),
                database=os.environ.get("RDS_DB_NAME", "documindai_db"),
                port=int(os.environ.get("RDS_DB_PORT", 3306)),
                cursorclass=pymysql.cursors.DictCursor
            )
            logger.info("UsageTracker initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize UsageTracker: {e}")
            self.connection = None
    
    def calculate_cost(self, model_id: str, input_tokens: int, output_tokens: int) -> Dict[str, float]:
        """
        Calculate cost based on token counts and model pricing.
        
        Args:
            model_id: AWS Bedrock model identifier
            input_tokens: Number of input tokens used
            output_tokens: Number of output tokens generated
            
        Returns:
            Dictionary with input_cost, output_cost, and total_cost in USD
        """
        pricing = self.PRICING.get(model_id, {'input': 0, 'output': 0})
        
        # Convert tokens to millions and multiply by price per million
        input_cost = (input_tokens / 1_000_000) * pricing['input']
        output_cost = (output_tokens / 1_000_000) * pricing['output']
        total_cost = input_cost + output_cost
        
        return {
            'input_cost': round(input_cost, 8),
            'output_cost': round(output_cost, 8),
            'total_cost': round(total_cost, 8)
        }
    
    def track_usage(
        self,
        user_id: str,
        operation_type: str,
        model_id: str,
        input_tokens: int,
        output_tokens: int,
        file_id: Optional[str] = None,
        conversation_id: Optional[str] = None,
        operation_details: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Track token usage and cost to database.
        
        Args:
            user_id: User identifier
            operation_type: 'chat', 'embedding', or 'indexing'
            model_id: AWS Bedrock model ID
            input_tokens: Number of input tokens used
            output_tokens: Number of output tokens generated
            file_id: Optional file identifier (for indexing operations)
            conversation_id: Optional conversation identifier (for chat operations)
            operation_details: Optional JSON metadata about the operation
            
        Returns:
            True if tracking succeeded, False otherwise
        """
        if not self.connection:
            logger.warning("UsageTracker connection not available, skipping tracking")
            return False
        
        total_tokens = input_tokens + output_tokens
        costs = self.calculate_cost(model_id, input_tokens, output_tokens)
        
        try:
            with self.connection.cursor() as cursor:
                sql = """
                    INSERT INTO token_usage 
                    (user_id, operation_type, model_id, file_id, conversation_id,
                     input_tokens, output_tokens, total_tokens,
                     input_cost, output_cost, total_cost, operation_details)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (
                    user_id,
                    operation_type,
                    model_id,
                    file_id,
                    conversation_id,
                    input_tokens,
                    output_tokens,
                    total_tokens,
                    costs['input_cost'],
                    costs['output_cost'],
                    costs['total_cost'],
                    json.dumps(operation_details) if operation_details else None
                ))
            self.connection.commit()
            
            logger.info(
                f"Tracked {operation_type} | User: {user_id} | "
                f"Tokens: {total_tokens:,} (in:{input_tokens:,}, out:{output_tokens:,}) | "
                f"Cost: ${costs['total_cost']:.6f}"
            )
            return True
            
        except Exception as e:
            logger.error(f"Failed to track usage: {e}")
            return False
    
    def get_user_usage(self, user_id: str, days: int = 30) -> List[Dict]:
        """
        Get usage summary for a user over specified number of days.
        
        Args:
            user_id: User identifier
            days: Number of days to look back (default: 30)
            
        Returns:
            List of usage records with aggregated statistics
        """
        if not self.connection:
            return []
        
        try:
            with self.connection.cursor() as cursor:
                sql = """
                    SELECT * FROM usage_summary 
                    WHERE user_id = %s 
                    AND usage_date >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
                    ORDER BY usage_date DESC
                """
                cursor.execute(sql, (user_id, days))
                return cursor.fetchall()
        except Exception as e:
            logger.error(f"Failed to get user usage: {e}")
            return []
    
    def get_total_usage(self, user_id: str, days: int = 30) -> Dict:
        """
        Get total usage statistics for a user.
        
        Args:
            user_id: User identifier
            days: Number of days to look back
            
        Returns:
            Dictionary with total tokens, cost, and breakdown by operation type
        """
        usage_records = self.get_user_usage(user_id, days)
        
        total_tokens = sum(record.get('total_tokens', 0) for record in usage_records)
        total_cost = sum(float(record.get('total_cost_usd', 0)) for record in usage_records)
        
        # Breakdown by operation type
        breakdown = {}
        for record in usage_records:
            op_type = record.get('operation_type')
            if op_type not in breakdown:
                breakdown[op_type] = {
                    'tokens': 0,
                    'cost': 0.0,
                    'operations': 0
                }
            breakdown[op_type]['tokens'] += record.get('total_tokens', 0)
            breakdown[op_type]['cost'] += float(record.get('total_cost_usd', 0))
            breakdown[op_type]['operations'] += record.get('operation_count', 0)
        
        return {
            'user_id': user_id,
            'period_days': days,
            'total_tokens': total_tokens,
            'total_cost_usd': round(total_cost, 4),
            'breakdown': breakdown,
            'daily_records': usage_records
        }
    
    def __del__(self):
        """Close database connection on cleanup"""
        if hasattr(self, 'connection') and self.connection:
            try:
                self.connection.close()
            except:
                pass
