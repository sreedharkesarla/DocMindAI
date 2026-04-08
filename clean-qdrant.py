#!/usr/bin/env python3
"""
Clean Qdrant - Delete all collections
Connects to Qdrant and removes all collections for a fresh start.
"""

import requests
import json

QDRANT_URL = "http://localhost:6333"

def get_collections():
    """Get list of all collections."""
    try:
        response = requests.get(f"{QDRANT_URL}/collections")
        response.raise_for_status()
        data = response.json()
        collections = data.get('result', {}).get('collections', [])
        return [col['name'] for col in collections]
    except Exception as e:
        print(f"❌ Error getting collections: {e}")
        return []

def delete_collection(collection_name):
    """Delete a specific collection."""
    try:
        response = requests.delete(f"{QDRANT_URL}/collections/{collection_name}")
        response.raise_for_status()
        print(f"✅ Deleted collection: {collection_name}")
        return True
    except Exception as e:
        print(f"❌ Error deleting collection '{collection_name}': {e}")
        return False

def main():
    print("=" * 60)
    print("DocuMindAI - Qdrant Collection Cleanup")
    print("=" * 60)
    print()
    
    # Get all collections
    print("📋 Fetching collections from Qdrant...")
    collections = get_collections()
    
    if not collections:
        print("✅ No collections found. Qdrant is already clean!")
        return
    
    print(f"Found {len(collections)} collection(s): {', '.join(collections)}")
    print()
    
    # Confirm deletion
    response = input(f"⚠️  Do you want to delete ALL {len(collections)} collection(s)? (yes/no): ")
    if response.lower() not in ['yes', 'y']:
        print("❌ Cancelled. No collections were deleted.")
        return
    
    print()
    print("🗑️  Deleting collections...")
    print("-" * 60)
    
    # Delete each collection
    deleted = 0
    for collection in collections:
        if delete_collection(collection):
            deleted += 1
    
    print("-" * 60)
    print()
    print(f"✅ Cleanup complete! Deleted {deleted}/{len(collections)} collection(s)")
    print()

if __name__ == "__main__":
    main()
