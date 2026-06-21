from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# 1. Load PDFs
loader = PyPDFDirectoryLoader("docs")
documents = loader.load()

# 2. Split into chunks
splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
chunks = splitter.split_documents(documents)

# 3. SAFE embeddings (NO torch issues)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 4. Store in ChromaDB
db = Chroma.from_documents(
    chunks,
    embeddings,
    persist_directory="chroma_db"
)

db.persist()

print(f"Ingested {len(chunks)} chunks into ChromaDB.")