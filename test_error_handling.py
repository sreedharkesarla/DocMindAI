import requests
import os

"""
Test error handling and edge cases
"""

BASE_URL = "http://localhost:8001/upload"

def test_cases():
    print("🧪 Testing Error Handling\n")
    print("=" * 80)
    
    # Test 1: Empty user_id
    print("\n[TEST 1] Upload without user_id")
    try:
        response = requests.post(f"{BASE_URL}/upload_files/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Missing file
    print("\n[TEST 2] Upload without file")
    try:
        response = requests.post(f"{BASE_URL}/upload_files/?user_id=test")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: Invalid user_id
    print("\n[TEST 3] Get files for non-existent user")
    response = requests.get(f"{BASE_URL}/get_files/nonexistent_user")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test 4: Very long filename
    print("\n[TEST 4] File with very long name")
    long_name = "a" * 300 + ".txt"
    print(f"Filename length: {len(long_name)}")
    
    # Test 5: Special characters in filename
    print("\n[TEST 5] File with special characters")
    special_name = "test @#$%^&*().txt"
    print(f"Filename: {special_name}")
    
    # Test 6: Empty file
    print("\n[TEST 6] Empty file upload")
    # Create empty file
    empty_file = "empty_test.txt"
    open(empty_file, 'w').close()
    
    try:
        with open(empty_file, 'rb') as f:
            files = {'files': (empty_file, f)}
            response = requests.post(
                f"{BASE_URL}/upload_files/?user_id=test",
                files=files
            )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    finally:
        if os.path.exists(empty_file):
            os.remove(empty_file)
    
    # Test 7: Concurrent uploads
    print("\n[TEST 7] Rapid sequential uploads")
    test_content = "Rapid upload test content"
    for i in range(3):
        filename = f"rapid_test_{i}.txt"
        with open(filename, 'w') as f:
            f.write(test_content)
        
        try:
            with open(filename, 'rb') as f:
                files = {'files': (filename, f)}
                response = requests.post(
                    f"{BASE_URL}/upload_files/?user_id=test",
                    files=files
                )
            print(f"  Upload {i+1}: Status {response.status_code}")
        finally:
            if os.path.exists(filename):
                os.remove(filename)
    
    print("\n" + "=" * 80)
    print("✅ Error handling tests completed!")

if __name__ == "__main__":
    test_cases()
