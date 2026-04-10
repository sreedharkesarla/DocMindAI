# Unified Processing Pipeline Page

## Overview
Replaced two separate pages ("Processing Queue" and "Indexing Status") with **one comprehensive pipeline view** that shows the complete file processing journey from upload to being ready for chat.

## What Changed

### Removed (Old Approach)
- ❌ **Processing Queue page** - Showed files by status
- ❌ **Indexing Status page** - Showed only files being indexed

### Added (New Approach)
- ✅ **Processing Pipeline page** - Unified view showing complete flow

## The Pipeline Flow

Based on the workflow documented in `QUEUE_AND_STATUS_EXPLANATION.md`, the page visualizes:

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   UPLOADED  │  ─────> │ PROCESSING  │  ─────> │   INDEXED   │
│             │         │             │         │             │
│ Files in S3 │         │ Extracting  │         │ Ready for   │
│ waiting to  │         │ text &      │         │ chat        │
│ be indexed  │         │ generating  │         │ queries     │
│             │         │ embeddings  │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
     BLUE                   YELLOW                  GREEN
```

## Features

### 1. Visual Pipeline Cards
Three interactive cards showing each stage:

- **UPLOADED (Blue)**
  - Count of files uploaded to S3
  - Waiting in queue for indexing
  - Click to expand and see files

- **PROCESSING (Yellow)**
  - Count of files currently being indexed
  - Text extraction and embedding generation in progress
  - Click to expand and see active jobs

- **INDEXED (Green)**
  - Count of files ready for chat
  - Embeddings stored in Qdrant
  - Click to expand and see completed files

### 2. Expandable File Lists
Click any stage card to see:
- Filename
- File ID (first 8 characters)
- Current status badge
- Color-coded by stage

### 3. Recent Activity Table
Shows last 20 files uploaded:
- Lists all files regardless of stage
- Shows current status for each
- Helps track file progress

### 4. Auto-Refresh
- Updates every 5 seconds automatically
- Toggle on/off with chip button
- Manual refresh available

## Implementation Details

### Backend API

**New Endpoint:** `GET /upload/pipeline-status/{user_id}`

**Response Structure:**
```json
{
  "pipeline": {
    "uploaded": {
      "count": 2,
      "files": [
        {
          "fileId": "abc123...",
          "userId": "user@example.com",
          "filename": "document.pdf",
          "status": "uploaded"
        }
      ]
    },
    "processing": {
      "count": 1,
      "files": [...]
    },
    "indexed": {
      "count": 15,
      "files": [...]
    }
  },
  "recent_files": [...],
  "total_files": 18
}
```

**Database Query:**
```sql
SELECT 
  status,
  COUNT(*) as count,
  GROUP_CONCAT(CONCAT(file_id, ':', file_name, ':', user_id) SEPARATOR ';;') as files
FROM peakdefence 
WHERE user_id = ?
GROUP BY status
```

### Frontend Component

**File:** `documindai-admin/src/pages/ProcessingPipelinePage.tsx`

**Key Features:**
- Material-UI cards for visual pipeline
- Expandable sections for each stage
- Color-coded status chips
- Auto-refresh with toggle
- Responsive grid layout

### Navigation

**Updated Files:**
- `App.tsx` - Changed route from `/queue` to `/pipeline`
- `AppShell.tsx` - Changed menu item to "Processing Pipeline" with AccountTree icon

## How to Use

### Access the Page
1. Navigate to http://localhost:3001/pipeline
2. Or click "Processing Pipeline" in the sidebar menu (tree icon)

### Understanding the View

**Stage Counts:**
- Numbers show how many files are at each stage
- Click any stage card to expand details

**File Lists:**
- Each stage shows files currently at that point in the pipeline
- Files move through stages automatically: uploaded → processing → indexed

**Recent Activity:**
- Bottom table shows your last 20 uploaded files
- See which stage each file is currently in
- Track progress of recent uploads

### Typical Flow

1. **Upload a file** through File Intake page
   - Appears in **UPLOADED** stage (blue)
   - Count increases by 1

2. **Indexing starts** (within seconds)
   - File moves to **PROCESSING** stage (yellow)
   - Count updates automatically

3. **Indexing completes** (30s - 5min depending on file size)
   - File moves to **INDEXED** stage (green)
   - Now available for chat queries

## Files Modified

### Backend (3 files)
1. **documindai-upload/config.yml**
   - Added `pipeline_status` SQL query
   - Added `recent_files` SQL query

2. **documindai-upload/aws_rds_helper.py**
   - Added `fetch_pipeline_status(user_id)` method
   - Groups files by status
   - Returns recent activity

3. **documindai-upload/api.py**
   - Added `/pipeline-status/{user_id}` endpoint

### Frontend (4 files)
1. **documindai-admin/src/pages/ProcessingPipelinePage.tsx**
   - New unified page component
   - Visual pipeline flow
   - Expandable stage sections

2. **documindai-admin/src/App.tsx**
   - Updated route from `/queue` to `/pipeline`
   - Removed IndexingStatusPage import

3. **documindai-admin/src/components/AppShell.tsx**
   - Changed menu item to "Processing Pipeline"
   - Updated icon to AccountTree

4. **documindai-admin/src/services/adminApi.ts**
   - Added `getPipelineStatus(userId)` function

## Benefits Over Old Approach

### Before (2 Separate Pages)
- ❌ Confusing: "Processing Queue" wasn't actually a queue
- ❌ Fragmented: Had to visit 2 pages to understand status
- ❌ Limited: Only showed processing, not the full journey

### Now (1 Unified Page)
- ✅ Clear: Visual flow shows exactly what happens
- ✅ Complete: See entire journey from upload to ready
- ✅ Intuitive: Click stages to drill down
- ✅ Informative: Matches the flow diagram in QUEUE_AND_STATUS_EXPLANATION.md

## Example Views

### Empty State (No Files)
```
UPLOADED: 0    →    PROCESSING: 0    →    INDEXED: 0
```

### Files Being Processed
```
UPLOADED: 2    →    PROCESSING: 1    →    INDEXED: 15
```
- 2 files waiting in queue
- 1 file actively being indexed
- 15 files ready for chat

### Click PROCESSING to See
```
╔══════════════════════════════════════╗
║ Files: Processing                    ║
║ 1 files in this stage                ║
╠══════════════════════════════════════╣
║ Filename         | File ID  | Status ║
║ document.pdf     | abc12... | 🟡     ║
╚══════════════════════════════════════╝
```

## Related Documentation

- [QUEUE_AND_STATUS_EXPLANATION.md](QUEUE_AND_STATUS_EXPLANATION.md) - Detailed flow explanation
- [REINDEXING_ISSUE_FIXED.md](REINDEXING_ISSUE_FIXED.md) - Prevented reindexing loops
- [INDEXING_STATUS_PAGE.md](INDEXING_STATUS_PAGE.md) - Previous single-purpose page (now replaced)

## Testing

### Test the Pipeline View
```powershell
# Test API endpoint
curl http://localhost:8001/upload/pipeline-status/admin@documindai.com

# Should return:
{
  "pipeline": {
    "uploaded": {"count": 0, "files": []},
    "processing": {"count": 0, "files": []},
    "indexed": {"count": 0, "files": []}
  },
  "recent_files": [],
  "total_files": 0
}
```

### Test with Real Files
1. Upload a file through File Intake
2. Navigate to Processing Pipeline page
3. Watch it move through stages:
   - Starts in UPLOADED (blue)
   - Moves to PROCESSING (yellow)
   - Finishes in INDEXED (green)

## Deployment Status

✅ **Backend:** Deployed and running
- Pipeline status API tested and working

✅ **Frontend:** Deployed and accessible
- Page built successfully
- Navigation updated
- Auto-refresh functional

✅ **All Services:** Running and healthy

---

**Implemented:** April 9, 2026  
**Status:** ✅ LIVE - Unified pipeline page replacing 2 old pages  
**Access:** http://localhost:3001/pipeline
