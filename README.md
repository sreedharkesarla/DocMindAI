<p align="center">
  <h1 align="center">DocuMindAI</h1>
  <p align="center">Intelligent Document Search & Chat Platform</p>
</p>

---

## 🚀 Quick Start

**New to DocuMindAI?** 👉 **[Read the Getting Started Guide](GETTING_STARTED.md)**

The Getting Started guide provides step-by-step instructions for:
- Installing prerequisites
- Configuring AWS credentials
- Starting Docker services
- Accessing the admin interface
- Uploading and chatting with documents

**Already set up?** Login at: **http://localhost:3001** (admin / Admin@123)

---

## 📖 Documentation

| Guide | Description |
|-------|-------------|
| **[Getting Started](GETTING_STARTED.md)** | Complete setup guide from clone to running application |
| **[Setup Checklist](SETUP_CHECKLIST.md)** | Step-by-step checklist to verify your setup |
| **[Quick Reference](QUICK_REFERENCE.md)** | Common commands, URLs, and troubleshooting |
| **[Fresh Start](FRESH_START.md)** | How to clean Qdrant and S3 for a fresh start |

---

# 🚀 DocuMindAI – AI-Powered Document Intelligence

**DocuMindAI** is an advanced **Retrieval-Augmented Generation (RAG)** platform that integrates with **AWS services**, including **S3, SQS, RDS**, and **AWS Bedrock** for embedding models and LLMs. This solution enables intelligent document search and AI-powered chat interactions with your indexed data.

---

## 🏗️ Architecture Overview

DocuMindAI consists of **6 microservices** working together:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  Admin Console   │              │   Public UI      │        │
│  │ (documindai-     │              │ (documindai-ui/) │        │
│  │    admin/)       │              │                  │        │
│  └──────────────────┘              └──────────────────┘        │
└────────────────────┬────────────────────────┬───────────────────┘
                     │                        │
              HTTP/REST + WebSocket          │
                     │                        │
┌────────────────────┴────────────────────────┴───────────────────┐
│                    BACKEND SERVICES                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │documindai- │  │documindai- │  │documindai- │                │
│  │  upload    │  │   index    │  │   chat     │                │
│  │  :8001     │  │  :8002     │  │  (internal)│                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────┬────────────────┬────────────────┬─────────────────────┘
          │                │                │
┌─────────┴────────────────┴────────────────┴─────────────────────┐
│              DATA & STORAGE LAYER                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ AWS SQS  │  │  AWS S3  │  │  Qdrant  │  │  MySQL   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└──────────────────────────────────────────────────────────────────┘
          │                                   │
┌─────────┴───────────────────────────────────┴───────────────────┐
│                      AWS BEDROCK                                 │
│  ┌────────────────────────┐  ┌────────────────────────┐        │
│  │ Titan Text Embeddings  │  │  Claude 3 Haiku        │        │
│  │  (1536 dimensions)     │  │  (Conversational AI)   │        │
│  └────────────────────────┘  └────────────────────────┘        │
└──────────────────────────────────────────────────────────────────┘
```

**Services:**
1. **documindai-upload** (Port 8001) - File upload, authentication, S3 storage, job queuing
2. **documindai-index** (Port 8002) - Document processing, embedding, vector indexing
3. **documindai-chat** (Internal) - WebSocket-based RAG chat with streaming responses
4. **Qdrant** (Port 6333) - Vector database for semantic search
5. **MySQL** (Port 3307) - User database, document metadata

**UI:**
- **documindai-admin** (Port 3001) - React admin interface with Material-UI
- **documindai-ui** - Public-facing document chat interface

---

## 🌐 How It Works

DocuMindAI operates as a set of containerized services that work together to:

1. 📤 **Upload & Process** - Documents uploaded to **AWS S3**, metadata stored in **MySQL**
2. 🔍 **Index & Embed** - Documents chunked and embedded using **AWS Bedrock Titan** (1536-dim vectors)
3. 🗄️ **Vector Storage** - Embeddings stored in **Qdrant** for semantic search
4. 💬 **RAG Chat** - **Claude 3 Haiku** answers questions using retrieved document context
5. ⚡ **Async Processing** - **SQS queue** handles indexing jobs asynchronously

---

## 🏗️ Prerequisites: Setting Up AWS Services

### ✅ **Required AWS Resources**
- 🪣 **Amazon S3** – Store and retrieve documents. (before running application create dir 'upload' inside bucket)
- 📩 **Amazon SQS** – Handle document processing requests.
- 🛢️ **Amazon RDS (PostgreSQL/MySQL)** – Store metadata about indexed documents.
- 🤖 **AWS Bedrock** – Used for:
  - **LLMs (Chat models)**
  - **Embedding models (Vector representation of documents)**

---

## 🔧 Environment Variables

Before running the application, ensure you have a `.env` file in the **project root directory** with the following variables:

```ini
# AWS Credentials & Services
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_FILES_PATH=TM

# SQS Configuration
AWS_SQS_QUEUE=your_sqs_queue_name

# Local File Storage
LOCAL_FILES_PATH=/tmp/uploads

# Database Configuration (MySQL)
RDS_DB_INSTANCE=mysql
RDS_DB_NAME=documindai_db
RDS_DB_USER=documindai_user
RDS_DB_PASSWORD=documindai_pass
RDS_DB_PORT=3306
MYSQL_ROOT_PASSWORD=root123

# Vector Search Configuration (Qdrant)
QDRANT_BOOTSTRAP=qdrant
QDRANT_COLLECTION=documindai_collection

# AWS Bedrock - Embedding & LLM Models
EMBEDDING_MODEL_ID=amazon.titan-embed-text-v1
EMBEDDING_SIZE=1536
CHAT_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

### 📝 Key Configuration:

- **`EMBEDDING_MODEL_ID`** → AWS Bedrock embedding model for document vectorization
- **`CHAT_MODEL_ID`** → AWS Bedrock LLM for answering user queries (Claude 3 Haiku)
- **`RDS_DB_NAME`** → Database name (documindai_db by default)
- **Database Credentials** → Pre-configured for local Docker setup

---

## Example (CHAT_MODEL_ID)

```
arn:aws:bedrock:us-west-2:123456789012:model/anthropic.claude-3-sonnet-20240229-v1:0
```

## Components Breakdown

| Component | Example | Description |
|-----------|---------|-------------|
| Service Prefix | `arn:aws:bedrock:` | Fixed prefix for all AWS Bedrock ARNs |
| Region | `us-west-2` | AWS region where the model is deployed |
| Account ID | `123456789012` | Your AWS account ID |
| Resource Type | `model/` | Identifier for the type of resource |
| Model ID | `anthropic.claude-3-sonnet-20240229-v1:0` | Full model identifier |

The Model ID consists of:
- Provider: `anthropic`
- Model name: `claude-3-sonnet-20240229-v1`
- Version: `0`

## Building Your Own ARN

To create your own AWS Bedrock ARN, replace the components with your specific values:

1. Use your desired AWS region
2. Insert your actual AWS account ID
3. Select the appropriate model ID from **available** Bedrock models

---

## 🐳 Running Minima AWS with Docker Compose

Once the `.env` file is set up, deploy the application using **Docker Compose**:

```bash
docker compose up --build
```

This will start all required services in separate containers.

---

## 🔧 Services Overview

The system consists of multiple microservices, each running as a **Docker container**.

| **Service**       | **Port** | **Description** |
|------------------|----------|---------------|
| `qdrant`        | 6333, 6334 | Vector storage for document embeddings. |
| `mnma-upload`   | 8001 | Uploads and processes documents from AWS S3. |
| `mnma-index`    | 8002 | Extracts embeddings (using AWS Bedrock) and indexes documents into Qdrant. |
| `mnma-chat`     | 8003 | Uses an AWS Bedrock LLM to respond to queries based on indexed documents. |
| `mnma-ui`       | 3000 | React web interface for document upload and chat. |

---

## 📤 Uploading Files to Minima AWS

### 1️⃣ **Upload Files via cURL**
Use the following `curl` command to upload a file to Minima AWS:

```bash
curl -X 'POST' \
  'http://localhost:8001/upload/upload_files/?user_id=4637951a-7b45-4af4-805c-1f1c471668f3' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'files=@example.pdf;type=application/pdf'
```

### 2️⃣ **API Endpoint Details**
- **URL:** `http://localhost:8001/upload/upload_files/`
- **Method:** `POST`
- **Query Parameter:** `user_id` (Required)
- **Headers:**
  - `accept: application/json`
  - `Content-Type: multipart/form-data`
- **Body:** A file (e.g., `example.pdf`)

### 3️⃣ **Expected Server Response (JSON)**
```json
{
  "files": [
    {
      "user_id": "4637951a-7b45-4af4-805c-1f1c471668f3",
      "file_id": "52f206e1-26f7-4b62-84d2-7f9bac19400d",
      "file_path": "uploads/example.pdf",
      "filename": "example.pdf"
    }
  ]
}
```

### 4️⃣ **Uploading via Swagger UI**
1. Open **Swagger UI** in your browser:

   👉 **[http://localhost:8001/upload/docs#/default/upload_files_upload_upload_files__post](http://localhost:8001/upload/docs#/default/upload_files_upload_upload_files__post)**

2. Select **POST `/upload/upload_files/`**.
3. Enter your **`user_id`** (e.g., `4637951a-7b45-4af4-805c-1f1c471668f3`).
4. Upload your file (e.g., `Black.pdf`).
5. Click **"Execute"** to send the request.

---

## �️ Minima Web UI

Minima now includes a **React-based web interface** for easy document upload and chat interaction!

### 🚀 **Quick Start**

1. **Start all services (including UI)**:
   ```bash
   docker compose up --build
   ```

2. **Access the UI**:
   - Open your browser to **http://localhost:3000**

3. **Login**:
   - Enter any user ID (e.g., `test-user`)
   - Your ID is stored in localStorage

4. **Upload Documents**:
   - Drag and drop files or click "Browse Files"
   - Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, MD, CSV
   - Watch as files progress: uploaded → processing → indexed

5. **Chat with Your Documents**:
   - Select indexed files from the list
   - Click "Chat" button
   - Ask questions about your documents
   - Context is maintained across the conversation

### 📱 **Features**

- ✨ **Modern Material-UI design**
- 📤 **Drag-and-drop file upload** with progress tracking
- 📁 **File management** - view, select, delete files
- 💬 **Real-time chat** with WebSocket connection
- 🔄 **Auto-refresh** of file indexing status
- 🎨 **Responsive design** for mobile and desktop
- 🔔 **Toast notifications** for all actions

### 🛠️ **Running UI in Development**

If you prefer to run the UI separately:

```bash
cd mnma-ui
npm install
npm run dev
```

The UI will be available at http://localhost:3000

For more details, see [mnma-ui/README.md](mnma-ui/README.md)

---

## 📡 Alternative: Using WebSocket with Websocat

For advanced users or debugging, you can still interact with the chat service directly using **`websocat`**:

### 🔹 **Install Websocat**
**MacOS:**
```bash
brew install websocat
```
**Linux:**
```bash
sudo apt install websocat
```
**Windows:**
Download from: [**Websocat Releases**](https://github.com/vi/websocat/releases)

---

### 🔹 **Connect to the Chat**
```bash
websocat ws://localhost:8003/chat/{user-id}/{chat-name}/{file-id},{other-file-id}
```
- Replace `{user-id}` with **your user ID**.
- Replace `{file-id}` with **the file IDs** you want to search within.
- You can list **multiple files** using commas.

---

### ✅ **Example**
```bash
websocat ws://localhost:8003/chat/4637951a-7b45-4af4-805c-1f1c471668f3/minima-chat/67890,54321
```
This command initiates a **chat session** with files **67890** and **54321** for **user `4637951a-7b45-4af4-805c-1f1c471668f3`**.

---

## 📜 License

DocuMindAI is licensed under the **Mozilla Public License v2.0 (MPLv2)**.

📌 **GitHub Repository:** [DocuMindAI](https://github.com/pshenok/DocuMindAI)

---

## 📞 Need Help?

- ❓ **Issues?** Open a [GitHub Issue](https://github.com/pshenok/DocuMindAI/issues).
- 💬 **Questions?** Contact us via **GitHub Discussions**.


