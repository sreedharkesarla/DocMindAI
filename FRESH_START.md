# Fresh Start Scripts

These scripts clean up your DocuMindAI environment for a fresh start by removing:
- All Qdrant vector collections
- All uploaded files from S3
- Optionally, all database records

## Quick Start

### Option 1: Run Everything (Recommended)

**Windows (PowerShell - Recommended):**
```powershell
.\fresh-start.ps1
```

**Windows (Command Prompt):**
```cmd
fresh-start.bat
```

This will guide you through cleaning:
1. Qdrant collections
2. S3 files
3. Database records (optional)

### Option 2: Run Individual Scripts

**Clean Only Qdrant:**
```bash
python clean-qdrant.py
```

**Clean Only S3:**
```bash
python clean-s3.py
```

## Prerequisites

1. **Python 3** - Required for running cleanup scripts
2. **Python packages:**
   ```bash
   pip install boto3 python-dotenv requests
   ```
3. **Running containers** - Make sure DocuMindAI services are running:
   ```bash
   docker-compose ps
   ```

## What Gets Deleted

### Qdrant Collections (`clean-qdrant.py`)
- Connects to Qdrant at `http://localhost:6333`
- Lists all collections
- Asks for confirmation
- Deletes all collections

### S3 Files (`clean-s3.py`)
- Connects to AWS S3 using credentials from `.env`
- Lists all files in the configured bucket/path
- Shows total count and size
- Asks for confirmation
- Deletes all files

### Database Records (optional)
- Deletes all document records from `documindai_db`
- Keeps users, roles, and permissions intact

## Safety Features

✅ **Confirmation Required** - All scripts ask for confirmation before deleting  
✅ **Preview** - Shows what will be deleted before proceeding  
✅ **Individual Control** - Run only the cleanup you need  
✅ **Error Handling** - Graceful error messages if services are unavailable  

## After Fresh Start

1. **Upload Documents**: Go to http://localhost:3001/intake
2. **Wait for Indexing**: Documents are processed automatically
3. **Start Chatting**: Use the Ask Chat tab to query your documents

## Troubleshooting

**"Python is not installed"**
- Install Python 3 from python.org
- Make sure Python is in your PATH

**"Error connecting to Qdrant"**
- Make sure containers are running: `docker-compose ps`
- Check Qdrant is accessible: http://localhost:6333/dashboard

**"Error connecting to S3"**
- Verify AWS credentials in `.env` file
- Check `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

**"Database cleanup failed"**
- Verify MySQL container is running
- Check container name: `docker ps | grep mysql`

## Notes

- These scripts do NOT delete:
  - User accounts
  - Roles and permissions
  - System configuration
  - Docker containers or images

- You can run these scripts multiple times safely
- No data is deleted without confirmation
