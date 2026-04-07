# 🚀 Deployment Guide - Minima AWS

Complete guide for deploying the Minima AWS RAG system.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Docker)](#backend-deployment-docker)
3. [UI Deployment Options](#ui-deployment-options)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- [x] Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- [x] Docker Compose v2+
- [x] MySQL 8.0 (local or RDS)
- [x] AWS account with Bedrock access
- [ ] Node.js 18+ (only for local UI development)

### AWS Setup
1. **IAM Permissions**:
   - AmazonS3FullAccess
   - AmazonSQSFullAccess
   - AmazonTextractFullAccess
   - AmazonBedrockFullAccess (or custom policy for Titan + Claude)

2. **Bedrock Model Access**:
   - Go to AWS Console → Bedrock → Model Access
   - Request access to:
     - Amazon Titan Text Embeddings v1
     - Claude 3 Haiku

3. **AWS Resources**:
   ```bash
   # Create S3 bucket
   aws s3 mb s3://your-bucket-name
   aws s3api put-object --bucket your-bucket-name --key upload/
   
   # Create SQS queue
   aws sqs create-queue --queue-name your-queue-name
   ```

### Database Setup
```sql
-- Create MySQL database
CREATE DATABASE minima_db;
CREATE USER 'minima_user'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON minima_db.* TO 'minima_user'@'%';
FLUSH PRIVILEGES;
```

---

## Backend Deployment (Docker)

### Step 1: Clone Repository
```bash
git clone https://github.com/pshenok/minima-aws.git
cd minima-aws
```

### Step 2: Configure Environment

Create `.env` file in root directory:

```env
# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_DEFAULT_REGION=us-east-1

# AWS Services
AWS_BUCKET_NAME=your-s3-bucket
AWS_FILES_PATH=upload
AWS_SQS_QUEUE=your-sqs-queue

# Database Configuration
RDS_DB_INSTANCE=host.docker.internal  # For local MySQL
RDS_DB_NAME=minima_db
RDS_DB_USER=minima_user
RDS_DB_PASSWORD=your_password
RDS_DB_PORT=3306

# Vector Database
QDRANT_BOOTSTRAP=qdrant
QDRANT_COLLECTION=test

# AWS Bedrock Models
EMBEDDING_MODEL_ID=amazon.titan-embed-text-v1
EMBEDDING_SIZE=1536
CHAT_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# Local Storage
LOCAL_FILES_PATH=/tmp
```

### Step 3: Build and Start Services

**Option A: Start All Services (Recommended)**
```bash
docker compose up --build
```

**Option B: Start in Background**
```bash
docker compose up -d --build
```

**Option C: Start Specific Services**
```bash
# Backend only (no UI)
docker compose up -d qdrant mnma-upload mnma-index mnma-chat
```

### Step 4: Verify Services

Wait 30-60 seconds for services to initialize, then check:

```bash
# Check running containers
docker ps

# Expected output:
# - qdrant (ports 6333, 6334)
# - mnma-upload (port 8001)
# - mnma-index (port 8002)
# - mnma-chat (port 8003)
# - mnma-ui (port 3000) - if included

# Test APIs
curl http://localhost:8001/upload/docs  # Upload API
curl http://localhost:8003/docs         # Chat API
curl http://localhost:6333/dashboard    # Qdrant Dashboard
```

### Step 5: Check Logs

```bash
# View all logs
docker compose logs

# View specific service
docker compose logs mnma-upload
docker compose logs mnma-index
docker compose logs mnma-chat

# Follow logs in real-time
docker compose logs -f
```

---

## UI Deployment Options

### Option 1: Simple Test UI (Fastest)

The simplest way to test the system:

```bash
# Open test UI in browser
Invoke-Item test-ui.html  # Windows PowerShell

# Or manually:
# Double-click test-ui.html in File Explorer
# Or drag to browser
```

**Features**:
- ✅ File upload
- ✅ File list with status
- ✅ WebSocket chat
- ✅ No installation required
- ✅ Works immediately

---

### Option 2: Full React UI (Local Development)

Run the full React application locally (bypasses Docker build issues):

#### Prerequisites
Install Node.js 18+ from https://nodejs.org

#### Steps
```bash
# 1. Navigate to UI directory
cd minima-aws/mnma-ui

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:3000
```

#### Build for Production
```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

**Features**:
- ✅ Professional Material-UI design
- ✅ Advanced state management
- ✅ File upload with progress
- ✅ Auto-refresh file status
- ✅ Real-time WebSocket chat
- ✅ Responsive design
- ✅ Toast notifications
- ✅ TypeScript + Type safety

---

### Option 3: Full React UI (Docker) - When npmbuild completes

If Docker build completes successfully:

```bash
# Start UI with backend
docker compose up -d mnma-ui

# Or start all services including UI
docker compose up -d

# Access at http://localhost:3000
```

**Note**: Docker build includes `npm install` which may take 5-15 minutes depending on network speed.

---

## Verification

### 1. Backend Health Check

```bash
# Test Upload API
curl http://localhost:8001/upload/docs

# Test file list (replace USER_ID)
curl http://localhost:8001/upload/get_files/test-user

# Test Qdrant
curl http://localhost:6333/collections/test
```

### 2. Upload Test File

```bash
# Upload a test file
curl -X POST "http://localhost:8001/upload/upload_files/?user_id=test-user" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@sample.pdf"
```

### 3. Check Indexing Progress

```bash
# Check file status every few seconds
curl http://localhost:8001/upload/get_files/test-user

# Should show: uploaded → processing → indexed (takes 10-30 seconds)
```

### 4. Test Chat

Use one of the UIs or test with Python:

```bash
# Using existing test script
python test_chat.py
```

Or use WebSocket tool like `websocat`:

```bash
websocat ws://localhost:8003/chat/test-user/conv-001/

# Then type questions and press Enter
```

---

## Troubleshooting

### Issue: Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :8001  # Windows
lsof -i :8001                 # Linux/Mac

# Change ports in docker-compose.yml if needed
# Or stop conflicting service
docker compose down
```

### Issue: Database Connection Failed

```bash
# Verify MySQL is running
mysql -h localhost -u minima_user -p minima_db

# Check connection from container
docker exec minima-aws-mnma-upload-1 ping host.docker.internal

# For Docker on Linux, use:
# host.docker.internal → 172.17.0.1 or your host IP
```

### Issue: AWS Bedrock Access Denied

1. Verify IAM permissions
2. Check model access in AWS Console
3. Verify correct model IDs in .env:
   - `EMBEDDING_MODEL_ID=amazon.titan-embed-text-v1`
   - `CHAT_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0`

### Issue: Files Stuck in "uploaded" Status

```bash
# Check index service logs
docker logs minima-aws-mnma-index-1

# Common causes:
# - SQS queue not configured
# - Textract permissions missing
# - Embedding model not accessible

# Restart index service
docker compose restart mnma-index
```

### Issue: WebSocket Connection Fails

```bash
# Verify chat service is running
docker ps | grep chat

# Check chat logs
docker logs minima-aws-mnma-chat-1

# Test connection
curl http://localhost:8003/docs

# Try reconnecting from UI
```

### Issue: Docker UI Build Taking Too Long

The React UI Docker build includes `npm install` which can take 5-15 minutes.

**Solutions**:
1. **Use local development** (Option 2 above) - Fastest
2. **Wait for build** - It will complete eventually
3. **Use simple test UI** (Option 1) - No build needed

```bash
# Check build progress
docker compose logs mnma-ui

# If stuck >15 minutes, cancel and rebuild
# Ctrl+C
docker compose build --no-cache mnma-ui
```

### Issue: CORS Errors in Browser

Backend already has CORS enabled. If still seeing errors:

```bash
# Verify CORS in upload service logs
docker logs minima-aws-mnma-upload-1 | grep CORS

# Chat service already has CORS middleware
docker logs minima-aws-mnma-chat-1 | grep CORS
```

---

## Production Deployment

### Recommended Changes for Production

1. **Use AWS RDS** instead of local MySQL
2. **Enable HTTPS** with SSL certificates
3. **Add Authentication** (JWT or AWS Cognito)
4. **Implement Rate Limiting**
5. **Set up CloudWatch Logging**
6. **Use AWS Secrets Manager** for credentials
7. **Deploy UI to S3 + CloudFront**
8. **Set up Auto-scaling** for backend services
9. **Implement Backup Strategy**
10. **Add Monitoring Dashboards** (Grafana/CloudWatch)

### Example: AWS ECS Deployment

```yaml
# Use AWS ECS Fargate for containers
# Use AWS RDS for MySQL
# Use AWS CloudFront for UI
# Use AWS ALB for load balancing
```

---

## Scaling Considerations

### Horizontal Scaling
- Use container orchestration (ECS, EKS, or Kubernetes)
- Multiple instances of upload/index/chat services
- Load balancer for traffic distribution

### Database Scaling
- RDS with read replicas
- Database connection pooling (already implemented)
- Consider Aurora for better scalability

### Vector Database Scaling
- Qdrant cluster mode
- Separate collection per user or per project

### Cost Optimization
- Monitor Bedrock API calls
- Implement caching for frequent queries
- Use reserved instances for predictable workloads

---

## Monitoring

### Key Metrics to Monitor

1. **Request Metrics**:
   - Upload rate
   - Indexing rate
   - Chat queries per minute

2. **Performance Metrics**:
   - Average response time
   - P95/P99 latency
   - Error rate

3. **Resource Metrics**:
   - CPU usage
   - Memory usage
   - Disk I/O

4. **Business Metrics**:
   - Total files indexed
   - Active users
   - Average conversation length

---

## Backup and Recovery

### Database Backup
```bash
# Backup MySQL database
docker exec minima-aws-mnma-upload-1 mysqldump \
  -h host.docker.internal \
  -u minima_user \
  -p minima_db > backup.sql

# Restore
mysql -h localhost -u minima_user -p minima_db < backup.sql
```

### Qdrant Backup
```bash
# Backup Qdrant data
docker cp qdrant:/qdrant/storage ./qdrant_backup

# Restore
docker cp ./qdrant_backup/. qdrant:/qdrant/storage
docker restart qdrant
```

---

## Support

### Resources
- **Documentation**: [README.md](README.md)
- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)
- **Testing Report**: [TESTING_REPORT.md](TESTING_REPORT.md)
- **UI Setup**: [mnma-ui/SETUP_INSTRUCTIONS.md](mnma-ui/SETUP_INSTRUCTIONS.md)

### Getting Help
- **GitHub Issues**: https://github.com/pshenok/minima-aws/issues
- **Logs**: Check Docker logs for detailed error messages
- **AWS Support**: For Bedrock or other AWS service issues

---

**Last Updated**: April 6, 2026  
**Version**: 1.0  
**Status**: Production Ready for POC ✅
