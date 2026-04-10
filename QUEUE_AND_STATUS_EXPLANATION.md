# Processing Queue - Explanation

## Short Answer
The "Processing Queue" is **NOT a queue** - it's a **FILE STATUS** in the database!

- **"processing"** = File status that means "currently being indexed"
- The actual queues handle file upload and indexing workflows

---

## Complete Flow (2 Queues, 3 Status Stages)

### Stage 1: File Upload (Upload Service)
```
User uploads file via API
    ↓
File saved to local disk (temp)
    ↓
Message added to AsyncQueue (in-memory queue)
    │
    │ [Upload Service - async_loop.py processes this queue]
    ↓
Upload file to S3
    ↓
Update database: status = "uploaded"  ✅ First Status
    ↓
Send message to SQS Queue (AWS)
```

### Stage 2: Queue Handoff (SQS Queue)
```
SQS Queue (AWS)
    │
    │ Message contains:
    │ - file_id
    │ - user_id  
    │ - S3 path
    │ - bucket
    │
    ↓
Index Service pulls message from SQS
```

### Stage 3: File Indexing (Index Service)
```
Index Service receives message from SQS
    ↓
Message added to AsyncQueue (in-memory queue)
    │
    │ [Index Service - async_loop.py processes this queue]
    ↓
Check if file already indexed (prevents reindexing)
    ↓
Update database: status = "processing"  ⚠️ Second Status (THIS IS WHAT YOU SEE)
    ↓
Extract text from file (PDF/Excel/Word/etc)
    ↓
Generate embeddings (AWS Bedrock)
    ↓
Store vectors in Qdrant database
    ↓
Update database: status = "indexed"  ✅ Third Status
    ↓
Delete message from SQS
```

---

## File Status Meanings

| Status | What It Means | Where It Is |
|--------|---------------|-------------|
| **uploaded** | File uploaded to S3, waiting to be indexed | Upload complete |
| **processing** | Currently extracting text and generating embeddings | Indexing in progress |
| **indexed** | Embeddings stored in Qdrant, ready for chat | Indexing complete |
| **failed** | Error during indexing | Error state |

---

## The Two Queues

### 1. AsyncQueue (In-Memory) - Upload Service
- **Purpose**: Process uploaded files and send to S3
- **Location**: `documindai-upload/async_queue.py`
- **Flow**: API → AsyncQueue → S3 → SQS

### 2. AsyncQueue (In-Memory) - Index Service  
- **Purpose**: Process files from SQS and index them
- **Location**: `documindai-index/async_queue.py`
- **Flow**: SQS → AsyncQueue → Indexing → Qdrant

### 3. SQS Queue (AWS)
- **Purpose**: Communication bridge between Upload and Index services
- **Location**: AWS SQS (product-genius-queue)
- **Flow**: Upload Service → SQS → Index Service

---

## When You See "Processing"

When a file shows status **"processing"**, it means:

✅ File successfully uploaded to S3  
✅ Message successfully sent to SQS  
✅ Index service received the message  
⏳ **Currently extracting text and generating embeddings**  
❌ Not yet indexed - embeddings not in Qdrant yet  
❌ Not available for chat yet  

This usually takes:
- **Small files (< 10 pages)**: 5-30 seconds
- **Medium files (10-50 pages)**: 30-120 seconds  
- **Large files (50-200 pages)**: 2-10 minutes
- **Very large files (200+ pages)**: 10-30 minutes

---

## How to Check What's Happening

### Check file status:
```sql
SELECT file_id, file_name, status, upload_time 
FROM peakdefence 
WHERE user_id = 'admin' 
ORDER BY upload_time DESC;
```

### Check SQS queue:
```bash
# Check how many messages waiting
aws sqs get-queue-attributes --queue-url <queue-url> --attribute-names ApproximateNumberOfMessages
```

### Check index service logs:
```bash
docker logs documindai-documindai-index-1 --tail 50
```

---

## Summary

**"Processing"** is a file STATUS (database field), not a queue name.

It means:
- ✅ Upload complete  
- ⏳ Indexing in progress
- ❌ Not yet searchable in chat

The actual processing happens in the **Index Service's AsyncQueue**, which reads from **SQS Queue**.
