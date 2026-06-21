Write-Host "Setting up backend..." -ForegroundColor Cyan
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

Write-Host "Building vector database from docs..." -ForegroundColor Cyan
python ingest.py

Write-Host "Setting up frontend..." -ForegroundColor Cyan
cd pflege-frontend
npm install
cd ..

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "Run these in two separate terminals:"
Write-Host "  1) venv\Scripts\Activate.ps1  then  uvicorn main:app --reload"
Write-Host "  2) cd pflege-frontend  then  npm run dev"