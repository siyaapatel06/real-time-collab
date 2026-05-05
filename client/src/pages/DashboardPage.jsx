import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchDocs = async () => {
    const res = await api.get("/documents", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDocuments(res.data);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    await api.post("/documents", form, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setForm({ title: "", content: "" });
    fetchDocs();
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h1>Dashboard</h1>

      <form onSubmit={handleCreate} style={{ marginBottom: "2rem" }}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          style={{ display: "block", marginBottom: "1rem" }}
        />

        <textarea
          placeholder="Content"
          value={form.content}
          onChange={(e) =>
            setForm({ ...form, content: e.target.value })
          }
          rows="5"
          style={{ display: "block", marginBottom: "1rem" }}
        />

        <button>Create Document</button>
      </form>

      <h2>Your Documents</h2>

      {documents.map((doc) => (
        <div
          key={doc._id}
          style={{
            border: "1px solid gray",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "8px",
          }}
        >
          <h3>{doc.title}</h3>
          <p>{doc.content}</p>

          <button
            onClick={() => navigate(`/document/${doc._id}`)}
          >
            Open Editor
          </button>
        </div>
      ))}
    </div>
  );
}

export default DashboardPage;