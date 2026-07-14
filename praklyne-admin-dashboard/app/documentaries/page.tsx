"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getDocumentaries,
  addDocumentary,
  updateDocumentary,
  deleteDocumentary,
  Documentary,
} from "@/lib/firestore";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { ToastContainer, useToast } from "@/components/Toast";
import { Plus, Search, Pencil, Trash2, Clapperboard, Clock, RefreshCw, ExternalLink } from "lucide-react";

const emptyDoc: Omit<Documentary, "id"> = {
  title: "",
  youtubeID: "",
  duration: "",
  description: "",
  transcript: "",
};

export default function DocumentariesPage() {
  const [docs, setDocs] = useState<Documentary[]>([]);
  const [filtered, setFiltered] = useState<Documentary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Documentary | null>(null);
  const [form, setForm] = useState<Omit<Documentary, "id">>(emptyDoc);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Documentary | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDocumentaries();
      setDocs(data);
      setFiltered(data);
    } catch {
      addToast("Failed to load documentaries", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(docs.filter((d) => d.title.toLowerCase().includes(q)));
  }, [search, docs]);

  const openAdd = () => {
    setEditingDoc(null);
    setForm(emptyDoc);
    setIsModalOpen(true);
  };

  const openEdit = (d: Documentary) => {
    setEditingDoc(d);
    setForm({ ...d });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.youtubeID) {
      addToast("Title and YouTube ID are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingDoc?.id) {
        await updateDocumentary(editingDoc.id, form);
        addToast("Documentary updated successfully");
      } else {
        await addDocumentary(form);
        addToast("Documentary added successfully");
      }
      setIsModalOpen(false);
      await load();
    } catch {
      addToast("Failed to save documentary", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (d: Documentary) => {
    if (!d.id) return;
    try {
      await deleteDocumentary(d.id);
      addToast("Documentary deleted");
      setDeleteConfirm(null);
      await load();
    } catch {
      addToast("Failed to delete documentary", "error");
    }
  };

  const field = (key: keyof Omit<Documentary, "id">, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <>
      <Header
        title="Documentary Videos"
        description={`${docs.length} documentaries in the Science course`}
        actions={
          <button
            className="btn btn-primary"
            onClick={openAdd}
            style={{ background: "#f59e0b" }}
          >
            <Plus size={15} /> Add Documentary
          </button>
        }
      />
      <div className="page-content">
        {/* Info banner */}
        <div
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 13,
            color: "#92400e",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Clapperboard size={15} style={{ color: "#f59e0b", flexShrink: 0 }} />
          These documentaries appear in the <strong>Science Course</strong> section of the
          iOS app. The AI summarizer uses the transcript field to generate video summaries.
        </div>

        <div className="card">
          <div className="card-header">
            <div className="search-bar">
              <Search />
              <input
                placeholder="Search documentaries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="toolbar">
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {filtered.length} results
              </span>
              <button className="btn btn-secondary btn-sm" onClick={load}>
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="empty-state">
                <div className="spinner" style={{ margin: "0 auto 12px" }} />
                <p>Loading documentaries...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <Clapperboard />
                <h3>No documentaries found</h3>
                <p>Add documentary videos for the Science course.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Thumbnail</th>
                    <th>Title</th>
                    <th>YouTube ID</th>
                    <th>Duration</th>
                    <th>Transcript</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <img
                          src={`https://img.youtube.com/vi/${d.youtubeID}/mqdefault.jpg`}
                          alt={d.title}
                          style={{
                            width: 80,
                            height: 45,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                          }}
                        />
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{d.title}</span>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            marginTop: 2,
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {d.description}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-secondary)" }}>
                            {d.youtubeID}
                          </span>
                          <a href={`https://youtube.com/watch?v=${d.youtubeID}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={12} style={{ color: "var(--text-muted)" }} />
                          </a>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Clock size={12} style={{ color: "var(--text-muted)" }} />
                          <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{d.duration}</span>
                        </div>
                      </td>
                      <td>
                        {d.transcript ? (
                          <span className="badge badge-green">Has transcript</span>
                        ) : (
                          <span className="badge badge-gray">No transcript</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-icon" onClick={() => openEdit(d)}>
                            <Pencil size={14} />
                          </button>
                          <button className="btn btn-danger btn-icon" onClick={() => setDeleteConfirm(d)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoc ? "Edit Documentary" : "Add Documentary"}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ background: "#f59e0b" }}
            >
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              {editingDoc ? "Save Changes" : "Add Documentary"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-control" placeholder="Documentary title" value={form.title} onChange={(e) => field("title", e.target.value)} />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">YouTube Video ID *</label>
            <input className="form-control" placeholder="e.g. dQw4w9WgXcQ" value={form.youtubeID} onChange={(e) => field("youtubeID", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Duration</label>
            <input className="form-control" placeholder="e.g. 45 min" value={form.duration} onChange={(e) => field("duration", e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" placeholder="Description..." value={form.description} onChange={(e) => field("description", e.target.value)} rows={2} />
        </div>
        <div className="form-group">
          <label className="form-label">Transcript <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(used by AI summarizer)</span></label>
          <textarea className="form-control" placeholder="Full video transcript text..." value={form.transcript} onChange={(e) => field("transcript", e.target.value)} rows={5} />
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Documentary"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              <Trash2 size={14} /> Delete
            </button>
          </>
        }
      >
        <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: "var(--text-primary)" }}>{deleteConfirm?.title}</strong>?
        </p>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
