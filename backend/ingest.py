import fitz
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle
import os


UPLOAD_DIR = "uploads"
VECTOR_DIR = "vectorstore"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(VECTOR_DIR, exist_ok=True)


def extract_chunks_from_pdf(pdf_path, chunk_size=500, overlap=100):
    doc = fitz.open(pdf_path)
    all_chunks = []
    pdf_name = os.path.basename(pdf_path)

    for page_num, page in enumerate(doc, start=1):
        text = page.get_text()
        words = text.split()

        start = 0
        while start < len(words):
            end = start + chunk_size
            chunk_text = " ".join(words[start:end])

            if len(chunk_text.strip()) > 100:
                all_chunks.append({
                    "text": chunk_text,
                    "pdf": pdf_name,
                    "page": page_num
                })

            start += chunk_size - overlap

    return all_chunks


def build_vectorstore():
    print("Building vectorstore from uploaded PDFs...")

    all_chunks = []

    for filename in os.listdir(UPLOAD_DIR):
        if filename.lower().endswith(".pdf"):
            pdf_path = os.path.join(UPLOAD_DIR, filename)
            print(f"Processing: {filename}")
            chunks = extract_chunks_from_pdf(pdf_path)
            all_chunks.extend(chunks)

    if not all_chunks:
        raise Exception("No PDF files found in uploads folder.")

    texts = [chunk["text"] for chunk in all_chunks]

    print(f"Total chunks: {len(all_chunks)}")

    model = SentenceTransformer("all-MiniLM-L6-v2")

    embeddings = model.encode(texts)
    embeddings = np.array(embeddings).astype("float32")

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)

    faiss.write_index(index, os.path.join(VECTOR_DIR, "ayurveda.index"))

    with open(os.path.join(VECTOR_DIR, "chunks.pkl"), "wb") as f:
        pickle.dump(all_chunks, f)

    print("Vectorstore build complete.")


if __name__ == "__main__":
    build_vectorstore()