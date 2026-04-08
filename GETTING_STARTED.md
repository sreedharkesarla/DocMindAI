# DocuMindAI - Getting Started Guide

Welcome to DocuMindAI! This guide will help you set up and run the project from scratch.

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ **Docker Desktop** (with Docker Compose)
  - Windows: Download from [docker.com](https://www.docker.com/products/docker-desktop)
  - Verify: `docker --version` and `docker-compose --version`

- ✅ **Python 3.8+** (for cleanup scripts - optional)
  - Download from [python.org](https://www.python.org/downloads/)
  - Verify: `python --version`

- ✅ **Git** (for cloning)
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify: `git --version`

- ✅ **AWS Account** (with S3 and Bedrock access)
  - You'll need AWS Access Key ID and Secret Access Key
  - Required services: S3, SQS, Bedrock
  - Region: us-east-1 (recommended)

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/pshenok/minima-aws.git
cd minima-aws
```

### Step 2: Configure Environment Variables

Create or update the `.env` file with your AWS credentials:

```bash
# Copy the example (if .env doesn't exist)
# The .env file should already exist in the repo

# Edit .env and update these values:
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
AWS_SQS_QUEUE=your-queue-name
```

**Note:** The database credentials are already configured in `.env`:
- Database: `documindai_db`
- User: `documindai_user`
- Password: `documindai_pass`

### Step 3: Start Docker Services

```powershell
# Start all services (this will take 2-3 minutes first time)
docker-compose up -d

# Wait for services to be healthy
docker-compose ps
```

You should see all 6 services running:
- ✅ documindai-mysql (database)
- ✅ qdrant (vector database)
- ✅ documindai-upload (file upload API)
- ✅ documindai-index (document indexing)
- ✅ documindai-chat (chat API)
- ✅ documindai-admin (web interface)

### Step 4: Initialize Database

The database is automatically initialized on first startup. To verify:

```powershell
docker exec documindai-mysql mysql -uroot -proot123 -e "USE documindai_db; SHOW TABLES;"
```

You should see: `roles`, `users`, `user_roles`, and `documents` tables.

### Step 5: Access the Application

🌐 **Open your browser to:** http://localhost:3001

📧 **Login credentials:**
- **Admin:** `admin` / `Admin@123`
- **Test User:** `test` / `Test@123`
- **Operator:** `operator1` / `Test@123`
- **Viewer:** `viewer1` / `Test@123`

## 🎯 What's Available

Once logged in, you'll have access to:

### 1. **Dashboard** (Coming Soon)
   - System overview and statistics

### 2. **File Intake** (`/intake`)
   - Upload documents (PDF, TXT, DOCX, etc.)
   - View uploaded documents in grid layout
   - See S3 paths and Qdrant collections
   - Delete documents

### 3. **Ask Chat** (`/chat`)
   - Chat with your documents
   - Real-time WebSocket connection
   - Powered by AWS Bedrock (Claude Haiku)
   - Searches your indexed documents

### 4. **Users** (Admin only - Coming Soon)
   - User management
   - Role assignment

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                         │
│              http://localhost:3001                      │
└────────────────────┬────────────────────────────────────┘
                     │
              ┌──────▼──────┐
              │   Nginx     │  React Admin UI (Port 3001)
              │   Proxy     │
              └──────┬──────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
┌─────▼─────┐  ┌────▼────┐   ┌────▼─────┐
│  Upload   │  │  Index  │   │   Chat   │
│  Service  │  │ Service │   │ Service  │
│ (Port     │  │ (Port   │   │ (WebSocket)
│  8001)    │  │  8002)  │   │          │
└─────┬─────┘  └────┬────┘   └────┬─────┘
      │             │              │
      │        ┌────▼────┐    ┌────▼─────┐
      │        │  Qdrant │    │  Bedrock │
      │        │ Vector  │    │   LLM    │
      │        │   DB    │    │  (AWS)   │
      │        └─────────┘    └──────────┘
      │
┌─────▼─────┐
│   MySQL   │  User DB (Port 3307)
│  Database │
└───────────┘
      │
┌─────▼─────┐
│  AWS S3   │  File Storage
└───────────┘
```

## 📦 Services Explained

| Service | Port | Purpose |
|---------|------|---------|
| **documindai-admin** | 3001 | React web interface (your main entry point) |
| **documindai-upload** | 8001 | File upload API, authentication |
| **documindai-index** | 8002 | Document processing and indexing |
| **documindai-chat** | - | Chat WebSocket, document Q&A |
| **documindai-mysql** | 3307 | User database, document metadata |
| **qdrant** | 6333 | Vector database for embeddings |

## 🔧 Common Tasks

### View Service Logs

```powershell
# View all logs
docker-compose logs -f

# View specific service logs
docker logs documindai-documindai-admin-1 -f
docker logs documindai-documindai-upload-1 -f
docker logs documindai-documindai-chat-1 -f
```

### Restart Services

```powershell
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart documindai-admin
```

### Stop Services

```powershell
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### Rebuild After Code Changes

```powershell
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build documindai-admin

# Rebuild and restart
docker-compose up -d --build
```

### Fresh Start (Clean Everything)

```powershell
# Install cleanup dependencies
pip install -r cleanup-requirements.txt

# Run fresh start script
.\fresh-start.ps1
```

This will clean:
- All Qdrant collections
- All S3 files
- Database document records (optional)

See [FRESH_START.md](FRESH_START.md) for details.

## 🗄️ Database Access

### Access MySQL Command Line

```powershell
docker exec -it documindai-mysql mysql -uroot -proot123 documindai_db
```

### Common Database Commands

```sql
-- Show all users
SELECT user_id, username, email, is_active FROM users;

-- Show all roles
SELECT role_name, description FROM roles;

-- Show user roles
SELECT u.username, r.role_name 
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id;

-- Show documents
SELECT * FROM documents LIMIT 10;
```

## 🔍 Qdrant Vector Database

Access Qdrant dashboard at: http://localhost:6333/dashboard

View collections and vector data for debugging.

## ⚙️ Configuration Files

### `.env` - Environment Variables
- AWS credentials
- Database settings
- Service configuration

### `docker-compose.yml` - Service Orchestration
- Service definitions
- Port mappings
- Volume mounts
- Dependencies

### `init_admin_db.sql` - Database Schema
- User tables
- Role definitions
- Default users

## 🛠️ Troubleshooting

### Services Won't Start

```powershell
# Check Docker is running
docker info

# Check port conflicts
netstat -ano | findstr "3001"
netstat -ano | findstr "3307"

# View error logs
docker-compose logs
```

### Login Not Working

```powershell
# Check database is initialized
docker exec documindai-mysql mysql -uroot -proot123 -e "SELECT COUNT(*) FROM documindai_db.users;"

# Check upload service logs
docker logs documindai-documindai-upload-1 --tail 50
```

### Upload Fails

1. Check AWS credentials in `.env`
2. Verify S3 bucket exists
3. Check upload service logs
4. Verify SQS queue exists

### Chat Not Working

1. Check WebSocket connection in browser console
2. Verify Qdrant collection exists: http://localhost:6333/dashboard
3. Check chat service logs
4. Verify AWS Bedrock access

### Port Already in Use

```powershell
# Find process using port
netstat -ano | findstr "3001"

# Kill process (replace PID)
taskkill /F /PID <process_id>
```

## 📚 Additional Resources

- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md) (if exists)
- **Fresh Start Guide:** [FRESH_START.md](FRESH_START.md)
- **Docker Compose:** [docker-compose.yml](docker-compose.yml)

## 🎓 Next Steps

1. **Upload your first document:**
   - Go to File Intake
   - Click "Upload Files"
   - Select a PDF or text document
   - Wait for indexing (check logs)

2. **Chat with your documents:**
   - Go to Ask Chat
   - Type a question about your uploaded documents
   - Get AI-powered answers with sources

3. **Explore the admin interface:**
   - Check different user roles
   - View uploaded documents
   - Monitor system status

## 🔐 Security Notes

⚠️ **Important for Production:**

1. Change default passwords immediately
2. Use strong passwords (not Test@123)
3. Enable HTTPS/SSL
4. Restrict AWS IAM permissions
5. Use secrets management (not .env in production)
6. Enable database authentication
7. Configure firewall rules

## 🤝 Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Review troubleshooting section above
3. Verify all prerequisites are installed
4. Check AWS credentials and permissions

## 📝 Development

### Project Structure

```
minima-aws/
├── documindai-admin/        # React admin interface
├── documindai-upload/       # Upload service (FastAPI)
├── documindai-index/        # Indexing service (FastAPI)
├── documindai-chat/         # Chat service (FastAPI)
├── docker-compose.yml       # Service orchestration
├── .env                     # Environment variables
├── init_admin_db.sql       # Database initialization
├── clean-qdrant.py         # Qdrant cleanup script
├── clean-s3.py             # S3 cleanup script
├── fresh-start.ps1         # Complete cleanup script
└── GETTING_STARTED.md      # This file
```

---

**Ready to get started?** Follow the Quick Start section above! 🚀
