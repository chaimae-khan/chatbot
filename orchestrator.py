from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
import requests

# Load the same embedding model used during ingestion
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = Chroma(
    persist_directory="chroma_db",
    embedding_function=embeddings
)

# Simple keyword-based scope check (good enough for a prototype)
KEYWORDS = [
    "pflege", "hilfe zur pflege", "sgb xii", "pflegegrad",
    "pflegekasse", "antrag", "pflegeheim", "pflegewohngeld"
]

def is_in_scope(question: str) -> bool:
    q = question.lower()
    return any(keyword in q for keyword in KEYWORDS)

def generate_answer(question: str, docs) -> str:
    context = "\n\n".join(d.page_content for d in docs)
    prompt = f"""Beantworte die folgende Frage auf Deutsch, nur basierend auf dem gegebenen Kontext.
Wenn die Antwort nicht im Kontext steht, sage das ehrlich.

Kontext:
{context}

Frage: {question}

Antwort:"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "mistral",
            "prompt": prompt,
            "stream": False
        },
        timeout=120
    )
    response.raise_for_status()
    return response.json()["response"].strip()

def handle_question(question: str) -> dict:
    if not is_in_scope(question):
        return {
            "answer": "This question is outside the scope of Hilfe zur Pflege.",
            "sources": []
        }

    docs = db.similarity_search(question, k=3)
    answer = generate_answer(question, docs)

    return {
        "answer": answer,
        "sources": [d.metadata.get("source") for d in docs]
    }