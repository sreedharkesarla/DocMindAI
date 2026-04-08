# ============================================
# DocuMindAI - Fresh Start Script (PowerShell)
# Cleans Qdrant collections and S3 files
# ============================================

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "DocuMindAI - Fresh Start" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will DELETE:" -ForegroundColor Yellow
Write-Host "  1. All Qdrant collections" -ForegroundColor Yellow
Write-Host "  2. All S3 uploaded files" -ForegroundColor Yellow
Write-Host "  3. All database records (optional)" -ForegroundColor Yellow
Write-Host ""

# Confirm
$confirm = Read-Host "Do you want to continue? (yes/no)"
if ($confirm -notmatch '^(yes|y)$') {
    Write-Host "❌ Cancelled. Nothing was deleted." -ForegroundColor Red
    exit 0
}

# Detect Python executable (prefer virtual environment)
$pythonCmd = "python"
if (Test-Path ".venv\Scripts\python.exe") {
    $pythonCmd = ".venv\Scripts\python.exe"
    Write-Host "✅ Using virtual environment Python" -ForegroundColor Green
} elseif (Test-Path "venv\Scripts\python.exe") {
    $pythonCmd = "venv\Scripts\python.exe"
    Write-Host "✅ Using virtual environment Python" -ForegroundColor Green
}

# Check if Python is available
try {
    $pythonVersion = & $pythonCmd --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Clean Qdrant collections
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Step 1: Cleaning Qdrant Collections" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
& $pythonCmd clean-qdrant.py
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠️  WARNING: Qdrant cleanup had issues" -ForegroundColor Yellow
}

# Clean S3 files
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Step 2: Cleaning S3 Files" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
& $pythonCmd clean-s3.py
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠️  WARNING: S3 cleanup had issues" -ForegroundColor Yellow
}

# Ask about database cleanup
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Step 3: Database Cleanup (Optional)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
$cleanDb = Read-Host "Do you want to clean the database? (yes/no)"
if ($cleanDb -match '^(yes|y)$') {
    Write-Host ""
    Write-Host "Cleaning database records..." -ForegroundColor Yellow
    
    # Check if documents table exists
    $tableExists = docker exec documindai-mysql mysql -uroot -proot123 documindai_db -e "SHOW TABLES LIKE 'documents';" 2>$null
    
    if ($tableExists -match "documents") {
        docker exec documindai-mysql mysql -uroot -proot123 documindai_db -e "DELETE FROM documents WHERE 1=1;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database cleaned successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  WARNING: Database cleanup failed." -ForegroundColor Yellow
        }
    } else {
        Write-Host "ℹ️  No documents table found. Database is already clean." -ForegroundColor Cyan
    }
} else {
    Write-Host "⏭️  Skipping database cleanup." -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Fresh Start Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Upload new documents via the admin UI" -ForegroundColor White
Write-Host "  2. Documents will be indexed automatically" -ForegroundColor White
Write-Host "  3. Use the chat to query your documents" -ForegroundColor White
Write-Host ""
