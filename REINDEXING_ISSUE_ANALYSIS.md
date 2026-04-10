# Reindexing Loop Issue - Root Cause Analysis & Fixes

## Problem Summary
The index service was continuously reindexing the same file (`PeopleFluent_SUITE_26.04_Control_Data_Guide.pdf`) because the SQS queue contained duplicate messages that kept being reprocessed.

## Root Causes

### 1. **No Message Deduplication**
- **Issue**: SQS standard queue doesn't have built-in deduplication
- **Impact**: If a message is sent multiple times (e.g., user uploads same file twice, or retry logic), duplicate messages accumulate in the queue
- **Location**: `documindai-upload/sqs.py` - `send_message()` method

### 2. **No File Status Checking Before Indexing**
- **Issue**: Index service doesn't check if a file has already been successfully indexed
- **Impact**: Even if a file is already indexed, it will be reprocessed if a message exists in the queue
- **Location**: `documindai-index/async_loop.py` and `documindai-index/indexer.py`

### 3. **Message Stays in Queue on Partial Failure**
- **Issue**: If indexing completes but database update fails, message is deleted but status remains incorrect, OR if an exception occurs between indexing and deletion
- **Impact**: Message may not be deleted and will be reprocessed after visibility timeout (15 minutes)
- **Location**: `documindai-index/async_loop.py` lines 56-63

### 4. **No Idempotency Protection**
- **Issue**: No unique message identifier or deduplication logic
- **Impact**: Same file can be queued multiple times with different message IDs
- **Location**: Throughout the upload/index flow

### 5. **Upload Service Sends Message Twice**
- **Issue**: Look at `documindai-upload/async_loop.py` - the `UploaderWithSQS` class AND the `Uploader` class both send messages to SQS
- **Impact**: **CRITICAL** - Every file upload sends 2 identical messages to SQS!
- **Location**: 
  - `documindai-upload/uploader.py` line 30: `sqs.send_message(self.queue_name, message)`
  - `documindai-upload/async_loop.py` line 42: `send_sqs_message(message, self.queue_name)`

## Immediate Fix Applied
✅ Stopped index service
✅ Purged SQS queue (removed all duplicate messages)
✅ Restarted index service
✅ Verified no reindexing activity

## Permanent Fixes Needed

### Fix 1: Remove Duplicate SQS Message Sending (CRITICAL)
**File**: `documindai-upload/async_loop.py`

Remove the `send_sqs_message` call from `UploaderWithSQS.upload()` since `Uploader.upload()` already sends the message.

### Fix 2: Add File Status Check Before Indexing
**File**: `documindai-index/async_loop.py`

Before indexing, check if file status is already "indexed" in the database. Skip if already processed.

### Fix 3: Store Processing State in Database
**File**: `documindai-index/indexer.py`

Add a check: if file status is "processing" or "indexed", skip reindexing.

### Fix 4: Use FIFO Queue with Deduplication
**File**: `documindai-upload/sqs.py` and environment variables

Change from standard queue to FIFO queue with content-based deduplication to prevent duplicate messages naturally.

### Fix 5: Add MessageDeduplicationId
**File**: `documindai-upload/sqs.py`

When sending messages, include file_id as MessageDeduplicationId to prevent duplicates within 5-minute window.

### Fix 6: Improve Error Handling
**File**: `documindai-index/async_loop.py`

Wrap the entire process (indexing + deletion) in a transaction-like pattern. Only delete message after confirming database status update succeeded.

## Implementation Priority

1. **CRITICAL** - Remove duplicate SQS message sending (Fix 1)
2. **HIGH** - Add file status check before indexing (Fix 2)
3. **HIGH** - Improve error handling (Fix 6)
4. **MEDIUM** - Add deduplication ID (Fix 5)
5. **LOW** - Migrate to FIFO queue (Fix 4) - requires infrastructure change

## Testing Checklist

After implementing fixes:
- [ ] Upload same file twice - verify only processed once
- [ ] Simulate indexing failure - verify message is retried correctly
- [ ] Simulate database failure - verify message stays in queue
- [ ] Check SQS queue after uploads - verify only 1 message per file
- [ ] Monitor for 1 hour - verify no reindexing loops
- [ ] Test with large PDF (100+ pages) - verify no timeout issues
