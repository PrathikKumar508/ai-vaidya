import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

model = SentenceTransformer(
    "all-MiniLM-L6-v2",
    device="cpu"
)

index = None
chunks = None


def reload_vectorstore():
    global index, chunks

    index = faiss.read_index("vectorstore/ayurveda.index")

    with open("vectorstore/chunks.pkl", "rb") as f:
        chunks = pickle.load(f)



def retrieve_relevant_chunks(question, selected_pdfs=None, top_k=3):
    if selected_pdfs is None:
        selected_pdfs = []

    question_embedding = model.encode([question])
    question_embedding = np.array(question_embedding).astype("float32")

    search_k = min(len(chunks), 20)

    distances, indices = index.search(question_embedding, search_k)

    retrieved_chunks = []

    for idx in indices[0]:
        chunk = chunks[idx]

        if selected_pdfs and chunk["pdf"] not in selected_pdfs:
            continue

        retrieved_chunks.append(chunk)

        if len(retrieved_chunks) == top_k:
            break

    return retrieved_chunks


def generate_answer(question, selected_pdfs=None):
    if index is None or chunks is None or len(chunks) == 0:
        return "No Ayurveda PDFs are currently uploaded. Please upload a PDF first.", []

    retrieved_chunks = retrieve_relevant_chunks(question, selected_pdfs)

    if not retrieved_chunks:
        return "I could not find this in the selected uploaded Ayurveda PDFs.", []

    context = "\n\n".join([chunk["text"] for chunk in retrieved_chunks])

    prompt = f"""
Answer only from the context. If not found, say:
"I could not find this in the uploaded Ayurveda text."

Context:
{context}

Question:
{question}

Give a clear answer in 5-7 lines.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_tokens=350
    )

    answer = response.choices[0].message.content

    sources = []

    for chunk in retrieved_chunks:
        sources.append({
            "pdf": chunk["pdf"],
            "page": chunk["page"],
            "snippet": chunk["text"][:350] + "..."
        })

    return answer, sources