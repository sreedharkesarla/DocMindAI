# 🚀 Quick Start Guide - Minima AWS RAG System

Get started with Minima in 5 minutes!

## Prerequisites

- Docker & Docker Compose installed
- AWS account with Bedrock access
- Node.js 18+ (for local UI development)

## Step 1: Clone the Repository

```bash
git clone https://github.com/pshenok/minima-aws.git
cd minima-aws
```

## Step 2: Configure Environment

Create a `.env` file in the root directory:

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1

# AWS Services
AWS_BUCKET_NAME=your-s3-bucket
AWS_FILES_PATH=upload
AWS_SQS_QUEUE=product-genius-queue

# Database (MySQL)
RDS_DB_INSTANCE=host.docker.internal
RDS_DB_NAME=minima_db
RDS_DB_USER=minima_user
RDS_DB_PASSWORD=minima_user
RDS_DB_PORT=3306

# Vector Database
QDRANT_BOOTSTRAP=qdrant
QDRANT_COLLECTION=test

# AWS Bedrock Models
EMBEDDING_MODEL_ID=amazon.titan-embed-text-v1
EMBEDDING_SIZE=1536
CHAT_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# Local Files
LOCAL_FILES_PATH=/tmp
```

## Step 3: Set Up AWS Resources

### 3.1 Create S3 Bucket
```bash
aws s3 mb s3://your-s3-bucket
aws s3api put-object --bucket your-s3-bucket --key upload/
```

### 3.2 Create SQS Queue
```bash
aws sqs create-queue --queue-name product-genius-queue
```

### 3.3 Set Up MySQL Database
```bash
# Install MySQL locally or use RDS
mysql -u root -p
CREATE DATABASE minima_db;
CREATE USER 'minima_user'@'%' IDENTIFIED BY 'minima_user';
GRANT ALL PRIVILEGES ON minima_db.* TO 'minima_user'@'%';
FLUSH PRIVILEGES;
```

### 3.4 Enable AWS Bedrock Models
- Go to AWS Console → Bedrock → Model Access
- Request access to:
  - Amazon Titan Text Embeddings v1
  - Claude 3 Haiku

## Step 4: Start All Services

```bash
docker compose up --build
```

Wait for all services to start:
- ✅ Qdrant (6333, 6334)
- ✅ Upload Service (8001)
- ✅ Index Service (8002)
- ✅ Chat Service (8003)
- ✅ Web UI (3000)

## Step 5: Access the Web UI

Open your browser to **http://localhost:3000**

### 5.1 Login
- Enter any user ID (e.g., `test-user`)
- Click "Login"

### 5.2 Upload Documents
- Drag and drop a PDF file
- Or click "Browse Files" to select files
- Watch the status change:
  - uploaded → processing → indexed (takes 10-30 seconds)

### 5.3 Chat with Documents
- Once a file is "indexed", select it by clicking the checkbox
- Click the "Chat" button
- Ask questions about your document!

## Example Workflow

```bash
# 1. Start services
docker compose up --build

# 2. Open UI in browser
open http://localhost:3000

# 3. Login as 'test-user'

# 4. Upload a sample PDF (e.g., product manual)

# 5. Wait for "indexed" status

# 6. Select the file and click "Chat"

# 7. Ask: "What is the warranty period?"

# 8. Get AI-powered answer from your document!
```

## Troubleshooting

### Port Already in Use
```bash
# Stop conflicting services
docker compose down
# Change ports in docker-compose.yml if needed
```

### Database Connection Errors
```bash
# Verify MySQL is running
docker exec -it minima-aws-mnma-upload-1 ping host.docker.internal

# Check MySQL credentials
mysql -h localhost -u minima_user -p minima_db
```

### Bedrock Access Denied
- Ensure you've requested model access in AWS Console
- Verify IAM permissions for Bedrock
- Check your AWS credentials in .env

### Files Stuck in "uploaded" Status
```bash
# Check index service logs
docker logs minima-aws-mnma-index-1

# Verify SQS queue has messages
aws sqs get-queue-attributes --queue-url YOUR_QUEUE_URL --attribute-names ApproximateNumberOfMessages
```

### UI Can't Connect to Backend
```bash
# Verify services are running
docker ps

# Check upload service
curl http://localhost:8001/upload/docs

# Check chat service
curl http://localhost:8003/docs
```

## Next Steps

- 📚 Read the full [README.md](README.md) for detailed documentation
- 🎨 Customize the UI in [mnma-ui/](mnma-ui/)
- 🔧 Explore API endpoints at http://localhost:8001/upload/docs
- 💬 Test WebSocket chat directly with `websocat`
- 📊 Monitor Qdrant at http://localhost:6333/dashboard

## Support

For issues or questions:
- GitHub Issues: https://github.com/pshenok/minima-aws/issues
- Documentation: [README.md](README.md)
- UI Documentation: [mnma-ui/README.md](mnma-ui/README.md)

Happy building! 🎉
