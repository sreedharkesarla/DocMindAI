#!/usr/bin/env python3
"""
Clean S3 - Delete all uploaded files
Connects to AWS S3 and removes all files from the upload bucket.
"""

import boto3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

AWS_BUCKET_NAME = os.getenv('AWS_BUCKET_NAME', 'product-genius-files')
AWS_FILES_PATH = os.getenv('AWS_FILES_PATH', 'TM')
AWS_REGION = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')

def get_s3_client():
    """Create and return S3 client."""
    try:
        s3_client = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        return s3_client
    except Exception as e:
        print(f"❌ Error creating S3 client: {e}")
        return None

def list_s3_objects(s3_client):
    """List all objects in the S3 bucket under the upload path."""
    try:
        objects = []
        paginator = s3_client.get_paginator('list_objects_v2')
        
        for page in paginator.paginate(Bucket=AWS_BUCKET_NAME, Prefix=AWS_FILES_PATH):
            if 'Contents' in page:
                objects.extend(page['Contents'])
        
        return objects
    except Exception as e:
        print(f"❌ Error listing S3 objects: {e}")
        return []

def delete_s3_objects(s3_client, objects):
    """Delete objects from S3 bucket."""
    if not objects:
        return 0
    
    try:
        # Delete in batches of 1000 (S3 limit)
        deleted = 0
        for i in range(0, len(objects), 1000):
            batch = objects[i:i+1000]
            delete_keys = [{'Key': obj['Key']} for obj in batch]
            
            response = s3_client.delete_objects(
                Bucket=AWS_BUCKET_NAME,
                Delete={'Objects': delete_keys}
            )
            
            deleted += len(response.get('Deleted', []))
            
            # Print progress
            for obj in response.get('Deleted', []):
                print(f"   Deleted: {obj['Key']}")
        
        return deleted
    except Exception as e:
        print(f"❌ Error deleting S3 objects: {e}")
        return 0

def main():
    print("=" * 60)
    print("DocuMindAI - S3 Bucket Cleanup")
    print("=" * 60)
    print()
    print(f"Bucket: {AWS_BUCKET_NAME}")
    print(f"Path: {AWS_FILES_PATH}")
    print(f"Region: {AWS_REGION}")
    print()
    
    # Create S3 client
    s3_client = get_s3_client()
    if not s3_client:
        print("❌ Failed to connect to S3. Check your AWS credentials in .env file.")
        return
    
    # List objects
    print("📋 Fetching files from S3 bucket...")
    objects = list_s3_objects(s3_client)
    
    if not objects:
        print("✅ No files found in S3 bucket. Already clean!")
        return
    
    # Calculate total size
    total_size = sum(obj['Size'] for obj in objects)
    total_size_mb = total_size / (1024 * 1024)
    
    print(f"Found {len(objects)} file(s) ({total_size_mb:.2f} MB)")
    print()
    
    # Show some file names
    print("Sample files:")
    for obj in objects[:5]:
        size_kb = obj['Size'] / 1024
        print(f"   - {obj['Key']} ({size_kb:.1f} KB)")
    if len(objects) > 5:
        print(f"   ... and {len(objects) - 5} more")
    print()
    
    # Confirm deletion
    response = input(f"⚠️  Do you want to delete ALL {len(objects)} file(s) from S3? (yes/no): ")
    if response.lower() not in ['yes', 'y']:
        print("❌ Cancelled. No files were deleted.")
        return
    
    print()
    print("🗑️  Deleting files from S3...")
    print("-" * 60)
    
    # Delete objects
    deleted = delete_s3_objects(s3_client, objects)
    
    print("-" * 60)
    print()
    print(f"✅ Cleanup complete! Deleted {deleted}/{len(objects)} file(s)")
    print()

if __name__ == "__main__":
    main()
