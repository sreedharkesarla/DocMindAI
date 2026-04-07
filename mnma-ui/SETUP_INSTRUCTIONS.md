# 🔧 UI Setup Instructions - Local Development

This guide helps you set up and run the Minima UI locally for development.

## Prerequisites

- Node.js 18+ and npm
- Backend services running (upload:8001, chat:8003)
- Git

## Installation Steps

### 1. Navigate to UI Directory

```bash
cd minima-aws/mnma-ui
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- React 18
- Material-UI 5
- TypeScript
- Vite
- Axios
- React Router
- WebSocket libraries

### 3. Configure Environment

The `.env.local` file is already created with default values:

```env
VITE_UPLOAD_API_URL=http://localhost:8001
VITE_CHAT_WS_URL=ws://localhost:8003
```

If your backend services are on different ports or hosts, update these values.

### 4. Start Development Server

```bash
npm run dev
```

The application will start on **http://localhost:3000**

You should see output like:
```
  VITE v5.1.4  ready in 245 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## Development Workflow

### File Structure

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
│   ├── contexts/         # React Context
│   │   └── AppContext.tsx
│   ├── hooks/            # Custom hooks
│   │   ├── useChat.ts
│   │   ├── useFileList.ts
│   │   └── useFileUpload.ts
│   ├── pages/            # Main pages
│   │   ├── ChatPage.tsx
│   │   └── DocumentsPage.tsx
│   ├── services/         # API services
│   │   ├── chatWebSocket.ts
│   │   └── uploadApi.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── App.tsx           # Main app
│   └── main.tsx          # Entry point
└── package.json
```

### Making Changes

1. **Edit Components**: Changes hot-reload automatically
2. **Add Dependencies**: `npm install <package-name>`
3. **Type Checking**: `npm run build` to check TypeScript errors
4. **Formatting**: Use your IDE's TypeScript formatter

### Common Development Tasks

#### Add a New Component

```bash
# Create new component file
touch src/components/MyComponent.tsx

# Import and use in a page
import { MyComponent } from '../components/MyComponent';
```

#### Add a New API Endpoint

1. Add function to `src/services/uploadApi.ts`:
```typescript
export const myNewEndpoint = async (param: string): Promise<DataType> => {
  const response = await api.get(`/upload/my-endpoint/${param}`);
  return response.data;
};
```

2. Use in a component via a hook or directly

#### Add New Type Definitions

Edit `src/types/index.ts`:
```typescript
export interface MyNewType {
  id: string;
  name: string;
}
```

### Testing

#### Manual Testing Checklist

- [ ] Login with user ID
- [ ] Upload a file (PDF, TXT, DOCX)
- [ ] Verify file appears in list
- [ ] Wait for "indexed" status
- [ ] Select file and navigate to chat
- [ ] Send a message
- [ ] Receive response
- [ ] Test file deletion
- [ ] Test logout
- [ ] Test error scenarios (no user, invalid file)

#### Browser DevTools

- **Console**: Check for errors/warnings
- **Network**: Monitor API calls and WebSocket messages
- **React DevTools**: Inspect component state
- **Application**: Check localStorage for user_id

## Building for Production

### 1. Create Production Build

```bash
npm run build
```

This creates an optimized build in `dist/` folder.

### 2. Preview Production Build

```bash
npm run preview
```

The build will be served at http://localhost:4173

### 3. Deploy

The `dist/` folder can be deployed to:
- AWS S3 + CloudFront
- Vercel
- Netlify
- Nginx
- Any static file server

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or change port in vite.config.ts
server: {
  port: 3001,
}
```

### Cannot Connect to Backend

1. Verify backend services are running:
```bash
curl http://localhost:8001/upload/docs
curl http://localhost:8003/docs
```

2. Check CORS is enabled on backend

3. Verify `.env.local` URLs are correct

### TypeScript Errors

```bash
# Check all errors
npm run build

# Fix common issues
npm install --save-dev @types/node
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### WebSocket Connection Fails

1. Check chat service is running on port 8003
2. Verify WebSocket URL in `.env.local`
3. Check browser console for connection errors
4. Ensure no proxy is blocking WebSocket connections

## Performance Optimization

### Code Splitting

React Router automatically code-splits by route. For manual splitting:

```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Bundle Analysis

```bash
npm run build
npx vite-bundle-visualizer
```

### Caching

Vite automatically generates hashed filenames for caching.

## IDE Setup

### VS Code (Recommended)

Install extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- ES7+ React/Redux/React-Native snippets

### Settings

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Router](https://reactrouter.com/)

## Need Help?

- Main README: [../README.md](../README.md)
- UI README: [README.md](README.md)
- Report issues: https://github.com/pshenok/minima-aws/issues

Happy coding! 🚀
