import { useState, useRef, useEffect } from "react";

const EXAMPLE_QUESTIONS = [
  "Was ist Hilfe zur Pflege?",
  "Wie beantrage ich einen Pflegegrad?",
  "Welche Pflegeleistungen gibt es?",
];

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendQuestion = async (text) => {
    const q = (text ?? question).trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer, sources: data.sources || [] },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Die Verbindung zum Server ist fehlgeschlagen. Bitte versuche es erneut.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const cleanSource = (s) => s?.split(/[\\/]/).pop();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerIcon}>♥</div>
        <div>
          <h1 style={styles.title}>Hilfe zur Pflege</h1>
          <p style={styles.subtitle}>Ihr Assistent für Pflegefragen nach SGB XII</p>
        </div>
      </header>

      <main style={styles.chatArea} ref={scrollRef}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              Stellen Sie eine Frage zu Pflegeleistungen, Pflegegrad oder Anträgen.
            </p>
            <div style={styles.suggestions}>
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  style={styles.suggestionChip}
                  onClick={() => sendQuestion(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.messageRow,
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                ...(m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant),
                ...(m.isError ? styles.bubbleError : {}),
              }}
            >
              <p style={styles.bubbleText}>{m.text}</p>
              {m.sources && m.sources.length > 0 && (
                <div style={styles.sourcesRow}>
                  {[...new Set(m.sources)].map((s, idx) => (
                    <span key={idx} style={styles.sourcePill}>
                      📄 {cleanSource(s)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
            <div style={{ ...styles.bubble, ...styles.bubbleAssistant }}>
              <div style={styles.typingDots}>
                <span style={styles.dot} />
                <span style={{ ...styles.dot, animationDelay: "0.15s" }} />
                <span style={{ ...styles.dot, animationDelay: "0.3s" }} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={styles.inputBar}>
        <input
          ref={inputRef}
          style={styles.input}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
          placeholder="Ihre Frage eingeben..."
          disabled={loading}
        />
        <button
          style={{
            ...styles.sendButton,
            ...(loading || !question.trim() ? styles.sendButtonDisabled : {}),
          }}
          onClick={() => sendQuestion()}
          disabled={loading || !question.trim()}
        >
          Senden
        </button>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder { color: #9CA3AF; }
        button:focus-visible, input:focus-visible {
          outline: 2px solid #2563A8;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    background: "#F7F8FA",
    color: "#1F2937",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "16px 24px",
    background: "#FFFFFF",
    borderBottom: "1px solid #E5E7EB",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#2563A8",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
  },
  subtitle: {
    margin: 0,
    fontSize: 13,
    color: "#6B7280",
  },
  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    maxWidth: 720,
    width: "100%",
    margin: "0 auto",
  },
  emptyState: {
    margin: "auto",
    textAlign: "center",
    maxWidth: 440,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 15,
    marginBottom: 16,
  },
  suggestions: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  suggestionChip: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #D1D5DB",
    background: "#fff",
    color: "#2563A8",
    fontSize: 14,
    cursor: "pointer",
    textAlign: "left",
  },
  messageRow: {
    display: "flex",
  },
  bubble: {
    maxWidth: "75%",
    padding: "12px 16px",
    borderRadius: 14,
  },
  bubbleUser: {
    background: "#2563A8",
    color: "#fff",
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderBottomLeftRadius: 4,
  },
  bubbleError: {
    background: "#FEF2F2",
    border: "1px solid #FCA5A5",
    color: "#991B1B",
  },
  bubbleText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  sourcesRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  sourcePill: {
    fontSize: 11,
    color: "#4B5563",
    background: "#F3F4F6",
    padding: "3px 8px",
    borderRadius: 6,
  },
  typingDots: {
    display: "flex",
    gap: 4,
    padding: "4px 2px",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#9CA3AF",
    animation: "bounce 1.2s infinite",
  },
  inputBar: {
    display: "flex",
    gap: 10,
    padding: "16px 24px",
    background: "#fff",
    borderTop: "1px solid #E5E7EB",
    maxWidth: 720,
    width: "100%",
    margin: "0 auto",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid #D1D5DB",
    fontSize: 15,
  },
  sendButton: {
    padding: "12px 22px",
    borderRadius: 10,
    border: "none",
    background: "#2563A8",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  sendButtonDisabled: {
    background: "#A8C2DD",
    cursor: "not-allowed",
  },
};

export default App;