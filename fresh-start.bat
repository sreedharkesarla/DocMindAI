@echo off
REM ============================================
REM DocuMindAI - Fresh Start Script
REM Cleans Qdrant collections and S3 files
REM ============================================

echo.
echo ====================================
echo DocuMindAI - Fresh Start
echo ====================================
echo.
echo This will DELETE:
echo   1. All Qdrant collections
echo   2. All S3 uploaded files
echo   3. All database records (optional)
echo.
echo Press Ctrl+C to cancel now!
echo.
pause

REM Check if Python is available
if exist ".venv\Scripts\python.exe" (
    set PYTHON_CMD=.venv\Scripts\python.exe
    echo Using virtual environment Python
) else if exist "venv\Scripts\python.exe" (
    set PYTHON_CMD=venv\Scripts\python.exe
    echo Using virtual environment Python
) else (
    set PYTHON_CMD=python
)

%PYTHON_CMD% --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Clean Qdrant collections
echo.
echo ============================================
echo Step 1: Cleaning Qdrant Collections
echo ============================================
%PYTHON_CMD% clean-qdrant.py
if errorlevel 1 (
    echo.
    echo WARNING: Qdrant cleanup had issues
    echo.
)

REM Clean S3 files
echo.
echo ============================================
echo Step 2: Cleaning S3 Files
echo ============================================
%PYTHON_CMD% clean-s3.py
if errorlevel 1 (
    echo.
    echo WARNING: S3 cleanup had issues
    echo.
)

REM Ask about database cleanup
echo.
echo ============================================
echo Step 3: Database Cleanup (Optional)
echo ============================================
echo.
set /p CLEAN_DB="Do you want to clean the database? (yes/no): "
if /i "%CLEAN_DB%"=="yes" (
    echo.
    echo Cleaning database records...
    REM Check if documents table exists
    docker exec documindai-mysql mysql -uroot -proot123 documindai_db -e "SHOW TABLES LIKE 'documents';" 2>nul | findstr "documents" >nul
    if errorlevel 1 (
        echo No documents table found. Database is already clean.
    ) else (
        docker exec documindai-mysql mysql -uroot -proot123 documindai_db -e "DELETE FROM documents WHERE 1=1;" 2>nul
        if errorlevel 1 (
            echo WARNING: Database cleanup failed.
        ) else (
            echo Database cleaned successfully!
        )
    )
) else (
    echo Skipping database cleanup.
)

echo.
echo ============================================
echo Fresh Start Complete!
echo ============================================
echo.
echo Next steps:
echo   1. Upload new documents via the admin UI
echo   2. Documents will be indexed automatically
echo   3. Use the chat to query your documents
echo.
pause
