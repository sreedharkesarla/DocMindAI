import asyncio
import websockets
import json
import time

async def single_query(user_id, conversation_id, question):
    """Execute a single query and measure response time"""
    url = f"ws://localhost:8003/chat/{user_id}/{conversation_id}/"
    
    start_time = time.time()
    
    try:
        async with websockets.connect(url) as websocket:
            await websocket.send(question)
            
            while True:
                response = await asyncio.wait_for(websocket.recv(), timeout=30.0)
                
                try:
                    msg = json.loads(response)
                    if msg.get("reporter") == "output_message" and msg.get("type") == "answer":
                        end_time = time.time()
                        return {
                            "user": user_id,
                            "question": question,
                            "response_time": round(end_time - start_time, 2),
                            "status": "success"
                        }
                except json.JSONDecodeError:
                    pass
                    
    except Exception as e:
        end_time = time.time()
        return {
            "user": user_id,
            "question": question,
            "response_time": round(end_time - start_time, 2),
            "status": f"error: {str(e)}"
        }

async def test_performance():
    """Test response times and concurrent users"""
    print("⚡ Testing Performance\n")
    print("=" * 80)
    
    # Test 1: Single user response time
    print("\n[TEST 1] Single user response time")
    questions = [
        "What is the warranty period?",
        "What technical support is available?",
        "How do I troubleshoot connection problems?",
    ]
    
    for question in questions:
        result = await single_query("test", "perf-test-001", question)
        print(f"  Q: {question[:50]}...")
        print(f"  ⏱️  Response time: {result['response_time']}s")
        print(f"  Status: {result['status']}\n")
    
    # Test 2: Concurrent users
    print("\n[TEST 2] Concurrent users (3 simultaneous queries)")
    tasks = [
        single_query("user1", "conv1", "What is the warranty?"),
        single_query("user2", "conv2", "What support options are there?"),
        single_query("user3", "conv3", "How to file a claim?"),
    ]
    
    start = time.time()
    results = await asyncio.gather(*tasks)
    total_time = time.time() - start
    
    print(f"  Total time for 3 concurrent queries: {round(total_time, 2)}s")
    for result in results:
        print(f"  - {result['user']}: {result['response_time']}s ({result['status']})")
    
    # Test 3: Same user, rapid sequential queries
    print("\n[TEST 3] Rapid sequential queries (same user)")
    rapid_questions = [
        "What is covered by warranty?",
        "How long is it?",
        "What's not covered?",
    ]
    
    total_start = time.time()
    for i, q in enumerate(rapid_questions, 1):
        result = await single_query("test", "rapid-test", q)
        print(f"  Query {i}: {result['response_time']}s")
    total_rapid = time.time() - total_start
    
    print(f"  Total time for 3 sequential: {round(total_rapid, 2)}s")
    print(f"  Average: {round(total_rapid/3, 2)}s per query")
    
    print("\n" + "=" * 80)
    print("✅ Performance tests completed!")

if __name__ == "__main__":
    asyncio.run(test_performance())
