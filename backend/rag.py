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


reload_vectorstore()


def retrieve_relevant_chunks(question, top_k=2):
    question_embedding = model.encode([question])
    question_embedding = np.array(question_embedding).astype("float32")

    distances, indices = index.search(question_embedding, top_k)

    retrieved_chunks = []

    for idx in indices[0]:
        retrieved_chunks.append(chunks[idx])

    return retrieved_chunks


def generate_answer(question):
    retrieved_chunks = retrieve_relevant_chunks(question)

    context = "\n\n".join([chunk["text"] for chunk in retrieved_chunks])

    prompt = f"""
    Answer only from the context. If not found, say:
    "I could not find this in the uploaded Ayurveda text."

    Context:
    {context}

    Question:
    {question}

    Give a clear answer in 3-4 lines.
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=150
            

        )

        answer = response.choices[0].message.content

    except Exception:
        answer = "The AI service is temporarily unavailable. Please try again."
        return answer, []

    sources = []

    for chunk in retrieved_chunks:
        sources.append({
            "pdf": chunk["pdf"],
            "page": chunk["page"],
            "snippet": chunk["text"][:350] + "..."
        })

    return answer, sources