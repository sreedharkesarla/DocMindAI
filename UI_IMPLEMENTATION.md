# UI Implementation Guide

## 📱 User Interface Overview

Minima AWS provides **two UI options** to interact with the RAG system:

1. **Simple HTML Test UI** (`test-ui.html`) - Lightweight, zero-dependencies
2. **Professional React UI** (`mnma-ui/`) - Production-ready enterprise application

---

## 🎯 Option 1: Simple HTML Test UI

### Features
- ✅ **Zero Dependencies** - Pure HTML/CSS/JavaScript
- ✅ **Instant Launch** - No build process required
- ✅ **Local Storage** - Remembers logged-in user
- ✅ **4 Tabs Interface** - Login → Upload → Files → Chat
- ✅ **WebSocket Chat** - Real-time streaming responses
- ✅ **File Validation** - Prevents chat connection without indexed documents

### Quick Start
```bash
# Simply open in browser
start test-ui.html           # Windows
open test-ui.html            # macOS  
xdg-open test-ui.html        # Linux

# Or right-click → Open with → Browser
```

### Architecture
```
test-ui.html (Single File)
│
├── HTML Structure
│   ├── Tab Navigation (Login, Upload, Files, Chat)
│   ├── Login Form (User ID + Password)
│   ├── Upload Form (File input + Upload button)
│   ├── Files Table (List with status)
│   └── Chat Interface (Messages + Input)
│
├── CSS Styling (Embedded)
│   ├── Tab styling (.tab, .tab.active)
│   ├── Connection status (.connected, .disconnected)
│   ├── Message bubbles (.message.user, .message.assistant)
│   └── Responsive layout
│
└── JavaScript Logic
    ├── State Management
    │   ├── currentUser (localStorage)
    │   ├── websocket (WebSocket instance)
    │   └── conversationId (timestamp)
    │
    ├── API Integration
    │   ├── fetch() for REST API (Upload, Get Files)
    │   └── WebSocket API for Chat
    │
    ├── Functions
    │   ├── login() - Authenticate user
    │   ├── uploadFile() - FormData upload
    │   ├── loadFiles() - Fetch user files
    │   ├── connectChat() - WebSocket connection with validation
    │   ├── sendMessage() - Send chat message
    │   └── showTab() - Tab switching
    │
    └── Event Handlers
        ├── websocket.onopen - Enable send button
        ├── websocket.onmessage - Display AI responses
        ├── websocket.onerror - Error handling
        └── websocket.onclose - Disable send button
```

### API Endpoints Used
```javascript
// Upload API (HTTP)
const UPLOAD_API = 'http://localhost:8001/upload';

// Endpoints:
POST   ${UPLOAD_API}/upload_file/${userId}
GET    ${UPLOAD_API}/get_files/${userId}
DELETE ${UPLOAD_API}/delete_file/${userId}/${fileId}

// Chat API (WebSocket)
const CHAT_WS = 'ws://localhost:8003/chat';

// Connection:
ws://${CHAT_WS}/${userId}/${conversationId}/${fileIds}
```

### User Flow
```
1. Open test-ui.html
   ↓
2. Login Tab
   - Enter User ID (e.g., "test")
   - Click Login
   - Stored in localStorage
   ↓
3. Upload Tab
   - Select file (PDF, TXT, DOCX)
   - Click Upload
   - File → API → S3 → SQS → Indexing
   ↓
4. Files Tab
   - Click Refresh
   - View files with status
   - Wait for "indexed" status (~30 sec)
   ↓
5. Chat Tab
   - Click Connect
   - (Auto-validates: user logged in + files indexed)
   - Green status = Connected
   - Send button enabled
   - Type question → Send
   - Receive streaming AI response
```

### Key Code Snippets

#### File Upload
```javascript
async function uploadFile() {
    if (!currentUser) {
        alert('Please login first');
        return;
    }
    
    const fileInput = document.getElementById('fileInput');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    const response = await fetch(
        `${UPLOAD_API}/upload_file/${currentUser}`,
        { method: 'POST', body: formData }
    );
    
    const result = await response.json();
    alert('File uploaded! Indexing in progress...');
}
```

#### WebSocket Chat
```javascript
async function connectChat() {
    // Validate user has indexed files
    const response = await fetch(`${UPLOAD_API}/get_files/${currentUser}`);
    const files = await response.json();
    const indexedFiles = files.filter(f => f.status === 'indexed');
    
    if (indexedFiles.length === 0) {
        alert('Please upload and index documents first!');
        return;
    }
    
    // Connect WebSocket
    const fileIds = indexedFiles.map(f => f.file_id).join(',');
    const wsUrl = `${CHAT_WS}/${currentUser}/${conversationId}/${fileIds}`;
    websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
        document.getElementById('connectionStatus').textContent = 'Connected';
        document.getElementById('sendBtn').disabled = false;
    };
    
    websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        displayMessage('assistant', data.content);
    };
}
```

#### Send Message
```javascript
function sendMessage() {
    const message = document.getElementById('messageInput').value;
    
    // Display user message
    displayMessage('user', message);
    
    // Send to WebSocket
    websocket.send(JSON.stringify({
        type: 'question',
        content: message
    }));
}
```

### Recent Improvements
- ✅ Added file existence check before WebSocket connection
- ✅ Added status validation (only "indexed" files allowed)
- ✅ Added helpful guidance text: "💡 Before chatting: Make sure you've logged in and uploaded documents..."
- ✅ Improved error messages for better UX

---

## 🏢 Option 2: Professional React UI

### Features
- ✅ **TypeScript** - Type safety and autocomplete
- ✅ **Material-UI** - Professional, consistent design
- ✅ **React Router** - Multi-page application
- ✅ **Context API** - Global state management
- ✅ **Custom Hooks** - Reusable business logic
- ✅ **Axios** - Advanced HTTP client with interceptors
- ✅ **WebSocket Client** - Reconnection logic, error handling
- ✅ **Vite** - Fast development server and build

### Quick Start
```bash
# Option A: Local Development (Recommended)
cd mnma-ui
npm install          # Install dependencies (~5 min first time)
npm run dev          # Start dev server → http://localhost:5173

# Option B: Docker Deployment
cd ..
docker compose build mnma-ui    # Build container (10-15 min)
docker compose up -d mnma-ui    # Run → http://localhost:3000
```

### Project Structure
```
mnma-ui/
│
├── public/                      # Static assets
│   └── vite.svg
│
├── src/
│   │
│   ├── components/              # Reusable UI components
│   │   ├── ChatWindow.tsx       # Display chat messages
│   │   ├── ChatInput.tsx        # Input field + Send button
│   │   ├── ChatMessage.tsx      # Individual message bubble
│   │   ├── FileList.tsx         # Table of files
│   │   ├── FileListItem.tsx     # Single file row
│   │   ├── FileUploadZone.tsx   # Drag-and-drop upload
│   │   ├── ConnectionStatus.tsx # WebSocket status badge
│   │   └── NotificationSnackbar.tsx  # Toast notifications
│   │
│   ├── pages/                   # Route-level pages
│   │   ├── DocumentsPage.tsx    # /  (Upload + File list)
│   │   └── ChatPage.tsx         # /chat  (Chat interface)
│   │
│   ├── services/                # Backend integration
│   │   ├── uploadApi.ts         # REST API (Axios)
│   │   └── chatWebSocket.ts     # WebSocket client class
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useChat.ts           # Chat state + WebSocket
│   │   ├── useFileUpload.ts     # File upload with progress
│   │   └── useFileList.ts       # File list + refresh
│   │
│   ├── contexts/                # Global state
│   │   └── AppContext.tsx       # User, notifications
│   │
│   ├── types/                   # TypeScript definitions
│   │   └── index.ts             # Interfaces (File, Message, User)
│   │
│   ├── App.tsx                  # Root component + routes
│   ├── main.tsx                 # Entry point (ReactDOM.render)
│   └── vite-env.d.ts            # Vite type definitions
│
├── index.html                   # HTML entry point
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite build config
├── Dockerfile                   # Container definition
└── .dockerignore                # Build exclusions
```

### Technology Stack
```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-router-dom": "6.22.0",
    "@mui/material": "5.15.11",
    "@mui/icons-material": "5.15.11",
    "@emotion/react": "11.11.3",
    "@emotion/styled": "11.11.0",
    "axios": "1.6.7",
    "uuid": "9.0.1"
  },
  "devDependencies": {
    "@types/react": "18.2.56",
    "@types/react-dom": "18.2.19",
    "@types/uuid": "9.0.8",
    "typescript": "5.2.2",
    "@vitejs/plugin-react": "4.2.1",
    "vite": "5.1.4",
    "eslint": "8.56.0"
  }
}
```

### Architecture

#### Component Hierarchy
```
App (Root)
│
├── ThemeProvider (Material-UI theme)
│   └── CssBaseline (CSS reset)
│
├── AppProvider (Global state context)
│   │
│   ├── BrowserRouter (React Router)
│   │   │
│   │   ├── AppBar (Header)
│   │   │   └── Toolbar
│   │   │       └── Typography ("Minima - Document Intelligence")
│   │   │
│   │   ├── Routes
│   │   │   ├── Route "/" → DocumentsPage
│   │   │   │   ├── FileUploadZone
│   │   │   │   │   └── DropZone (drag-and-drop)
│   │   │   │   └── FileList
│   │   │   │       └── FileListItem (per file)
│   │   │   │
│   │   │   ├── Route "/chat" → ChatPage
│   │   │   │   ├── ConnectionStatus
│   │   │   │   ├── ChatWindow
│   │   │   │   │   └── ChatMessage (per message)
│   │   │   │   └── ChatInput
│   │   │   │
│   │   │   └── Route "*" → Navigate to "/"
│   │   │
│   │   └── NotificationSnackbar (Toast notifications)
│   │
│   └── Context Value
│       ├── state.user (userId, isAuthenticated)
│       ├── state.notification (message, severity)
│       └── dispatch (actions)
```

#### State Management Flow
```
AppContext (useReducer)
│
├── State
│   ├── user: { userId: string, isAuthenticated: boolean } | null
│   └── notification: { message: string, severity: 'success' | 'error' | 'info' } | null
│
├── Actions
│   ├── SET_USER { userId }
│   ├── LOGOUT
│   ├── SHOW_NOTIFICATION { message, severity }
│   └── HIDE_NOTIFICATION
│
└── Persistence
    └── localStorage
        └── "user" → JSON.stringify(user)
```

#### Custom Hooks

##### useChat
```typescript
export const useChat = (userId: string, fileIds: string[]) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [chatClient, setChatClient] = useState<ChatWebSocket | null>(null);
  const conversationId = useState(() => uuidv4())[0];

  const connect = useCallback(() => {
    const client = new ChatWebSocket(
      userId,
      conversationId,
      fileIds,
      handleMessage,
      handleStatusChange
    );
    client.connect();
    setChatClient(client);
  }, [userId, fileIds]);

  const sendMessage = useCallback((content: string) => {
    chatClient?.sendMessage(content);
    setMessages(prev => [...prev, { type: 'question', content }]);
  }, [chatClient]);

  return { messages, isConnected, connect, disconnect, sendMessage };
};
```

##### useFileUpload
```typescript
export const useFileUpload = (userId: string) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      await uploadApi.uploadFile(userId, file);
      setProgress(100);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return { upload, uploading, progress };
};
```

##### useFileList
```typescript
export const useFileList = (userId: string) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await uploadApi.getFiles(userId);
      setFiles(data);
    } catch (error) {
      console.error('Load failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [userId]);

  return { files, loading, refresh: loadFiles };
};
```

### User Flow
```
1. Open http://localhost:5173 (or :3000)
   ↓
2. DocumentsPage (/)
   ├── If not authenticated → Show login form
   ├── If authenticated:
   │   ├── FileUploadZone
   │   │   ├── Drag-and-drop file
   │   │   └── Or click to select
   │   └── FileList
   │       ├── Auto-refreshes on upload
   │       └── Shows status badges (uploaded, indexing, indexed)
   ↓
3. Click "Go to Chat" button
   ↓
4. ChatPage (/chat)
   ├── Auto-loads indexed files
   ├── If no indexed files → Redirect to /
   ├── If files available:
   │   ├── ConnectionStatus badge (red/green)
   │   ├── Connect button
   │   ├── ChatWindow (message history)
   │   └── ChatInput (type + send)
   ↓
5. Click "Connect"
   ├── WebSocket establishes connection
   ├── Status turns green
   └── Input enabled
   ↓
6. Type question → Send
   ├── User message appears instantly
   ├── AI response streams in real-time
   └── Sources shown (file names, confidence scores)
```

### Key Components

#### DocumentsPage
```typescript
export const DocumentsPage: React.FC = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Typography variant="h4">My Documents</Typography>
      <Button onClick={() => navigate('/chat')}>Go to Chat</Button>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper><FileUploadZone userId={state.user.userId} /></Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper><FileList userId={state.user.userId} /></Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
```

#### ChatPage
```typescript
export const ChatPage: React.FC = () => {
  const { state } = useAppContext();
  const [fileIds, setFileIds] = useState<string[]>([]);
  const { messages, isConnected, connect, sendMessage } = useChat(
    state.user.userId,
    fileIds
  );

  useEffect(() => {
    // Load indexed files
    const loadFiles = async () => {
      const files = await uploadApi.getFiles(state.user.userId);
      const indexed = files.filter(f => f.status === 'indexed');
      setFileIds(indexed.map(f => f.file_id));
    };
    loadFiles();
  }, []);

  return (
    <Container>
      <Typography variant="h4">Chat with Documents</Typography>
      <ConnectionStatus isConnected={isConnected} />
      <Button onClick={connect}>Connect</Button>
      
      <Paper>
        <ChatWindow messages={messages} />
        <ChatInput onSend={sendMessage} disabled={!isConnected} />
      </Paper>
    </Container>
  );
};
```

#### ChatWebSocket Class
```typescript
export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(
    private userId: string,
    private conversationId: string,
    private fileIds: string[],
    private onMessage: (message: ChatMessage) => void,
    private onStatusChange: (status: 'connected' | 'disconnected') => void
  ) {}

  connect() {
    const wsUrl = `ws://localhost:8003/chat/${this.userId}/${this.conversationId}/${this.fileIds.join(',')}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.onStatusChange('connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.onMessage(data);
    };

    this.ws.onclose = () => {
      this.onStatusChange('disconnected');
      this.attemptReconnect();
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 3000);
    }
  }

  sendMessage(content: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'question', content }));
    }
  }

  disconnect() {
    this.ws?.close();
  }
}
```

### Build Configuration

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Install serve for production
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start production server
CMD ["serve", "-s", "dist", "-l", "3000"]
```

---

## 🎯 Comparison: Simple HTML vs React UI

| Feature | Simple HTML (`test-ui.html`) | React UI (`mnma-ui/`) |
|---------|------------------------------|------------------------|
| **Setup Time** | 0 seconds (just open file) | 5 minutes (npm install) |
| **Dependencies** | None | 30+ npm packages |
| **File Size** | ~20 KB (single file) | ~2 MB (node_modules) |
| **Type Safety** | No | Yes (TypeScript) |
| **UI Library** | Custom CSS | Material-UI |
| **Build Process** | No | Vite (TypeScript → JS) |
| **State Management** | localStorage | Context API + useReducer |
| **Routing** | Tabs (single page) | React Router (multi-page) |
| **Code Reusability** | Limited | High (components + hooks) |
| **Error Handling** | Basic alerts | Comprehensive try/catch + UI feedback |
| **WebSocket** | Native API | Custom class with reconnection |
| **Testing** | Manual | Unit tests possible (Jest/RTL) |
| **Production Ready** | Testing/Demo | Yes (enterprise) |
| **Best For** | Quick testing, demos | Production deployment |

---

## 🚀 Getting Started

### Quick Test (Simple HTML)
```bash
# 1. Ensure backend is running
docker compose up -d

# 2. Open test UI
start test-ui.html

# 3. Login
User ID: test
Password: test123

# 4. Try chat
- Go to Chat tab
- Click Connect
- Ask: "What is the warranty period?"
```

### Production Setup (React UI)
```bash
# 1. Install dependencies
cd mnma-ui
npm install

# 2. Configure API URLs (if needed)
# Edit mnma-ui/src/services/uploadApi.ts
# Edit mnma-ui/src/services/chatWebSocket.ts

# 3. Start development server
npm run dev

# 4. Open browser
# http://localhost:5173

# 5. For production build
npm run build
npm run preview  # Preview production build
```

---

## 📊 UI Screenshots & Flows

### Simple HTML UI
```
┌─────────────────────────────────────────────────────────────┐
│  Minima - Document Intelligence                             │
├─────────────────────────────────────────────────────────────┤
│  [Login] [Upload Files] [My Files] [Chat]                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  💡 Before chatting: Make sure you've logged in and        │
│     uploaded documents that are "indexed"                   │
│                                                             │
│  Connection Status: [Connected] ●                           │
│  [Connect] [Disconnect]                                     │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ You: What is the warranty period?                     │ │
│  │                                                       │ │
│  │ AI: Based on your documents, the warranty period     │ │
│  │     is 2 years from date of purchase...              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [Ask a question...                              ] [Send]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### React UI
```
┌─────────────────────────────────────────────────────────────┐
│  ≡  Minima - Document Intelligence              [Profile]  │
├─────────────────────────────────────────────────────────────┤
│  My Documents                          [Go to Chat]         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📤 Upload Documents                                │   │
│  │                                                     │   │
│  │  Drag and drop files here or click to browse       │   │
│  │                                                     │   │
│  │  Supported: PDF, TXT, DOCX                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📋 My Files                                        │   │
│  │                                                     │   │
│  │  Filename          Status      Uploaded    Actions │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │  document.pdf      Indexed     10:30 AM    [del]   │   │
│  │  notes.txt         Indexing    10:32 AM    [del]   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Customization

### Styling (Simple HTML)
Edit embedded `<style>` block in `test-ui.html`:
```css
/* Change primary color */
.tab.active {
    background: #007bff;  /* Change this */
}

/* Change connection status colors */
.connection-status.connected {
    background: #28a745;  /* Green */
}
```

### Theming (React UI)
Edit `mnma-ui/src/App.tsx`:
```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },    // Change primary color
    secondary: { main: '#dc004e' },  // Change secondary color
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
  },
});
```

---

## 📚 Related Documentation

- [Full Architecture & Implementation](ARCHITECTURE.md) - Complete system details
- [API Documentation](http://localhost:8001/docs) - FastAPI auto-generated docs
- [Testing Report](TESTING_REPORT.md) - Comprehensive test results
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Production deployment

---

## 🐛 Troubleshooting

### Simple HTML UI Issues

**Problem**: Send button is disabled
- **Cause**: WebSocket not connected
- **Solution**: Click "Connect" button, wait for green status

**Problem**: "Please upload documents first" alert
- **Cause**: User has no indexed documents
- **Solution**: Go to Upload tab, upload file, wait ~30 sec, then connect

**Problem**: WebSocket connection fails
- **Cause**: Backend not running or wrong user/collection
- **Solution**: 
  1. Check `docker compose ps` (all services running)
  2. Use "test" user (has indexed documents)
  3. Check browser console for errors

### React UI Issues

**Problem**: npm install fails
- **Solution**: Clear cache and retry
  ```bash
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
  ```

**Problem**: Build is slow
- **Cause**: Large node_modules in Docker context
- **Solution**: Use `.dockerignore` to exclude node_modules

**Problem**: TypeScript errors
- **Solution**: Run type check
  ```bash
  npm run build  # Shows all TS errors
  ```

---

**Last Updated**: April 7, 2026  
**Version**: 1.0
