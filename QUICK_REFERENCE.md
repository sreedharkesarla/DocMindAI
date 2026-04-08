# DocuMindAI - Quick Reference

Quick reference for common commands and troubleshooting.

## 🚀 Start/Stop Services

```powershell
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart all services
docker-compose restart

# Check service status
docker-compose ps

# View all logs (follow mode)
docker-compose logs -f

# View specific service logs
docker logs documindai-documindai-admin-1 -f
docker logs documindai-documindai-upload-1 -f
docker logs documindai-documindai-chat-1 -f
```

## 🌐 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Admin Console** | http://localhost:3001 | admin / Admin@123 |
| **Upload API** | http://localhost:8001/docs | - |
| **Index API** | http://localhost:8002/docs | - |
| **Qdrant Dashboard** | http://localhost:6333/dashboard | - |

## 👤 User Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@123 | Super Administrator |
| test | Test@123 | Administrator |
| operator1 | Test@123 | Operator (manage files) |
| viewer1 | Test@123 | Viewer (read-only) |

## 🗄️ Database Access

```powershell
# Access MySQL CLI
docker exec -it documindai-mysql mysql -uroot -proot123 documindai_db

# Quick queries
docker exec documindai-mysql mysql -uroot -proot123 documindai_db -e "SELECT * FROM users;"
docker exec documindai-mysql mysql -uroot -proot123 documindai_db -e "SELECT * FROM documents LIMIT 10;"

# Show all databases
docker exec documindai-mysql mysql -uroot -proot123 -e "SHOW DATABASES;"
```

## 🔄 Rebuild Services

```powershell
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build documindai-admin
docker-compose build documindai-upload

# Rebuild and restart
docker-compose up -d --build
```

## 🧹 Clean Up

```powershell
# Fresh start (clean Qdrant + S3)
pip install -r cleanup-requirements.txt
.\fresh-start.ps1

# Clean Qdrant only
python clean-qdrant.py

# Clean S3 only
python clean-s3.py

# Remove all containers and volumes (⚠️ deletes data)
docker-compose down -v

# Remove unused Docker resources
docker system prune -a
```

## 🔍 Debugging

```powershell
# Check container health
docker-compose ps

# View container logs
docker logs <container-name> --tail 50 -f

# Inspect container
docker inspect <container-name>

# Check network
docker network ls
docker network inspect documindai_default

# Check volumes
docker volume ls

# Enter container shell
docker exec -it <container-name> /bin/bash
```

## 📊 Monitoring

```powershell
# Real-time resource usage
docker stats

# View running processes in container
docker top <container-name>

# View port mappings
docker port <container-name>
```

## 🔧 Common Issues

### Port Already in Use
```powershell
# Find what's using port 3001
netstat -ano | findstr "3001"

# Kill process by PID
taskkill /F /PID <process_id>
```

### Container Won't Start
```powershell
# Check logs for errors
docker logs <container-name>

# Remove container and recreate
docker-compose rm -f <service-name>
docker-compose up -d <service-name>
```

### Database Connection Failed
```powershell
# Check MySQL is running
docker-compose ps mysql

# Check MySQL logs
docker logs documindai-mysql

# Restart MySQL
docker-compose restart mysql
```

### Upload/Index Not Working
```powershell
# Check upload service logs
docker logs documindai-documindai-upload-1 --tail 100

# Check index service logs
docker logs documindai-documindai-index-1 --tail 100

# Verify .env has correct AWS credentials
cat .env
```

## 🛠️ Development

```powershell
# Install Python dependencies (for cleanup scripts)
pip install -r cleanup-requirements.txt

# Install Node dependencies (for admin UI)
cd documindai-admin
npm install
npm run dev  # Development mode

# Build admin UI
npm run build
```

## 📦 Container Names

```
documindai-mysql                    # MySQL database
qdrant                              # Qdrant vector DB
documindai-documindai-upload-1      # Upload service
documindai-documindai-index-1       # Index service
documindai-documindai-chat-1        # Chat service
documindai-documindai-admin-1       # Admin UI
```

## 🔑 Environment Variables Quick Check

```powershell
# View all environment variables in .env
cat .env

# Check specific service environment
docker exec documindai-documindai-upload-1 env

# Test AWS credentials
docker exec documindai-documindai-upload-1 aws s3 ls
```

## 📝 Useful SQL Queries

```sql
-- Show all users
SELECT user_id, username, email, is_active, is_superuser FROM users;

-- Show all roles
SELECT role_name, description FROM roles;

-- Show user-role assignments
SELECT u.username, r.role_name, ur.assigned_at
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id;

-- Show document count
SELECT COUNT(*) as total_documents FROM documents;

-- Show recent uploads
SELECT file_name, user_id, upload_date, status 
FROM documents 
ORDER BY upload_date DESC 
LIMIT 10;

-- Clean all documents
DELETE FROM documents WHERE 1=1;
```

## 🎯 Quick Workflow

1. **Start Services**: `docker-compose up -d`
2. **Open Browser**: http://localhost:3001
3. **Login**: admin / Admin@123
4. **Upload Document**: File Intake → Upload Files
5. **Wait for Indexing**: Check logs or refresh page
6. **Chat**: Ask Chat → Type question
7. **View Logs**: `docker-compose logs -f`

## 📚 Documentation Links

- [Getting Started Guide](GETTING_STARTED.md) - Complete setup instructions
- [Fresh Start Guide](FRESH_START.md) - How to clean and reset
- [README](README.md) - Project overview and architecture
- [docker-compose.yml](docker-compose.yml) - Service configuration

---

💡 **Tip**: Bookmark this page for quick reference while developing!
