# DocuMindAI - First Time Setup Checklist

Use this checklist to ensure you've completed all setup steps correctly.

## ✅ Pre-Setup Checklist

- [ ] Docker Desktop installed and running
- [ ] Docker version: `docker --version` (20.10+)
- [ ] Docker Compose version: `docker-compose --version` (1.29+)
- [ ] Python 3.8+ installed (optional, for cleanup scripts)
- [ ] Git installed
- [ ] AWS Account created
- [ ] AWS Access Key obtained
- [ ] AWS Secret Access Key obtained

## ✅ AWS Setup Checklist

- [ ] S3 bucket created
- [ ] S3 bucket has `TM/` folder (or will be created automatically)
- [ ] SQS queue created (standard queue)
- [ ] SQS queue name noted
- [ ] Bedrock access enabled in AWS region (us-east-1 recommended)
- [ ] Bedrock model access granted:
  - [ ] Amazon Titan Text Embeddings
  - [ ] Claude 3 Haiku
- [ ] IAM user has permissions:
  - [ ] S3 read/write
  - [ ] SQS send/receive
  - [ ] Bedrock invoke model

## ✅ Project Setup Checklist

Git Clone:
- [ ] Repository cloned: `git clone https://github.com/pshenok/minima-aws.git`
- [ ] Changed to project directory: `cd minima-aws`

Environment Configuration:
- [ ] `.env` file exists in project root
- [ ] `AWS_ACCESS_KEY_ID` set in `.env`
- [ ] `AWS_SECRET_ACCESS_KEY` set in `.env`
- [ ] `AWS_BUCKET_NAME` set to your S3 bucket name
- [ ] `AWS_SQS_QUEUE` set to your queue name
- [ ] `AWS_DEFAULT_REGION` set (default: us-east-1)
- [ ] Database credentials reviewed (defaults are fine for local)

Docker Services:
- [ ] Built services: `docker-compose build`
- [ ] Started services: `docker-compose up -d`
- [ ] All 6 services running: `docker-compose ps`
  - [ ] documindai-mysql (healthy)
  - [ ] qdrant (up)
  - [ ] documindai-upload (up)
  - [ ] documindai-index (up)
  - [ ] documindai-chat (up)
  - [ ] documindai-admin (up)

## ✅ Verification Checklist

Service Access:
- [ ] Admin UI loads: http://localhost:3001
- [ ] Can login with: admin / Admin@123
- [ ] Dashboard page loads
- [ ] File Intake page loads
- [ ] Ask Chat page loads

Database:
- [ ] Can connect to MySQL: 
  ```
  docker exec documindai-mysql mysql -uroot -proot123 documindai_db -e "SHOW TABLES;"
  ```
- [ ] Tables exist: users, roles, user_roles, documents
- [ ] Users exist: 
  ```
  docker exec documindai-mysql mysql -uroot -proot123 documindai_db -e "SELECT username FROM users;"
  ```

Qdrant:
- [ ] Qdrant dashboard loads: http://localhost:6333/dashboard
- [ ] Can view collections (may be empty initially)

## ✅ Test Upload Checklist

First Document Upload:
- [ ] Logged into admin UI
- [ ] Navigated to "File Intake"
- [ ] Clicked "Upload Files"
- [ ] Selected a test document (PDF, TXT, or DOCX)
- [ ] Upload succeeded (no error message)
- [ ] Document appears in grid view
- [ ] Document status shows "processing" or "indexed"

Check Logs:
- [ ] Upload service logs show file received:
  ```
  docker logs documindai-documindai-upload-1 --tail 20
  ```
- [ ] Index service logs show processing:
  ```
  docker logs documindai-documindai-index-1 --tail 20
  ```
- [ ] No error messages in logs

Verify S3:
- [ ] Document appears in S3 bucket under `TM/` folder
- [ ] Can view file in S3 console

Verify Qdrant:
- [ ] New collection appears in Qdrant dashboard
- [ ] Collection has documents (vectors)
- [ ] Point count > 0

## ✅ Test Chat Checklist

First Chat Interaction:
- [ ] Navigated to "Ask Chat"
- [ ] Connection status shows "Connected"
- [ ] Typed a question about uploaded document
- [ ] Received AI response
- [ ] Response references uploaded document
- [ ] Can see conversation history

Check WebSocket:
- [ ] Browser console shows no WebSocket errors
- [ ] Chat service logs show connection:
  ```
  docker logs documindai-documindai-chat-1 --tail 20
  ```

## ✅ Troubleshooting Completed

If you encountered issues, verify you completed these:

Login Issues:
- [ ] Checked upload service logs for authentication errors
- [ ] Verified database has user records
- [ ] Password hash is 60 characters (bcrypt)

Upload Issues:
- [ ] AWS credentials are correct
- [ ] S3 bucket exists and is accessible
- [ ] SQS queue exists
- [ ] Upload service logs show no AWS errors

Index Issues:
- [ ] Bedrock access is enabled
- [ ] Embedding model access granted
- [ ] Index service logs show no model access errors
- [ ] SQS queue has messages

Chat Issues:
- [ ] WebSocket connection established
- [ ] Qdrant collection exists
- [ ] Qdrant has indexed documents
- [ ] Bedrock LLM access granted
- [ ] Chat service logs show no errors

## ✅ Optional Setup

Cleanup Scripts:
- [ ] Installed Python packages: `pip install -r cleanup-requirements.txt`
- [ ] Tested Qdrant cleanup: `python clean-qdrant.py`
- [ ] Tested S3 cleanup: `python clean-s3.py`
- [ ] Tested fresh start: `.\fresh-start.ps1`

Development:
- [ ] Node.js installed (for local UI development)
- [ ] Can run admin UI in dev mode: `cd documindai-admin && npm run dev`

## 🎉 Setup Complete!

If all checkboxes are marked, your DocuMindAI setup is complete!

### Next Steps:
1. Upload more documents
2. Test different types of documents (PDF, TXT, DOCX)
3. Explore chat with different questions
4. Try different user roles (test, operator1, viewer1)
5. Review logs to understand the workflow
6. Customize configuration as needed

### Resources:
- [Getting Started Guide](GETTING_STARTED.md) - Detailed instructions
- [Quick Reference](QUICK_REFERENCE.md) - Common commands
- [Fresh Start Guide](FRESH_START.md) - Clean and reset
- [README](README.md) - Project overview

### Need Help?
- Check service logs: `docker-compose logs -f`
- Review troubleshooting section in [GETTING_STARTED.md](GETTING_STARTED.md)
- Verify all checklist items above

---

**Happy Document Chatting! 🚀**
