from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# Load the same embedding model used during ingestion
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Load existing ChromaDB
db = Chroma(
    persist_directory="chroma_db",
    embedding_function=embeddings
)

# Ask a test question
query = "Welche Dokumente werden für die Hilfe zur Pflege benötigt?"

results = db.similarity_search(query, k=3)

print(f"Top {len(results)} results for: '{query}'\n")
for i, doc in enumerate(results, 1):
    print(f"--- Result {i} ---")
    print(f"Source: {doc.metadata.get('source')}")
    print(f"Page: {doc.metadata.get('page')}")
    print(doc.page_content[:400])
    print()