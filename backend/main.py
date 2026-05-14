import os
import shutil

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ingest import build_vectorstore
from rag import generate_answer, reload_vectorstore

app = FastAPI()

build_vectorstore()
reload_vectorstore()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class QuestionRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {"message": "AI Vaidya backend is running"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    allowed_keywords = [
        "ayurveda",
        "charaka",
        "samhita",
        "dosha",
        "vedic",
        "ashtanga",
        "herbal"
    ]

    filename_lower = file.filename.lower()

    if not any(keyword in filename_lower for keyword in allowed_keywords):
        return {
            "message": "Please upload Ayurveda-related PDFs only."
        }

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    if os.path.exists(file_path):
        return {
            "message": "PDF already uploaded",
            "filename": file.filename
        }

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    build_vectorstore()
    reload_vectorstore()

    return {
        "message": "PDF uploaded and indexed successfully",
        "filename": file.filename
    }


@app.post("/ask")
def ask_question(request: QuestionRequest):
    answer, sources = generate_answer(request.question)

    return {
        "answer": answer,
        "sources": sources
    }