


import { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadPdf = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error(error);
      alert("Error uploading PDF");
    }

    setUploading(false);
  };

  const askQuestion = async () => {
    if (!question) return;

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      const data = await response.json();

      setAnswer(data.answer);            
      if (data.answer.toLowerCase().includes("could not find")) {
        setSources([]);
      } else {
        setSources(data.sources);
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to backend");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #f4f8f0, #dcefd8)",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "auto",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(8px)",
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            border: "1px solid #d7e8d1",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ fontSize: "64px" }}>🌿</div>

            <h1
              style={{
                fontSize: "48px",
                marginBottom: "10px",
                color: "#1f4d2e",
                lineHeight: "1.2",
              }}
            >
              AI Vaidya
            </h1>

            <p
              style={{
                color: "#4d6b57",
                fontSize: "18px",
              }}
            >
              Ayurvedic Knowledge Assistant powered by Semantic AI
            </p>
          </div>

          <div
            style={{
              background: "#eef7ea",
              padding: "25px",
              borderRadius: "18px",
              marginBottom: "35px",
              border: "1px solid #cfe3c8",
            }}
          >
            <h2
              style={{
                marginBottom: "15px",
                color: "#245233",
              }}
            >
              📚 Upload Ayurveda PDF
            </h2>

            <input
              type="file"
              accept="application/pdf"
              onChange={uploadPdf}
              style={{
                fontSize: "16px",
              }}
            />

            {uploading && (
              <p
                style={{
                  marginTop: "12px",
                  color: "#245233",
                  fontWeight: "bold",
                }}
              >
                Processing PDF and generating embeddings...
              </p>
            )}
          </div>

          <div>
            <h2
              style={{
                marginBottom: "15px",
                color: "#245233",
              }}
            >
              🧠 Ask a Question
            </h2>

            <textarea
              rows="5"
              style={{
                width: "100%",
                padding: "18px",
                fontSize: "16px",
                borderRadius: "16px",
                border: "1px solid #bdd7b6",
                outline: "none",
                resize: "none",
                background: "#fcfffb",
                color: "#000000",
              }}
              placeholder="Example: What are the three doshas in Ayurveda?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            <button
              onClick={askQuestion}
              style={{
                marginTop: "20px",
                padding: "14px 28px",
                fontSize: "16px",
                cursor: "pointer",
                borderRadius: "14px",
                border: "none",
                background: "#2d6a4f",
                color: "white",
                fontWeight: "bold",
                boxShadow: "0 6px 15px rgba(45,106,79,0.25)",
              }}
            >
              Ask AI Vaidya
            </button>
          </div>

          {loading && (
            <div
              style={{
                marginTop: "30px",
                background: "#eef7ea",
                padding: "18px",
                borderRadius: "14px",
                color: "#245233",
                fontWeight: "bold",
              }}
            >
              🌿 Generating answer from uploaded Ayurveda texts...
            </div>
          )}

          {answer && (
            <div style={{ marginTop: "45px" }}>
              <h2
                style={{
                  marginBottom: "18px",
                  color: "#245233",
                }}
              >
                🌱 Answer
              </h2>

              <div
                style={{
                  background: "#f7fcf5",
                  padding: "25px",
                  borderRadius: "18px",
                  border: "1px solid #d7e8d1",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.8",
                  color: "#233428",
                }}
              >
                {answer}
              </div>
            </div>
          )}

          {sources.length > 0 && (
            <div style={{ marginTop: "45px" }}>
              <h2
                style={{
                  marginBottom: "20px",
                  color: "#245233",
                }}
              >
                🍃 Sources
              </h2>

              {sources.map((source, index) => (
                <div
                  key={index}
                  style={{
                    background: "#fbfffa",
                    color: "#000000",
                    padding: "20px",
                    marginBottom: "20px",
                    border: "1px solid #d5e7cf",
                    borderRadius: "18px",
                    whiteSpace: "pre-wrap",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      color: "#245233",
                      fontWeight: "bold",
                      marginBottom: "8px",
                    }}
                  >
                    📄 {source.pdf}
                  </div>

                  <div
                    style={{
                      marginBottom: "14px",
                      color: "#587062",
                    }}
                  >
                    Page {source.page}
                  </div>

                  <small
                    style={{
                      color: "#39483f",
                      lineHeight: "1.6",
                    }}
                  >
                    {source.snippet}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;



