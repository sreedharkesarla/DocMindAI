-- Create table to track token usage and costs for AI operations
CREATE TABLE IF NOT EXISTS token_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    operation_type ENUM('chat', 'embedding', 'indexing') NOT NULL,
    model_id VARCHAR(255) NOT NULL,
    file_id VARCHAR(255) NULL,
    conversation_id VARCHAR(255) NULL,
    
    -- Token counts
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    
    -- Cost tracking (in USD)
    input_cost DECIMAL(10, 8) DEFAULT 0.00000000,
    output_cost DECIMAL(10, 8) DEFAULT 0.00000000,
    total_cost DECIMAL(10, 8) DEFAULT 0.00000000,
    
    -- Metadata
    operation_details JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_operation_type (operation_type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_file_id (file_id),
    INDEX idx_conversation_id (conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create summary view for easy cost analysis
CREATE OR REPLACE VIEW usage_summary AS
SELECT 
    user_id,
    operation_type,
    model_id,
    DATE(timestamp) as usage_date,
    COUNT(*) as operation_count,
    SUM(input_tokens) as total_input_tokens,
    SUM(output_tokens) as total_output_tokens,
    SUM(total_tokens) as total_tokens,
    SUM(total_cost) as total_cost_usd
FROM token_usage
GROUP BY user_id, operation_type, model_id, DATE(timestamp)
ORDER BY usage_date DESC, total_cost_usd DESC;
