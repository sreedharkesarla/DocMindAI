import boto3
import os

# Get credentials from environment
region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
access_key = os.getenv('AWS_ACCESS_KEY_ID')
secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')

sqs = boto3.client(
    'sqs',
    region_name=region,
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key
)

queue_url = 'https://sqs.us-east-1.amazonaws.com/670041082980/product-genius-queue'

# Get queue attributes
response = sqs.get_queue_attributes(
    QueueUrl=queue_url,
    AttributeNames=['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible']
)

print(f"Messages Available: {response['Attributes'].get('ApproximateNumberOfMessages', 0)}")
print(f"Messages In Flight: {response['Attributes'].get('ApproximateNumberOfMessagesNotVisible', 0)}")

# Purge the queue
print("\nPurging queue...")
try:
    sqs.purge_queue(QueueUrl=queue_url)
    print("Queue purged successfully!")
except Exception as e:
    print(f"Error purging queue: {e}")
