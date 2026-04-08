# Minima UI - Document Intelligence Frontend

React + Material-UI web application for document upload and RAG-powered chat.

## Features

- 📄 **Document Upload**: Drag-and-drop file upload with progress tracking
- 📁 **File Management**: View, select, and delete uploaded documents
- 💬 **Chat Interface**: Real-time chat with RAG context from uploaded files
- 🔄 **Auto-Refresh**: Automatic status updates for indexing progress
- 🎨 **Modern UI**: Material-UI components with responsive design
- 🔐 **Simple Auth**: User ID-based authentication for POC

## Tech Stack

- **React 18** - UI framework with functional components and hooks
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type safety
- **Material-UI 5** - Component library
- **React Router 6** - Client-side routing
- **Axios** - HTTP client for REST API
- **WebSocket** - Real-time chat communication

## Prerequisites

- Node.js 18+ and npm
- Backend services running (upload:8001, chat:8003)

## Installation

```bash
cd mnma-ui
npm install
```

## Development

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Build for Production

```bash
npm run build
npm run preview
```

## Environment Variables

Create a `.env.local` file:

```env
VITE_UPLOAD_API_URL=http://localhost:8001
VITE_CHAT_WS_URL=ws://localhost:8003
```

## Project Structure

```
mnma-ui/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ChatInput.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── FileList.tsx
│   │   ├── FileSelector.tsx
│   │   ├── FileUploadZone.tsx
│   │   ├── NotificationSnackbar.tsx
│   │   ├── StatusIndicator.tsx
│   │   └── UserLogin.tsx
│   ├── contexts/         # React Context for state
│   │   └── AppContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useChat.ts
│   │   ├── useFileList.ts
│   │   └── useFileUpload.ts
│   ├── pages/            # Main application pages
│   │   ├── ChatPage.tsx
│   │   └── DocumentsPage.tsx
│   ├── services/         # API & WebSocket services
│   │   ├── chatWebSocket.ts
│   │   └── uploadApi.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx           # Main app component with routing
│   └── main.tsx          # Application entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## Usage

### 1. Login
Enter a user ID to access the application. Your ID is stored in localStorage.

### 2. Upload Documents
- Drag and drop files or click "Browse Files"
- Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, MD, CSV
- Files are uploaded to S3 and queued for indexing
- Status changes: uploaded → processing → indexed

### 3. Chat with Documents
- Select indexed files from the file list
- Click "Chat" button to open chat interface
- Ask questions about your documents
- Context is maintained across conversation
- Multiple files can be used as context

### 4. File Management
- View all uploaded files with status
- Auto-refresh every 3 seconds to detect status changes
- Delete files that are no longer needed
- Select multiple files for batch operations

## API Integration

### Upload Service (REST)
- `POST /upload/upload_files/` - Upload files
- `GET /upload/get_files/{user_id}` - Get user's files
- `GET /upload/get_files_status/{user_id}` - Get file statuses
- `POST /upload/remove_file/` - Delete files

### Chat Service (WebSocket)
- `ws://localhost:8003/chat/{userid}/{conversation_id}/{file_ids}` - Chat endpoint
- Message format: `{ message: string }`
- Response format: `{ reporter: string, type: string, message: string }`

## Known Issues

- Concurrent WebSocket connections may have stability issues (use sequential)
- File status polling uses 3-second interval (could be optimized with WebSocket push)

## Future Enhancements

- [ ] Add file preview/download functionality
- [ ] Persist conversation history
- [ ] Add user authentication (JWT/OAuth)
- [ ] Implement real-time indexing progress via WebSocket
- [ ] Add dark mode support
- [ ] Implement caching for frequent queries
- [ ] Add conversation export feature
- [ ] Support for larger file uploads with chunking

## License

Internal project - not for public distribution.
