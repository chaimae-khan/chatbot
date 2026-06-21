# Hilfe zur Pflege – RAG Chatbot

## Prerequisites (one-time, manual)
1. Install [Node.js](https://nodejs.org) (LTS version)
2. Install [Ollama](https://ollama.com), then run:
```
   ollama pull mistral
```

## Setup (one command)

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

This installs all Python and Node dependencies and builds the vector database from `docs/`.

## Run the app
Open two terminals:

**Terminal 1 — backend:**
```bash
venv\Scripts\Activate.ps1   # Windows
source venv/bin/activate    # Mac/Linux
uvicorn main:app --reload
```

**Terminal 2 — frontend:**
```bash
cd pflege-frontend
npm run dev
```

Then open `http://localhost:5173`