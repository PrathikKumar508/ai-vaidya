# AI Vaidya 🌿

AI-powered Ayurvedic Question Answering System using RAG (Retrieval-Augmented Generation).

## Features

* Upload Ayurveda PDFs
* Semantic vector search using FAISS
* Context-grounded AI answers
* React frontend + FastAPI backend
* Source citations with page references

---

# Backend Setup

```bash
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` file inside backend:

```env
GROQ_API_KEY=your_groq_api_key
```

Run backend:

```bash
uvicorn main:app --reload
```

---

# Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

---

# Open App

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://127.0.0.1:8000
```
