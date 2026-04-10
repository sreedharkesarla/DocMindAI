import json
import asyncio
import logging
from indexer import Indexer
from async_queue import AsyncQueue
from concurrent.futures import ThreadPoolExecutor
from sqs import sqs

logger = logging.getLogger(__name__)
executor = ThreadPoolExecutor()

async def loop(async_queue: AsyncQueue, indexer: Indexer):
    """
    Continuously process files from the async_queue, index them, and store vectors into vectors database.
    If the queue is empty, it sleeps for a short period before checking again.

    Args:
        async_queue (AsyncQueue): The queue to dequeue file paths from.
        indexer (Indexer): The indexer to process file and store vectors to database.

    Raises:
        Exception: If an error occurs during the file processing or metadata storage.
    """
    logger.info("Starting async loop for file indexing")
    while True:
        try:
            queue_size = async_queue.size()
            if queue_size == 0:
                await asyncio.sleep(0.1)
                continue
            
            logger.info(f"Queue has {queue_size} messages, dequeuing next message...")
            message_data = None
            try:
                message_data = await async_queue.dequeue()
                logger.info(f"Processing message: {message_data}")
                
                # Extract message body and SQS metadata
                if isinstance(message_data, dict) and 'body' in message_data:
                    message_body = message_data['body']
                    receipt_handle = message_data['receipt_handle']
                    queue_name = message_data['queue_name']
                else:
                    # Fallback for old format (encoded bytes)
                    message_body = message_data.decode('utf-8') if isinstance(message_data, bytes) else message_data
                    receipt_handle = None
                    queue_name = None
                
                parsed = json.loads(message_body)
                logger.info(f"Parsed message: {parsed}")
                file_id = parsed.get('file_id')
                
                # Check if file is already indexed to prevent reindexing
                file_status = indexer.get_file_status(file_id)
                if file_status in ['indexed', 'processing']:
                    logger.info(f"File {file_id} already {file_status}, skipping reindexing")
                    # Delete message since file is already processed
                    if receipt_handle and queue_name:
                        sqs.delete_message(queue_name, receipt_handle)
                        logger.info(f"Deleted duplicate message for already-indexed file {file_id}")
                    continue
                
                loop_obj = asyncio.get_running_loop()
                
                # Set status to processing before indexing
                indexer.update_file_status(file_id, 'processing')
                logger.info(f"Starting indexing for file: {parsed.get('file_path')} (file_id: {file_id})")
                
                # Run indexing synchronously to ensure completion
                await loop_obj.run_in_executor(executor, indexer.index_file, parsed)
                logger.info(f"Indexing completed for file: {parsed.get('file_path')} (file_id: {file_id})")
                
                # Only delete from SQS after successful indexing
                if receipt_handle and queue_name:
                    sqs.delete_message(queue_name, receipt_handle)
                    logger.info(f"Successfully processed and deleted message from SQS")
                
            except Exception as e:
                logger.error(f"Error processing message: {e}", exc_info=True)
                if message_data:
                    logger.error(f"Failed message data: {message_data}")
                # Message will remain in SQS and become visible again after visibility timeout
        except Exception as e:
            logger.error(f"Error in main loop: {e}", exc_info=True)
            await asyncio.sleep(1)  # Prevent tight loop on error