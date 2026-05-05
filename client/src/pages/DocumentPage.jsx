import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";

function DocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [lastSaved, setLastSaved] = useState(null);
  const [typing, setTyping] = useState(false);

  // LOAD DOCUMENT
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/documents/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoc(res.data);
        setStatus("Loaded");
      } catch {
        setStatus("Error loading document");
      }
    };

    load();
  }, [id]);

  // SOCKET
  useEffect(() => {
    socket.emit("join-document", id);

    socket.on("receive-changes", (content) => {
      setDoc((prev) => ({ ...prev, content }));
    });

    socket.on("user-typing", () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 1000);
    });

    return () => {
      socket.off("receive-changes");
      socket.off("user-typing");
    };
  }, [id]);

  // AUTO SAVE
  useEffect(() => {
    if (!doc) return;

    const timeout = setTimeout(async () => {
      try {
        await api.put(
          `/documents/${id}`,
          {
            title: doc.title,
            content: doc.content,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStatus("Auto-saved");
        setLastSaved(new Date().toLocaleTimeString());
      } catch {
        setStatus("Save failed");
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [doc?.content]);

  const handleChange = (e) => {
    const value = e.target.value;

    setDoc((prev) => ({ ...prev, content: value }));

    socket.emit("send-changes", {
      documentId: id,
      content: value,
    });

    socket.emit("typing", id);
    setStatus("Typing...");
  };

  if (!doc) return <p style={{ padding: "2rem" }}>{status}</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      
      <button onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <h2 style={{ marginTop: "1rem" }}>{doc.title}</h2>

      <p style={{ color: "gray", fontSize: "14px" }}>
        {status}
        {lastSaved && ` • Last saved at ${lastSaved}`}
        {typing && " • Someone is typing..."}
      </p>

      <p style={{ fontSize: "14px", color: "#888" }}>
        Logged in as: {user?.email}
      </p>

      <textarea
        value={doc.content}
        onChange={handleChange}
        rows="20"
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          borderRadius: "8px",
          marginTop: "10px",
        }}
      />
    </div>
  );
}

export default DocumentPage;