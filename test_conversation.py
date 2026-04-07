import asyncio
import websockets
import json

async def test_conversation_history():
    """
    Test if chat maintains conversation history
    """
    user_id = "test"
    conversation_id = "test-history-001"
    file_ids = ""
    
    url = f"ws://localhost:8003/chat/{user_id}/{conversation_id}/{file_ids}"
    
    print(f"🔗 Connecting to: {url}\n")
    
    async with websockets.connect(url) as websocket:
        print("✅ Connected!\n")
        
        # Conversation to test context
        questions = [
            "What is the warranty period?",
            "What does it cover?",  # Should understand "it" refers to warranty
            "How do I file a claim?",  # Should maintain warranty context
            "What about extended warranty?",  # Follow-up question
        ]
        
        for i, question in enumerate(questions, 1):
            print(f"[Q{i}] {question}")
            await websocket.send(question)
            
            while True:
                response = await asyncio.wait_for(websocket.recv(), timeout=30.0)
                
                try:
                    msg = json.loads(response)
                    if msg.get("reporter") == "output_message" and msg.get("type") == "answer":
                        answer = msg.get("message", "")
                        print(f"[A{i}] {answer[:200]}...")  # First 200 chars
                        print("-" * 80)
                        break
                except json.JSONDecodeError:
                    pass

if __name__ == "__main__":
    print("🧪 Testing Conversation History\n")
    asyncio.run(test_conversation_history())
