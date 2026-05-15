import { useEffect, useState } from "react";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);  
  const [selectedPdfs, setSelectedPdfs] = useState([]);

  const fetchPdfs = async () => {
  try {
    const response = await fetch("https://ai-vaidya-production.up.railway.app/pdfs");
    const data = await response.json();
    setPdfs(data.pdfs || []);
  } catch (error) {
    console.error(error);
    setPdfs([]);
  }
};

const deletePdf = async (filename) => {
  const confirmDelete = window.confirm(`Delete ${filename}?`);
  if (!confirmDelete) return;

  try {
    const response = await fetch(
      `https://ai-vaidya-production.up.railway.app/pdfs/${encodeURIComponent(filename)}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();
    alert(data.message);
    fetchPdfs();
  } catch (error) {
    console.error(error);
    alert("Error deleting PDF");
  }
};

useEffect(() => {
  fetchPdfs();
}, []);
useEffect(() => {
  const timer = setTimeout(() => {
    setShowSplash(false);
  }, 1800);

  return () => clearTimeout(timer);
}, []);

const uploadPdf = async (e) => {
  const input = e.target;

  const file = input.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  setUploading(true);
  setUploadProgress(20);

setTimeout(() => setUploadProgress(45), 600);
setTimeout(() => setUploadProgress(75), 1800);

  try {
    const response = await fetch("https://ai-vaidya-production.up.railway.app/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    alert(data.message);
    fetchPdfs();
  } catch (error) {
    console.error(error);
    alert("Error uploading PDF");
  }
  setUploadProgress(100);
  setUploading(false);
  setTimeout(() => setUploadProgress(0), 800);
  input.value = "";
};


  const askQuestion = async (customQuestion = question) => {
    if (!customQuestion) return;
    if (pdfs.length > 0 && selectedPdfs.length === 0) {
      alert("Please select at least one PDF to answer from.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("https://ai-vaidya-production.up.railway.app/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: customQuestion,
           selected_pdfs: selectedPdfs,
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

  const togglePdfSelection = (pdf) => {
    if (selectedPdfs.includes(pdf)) {
      setSelectedPdfs(selectedPdfs.filter((item) => item !== pdf));
    } else {
      setSelectedPdfs([...selectedPdfs, pdf]);
    }
  };
  if (showSplash) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f4f8f0, #dcefd8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          textAlign: "center",
          animation: "splashZoom 1.8s ease forwards",
        }}
      >
        <div style={{ fontSize: "90px" }}>🌿</div>
        <h1
          style={{
            fontSize: "64px",
            color: "#1f4d2e",
            margin: "10px 0",
          }}
        >
          AI Vaidya
        </h1>
        <p
          style={{
            color: "#4d6b57",
            fontSize: "20px",
          }}
        >
          Ayurvedic Knowledge Assistant
        </p>
      </div>

      <style>
        {`
          @keyframes splashZoom {
            0% {
              opacity: 0;
              transform: scale(1.4);
            }
            30% {
              opacity: 1;
              transform: scale(1);
            }
            80% {
              opacity: 1;
              transform: scale(1);
            }
            100% {
              opacity: 0;
              transform: scale(0.7);
            }
          }
        `}
      </style>
    </div>
  );
}

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f4f8f0, #dcefd8)",
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
                marginTop: "30px",
              }}
            >
              {[
                ["📚", "Ayurveda PDFs", "Uploaded knowledge base"],
                ["🧠", "Semantic Search", "FAISS vector retrieval"],
                ["🌿", "Grounded AI", "Answers from uploaded texts"],
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: "#f7fcf5",
                    padding: "18px",
                    borderRadius: "16px",
                    border: "1px solid #d7e8d1",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "28px" }}>{item[0]}</div>

                  <strong style={{ color: "#245233" }}>{item[1]}</strong>

                  <p
                    style={{
                      color: "#587062",
                      marginBottom: 0,
                      marginTop: "8px",
                      fontSize: "14px",
                    }}
                  >
                    {item[2]}
                  </p>
                </div>
              ))}
            </div>
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

            <label
              style={{
                display: "inline-block",
                padding: "10px 18px",
                background: uploading ? "#7aa88f" : "#2d6a4f",
                color: "white",
                borderRadius: "12px",
                cursor: uploading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
                boxShadow: "0 4px 10px rgba(45,106,79,0.18)",
                transition: "0.2s",
                marginTop: "6px",
                opacity: uploading ? 0.7 : 1,
                pointerEvents: uploading ? "none" : "auto",
              }}
            >
              {uploading ? "🌿 Processing PDF..." : "🌿 Choose PDF"}

              <input
                type="file"
                accept="application/pdf"
                onChange={uploadPdf}
                disabled={uploading}
                style={{
                  display: "none",
                }}
              />
            </label>
            
            
            {uploading && (
              <div
            style={{
              marginTop: "16px",
              background: "#f7fcf5",
              padding: "16px",
              borderRadius: "14px",
              border: "1px solid #d7e8d1",
              color: "#245233",
              fontWeight: "bold",
            }}
          >
            {uploadProgress < 45 && "📄 Uploading PDF..."}
            {uploadProgress >= 45 && uploadProgress < 75 && "📖 Extracting and chunking text..."}
            {uploadProgress >= 75 && "🧠 Creating embeddings and updating vector database..."}

            <div
              style={{
                height: "8px",
                background: "#d7e8d1",
                borderRadius: "999px",
                marginTop: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${uploadProgress}%`,
                  background: "#2d6a4f",
                  borderRadius: "999px",
                  transition: "0.5s",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "8px",
                fontSize: "13px",
                color: "#587062",
              }}
            >
              {uploadProgress}% complete
            </div>
              </div>
            )}  
          </div>
          
          {pdfs.length > 0 && (
        <div
          style={{
            background: "#f7fcf5",
            padding: "20px",
            borderRadius: "18px",
            marginBottom: "35px",
            border: "1px solid #d7e8d1",
          }}
        >
        <div
            style={{
              marginBottom: "15px",
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              onClick={() => setSelectedPdfs(pdfs)}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                border: "none",
                background: "#2d6a4f",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Select All
            </button>

            <button
              onClick={() => setSelectedPdfs([])}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                border: "none",
                background: "#b23b3b",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Clear Selection
            </button>
          </div>
          <h2 style={{ color: "#245233", marginBottom: "15px" }}>
            📖 Uploaded Knowledge Base
          </h2>

          {pdfs.map((pdf, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #d7e8d1",
                color: "#233428",
              }}
            >
            <span>
            <input
              type="checkbox"
              checked={selectedPdfs.includes(pdf)}
              onChange={() => togglePdfSelection(pdf)}
              style={{ marginRight: "10px" }}
            />
            📄 {pdf}
            </span>

              <button
                onClick={() => deletePdf(pdf)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#b23b3b",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Remove
              </button>
            </div>
            ))}
          </div>
        )}

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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  askQuestion();
                }
              }}
            />

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "18px",
              }}
            >
              {[
                "What are the three doshas?",
                "How does Ayurveda define health?",
                "Explain Vata imbalance.",
                "What foods aggravate Pitta?",
              ].map((q, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuestion(q);
                    setTimeout(() => {
                      askQuestion(q);
                    }, 0);
                  }}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "999px",
                    border: "1px solid #bdd7b6",
                    background: "#f4fbf1",
                    color: "#245233",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "0.2s",
                  }}
                >
                  🌿 {q}
                </button>
              ))}
            </div>

            <button
            onClick={() => askQuestion()}
            disabled={loading}
            style={{
              marginTop: "20px",
              padding: "14px 28px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              borderRadius: "14px",
              border: "none",
              background: loading ? "#7aa88f" : "#2d6a4f",
              color: "white",
              fontWeight: "bold",
              boxShadow: "0 6px 15px rgba(45,106,79,0.25)",
            }}
          >
            {loading ? "🌿 Generating..." : "Ask AI Vaidya"}
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

