import requests
import os
import time

"""
Test script for document upload API
Tests multiple file types and scenarios
"""

BASE_URL = "http://localhost:8001/upload"
USER_ID = "test"

def test_upload_file(file_path, user_id=USER_ID):
    """Upload a single file"""
    url = f"{BASE_URL}/upload_files/?user_id={user_id}"
    
    with open(file_path, 'rb') as f:
        files = {'files': (os.path.basename(file_path), f)}
        response = requests.post(url, files=files)
    
    print(f"\n📤 Uploading: {os.path.basename(file_path)}")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.json()

def test_get_files(user_id=USER_ID):
    """Get all files for a user"""
    url = f"{BASE_URL}/get_files/{user_id}"
    response = requests.get(url)
    
    print(f"\n📋 Files for user '{user_id}':")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        files = response.json()
        print(f"Total files: {len(files)}")
        for i, file in enumerate(files, 1):
            print(f"{i}. {file.get('file_name')} - Status: {file.get('status')}")
    else:
        print(f"Response: {response.text}")
    
    return response.json()

def test_get_file_statuses(user_id=USER_ID):
    """Get file statuses for a user"""
    url = f"{BASE_URL}/get_files_status/{user_id}"
    response = requests.get(url)
    
    print(f"\n📊 File statuses for user '{user_id}':")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.json()

def test_batch_upload(file_paths, user_id=USER_ID):
    """Upload multiple files at once"""
    url = f"{BASE_URL}/upload_files/?user_id={user_id}"
    
    files = [('files', (os.path.basename(f), open(f, 'rb'))) for f in file_paths]
    response = requests.post(url, files=files)
    
    # Close file handles
    for _, (_, fh) in files:
        fh.close()
    
    print(f"\n📤 Batch uploading {len(file_paths)} files")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.json()

if __name__ == "__main__":
    print("🚀 Starting Upload API Tests\n")
    print("=" * 80)
    
    # Test 1: Get existing files
    print("\n[TEST 1] Get existing files")
    test_get_files()
    
    # Test 2: Get file statuses
    print("\n[TEST 2] Get file statuses")
    test_get_file_statuses()
    
    # Test 3: Upload a new file (if you have test files)
    # Uncomment and add your test file path
    # print("\n[TEST 3] Upload new file")
    # test_upload_file("path/to/your/test.pdf")
    
    # Test 4: Upload unsupported file type
    # Should get an error
    
    # Test 5: Upload with different user_id
    # print("\n[TEST 5] Upload with different user")
    # test_upload_file("path/to/file.txt", user_id="user_2")
    
    print("\n" + "=" * 80)
    print("✅ Upload API tests completed!")
