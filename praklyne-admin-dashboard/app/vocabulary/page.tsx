"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getVocabulary,
  addVocabularyWord,
  updateVocabularyWord,
  deleteVocabularyWord,
  VocabularyWord,
} from "@/lib/firestore";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { ToastContainer, useToast } from "@/components/Toast";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Languages,
  RefreshCw,
  Upload,
} from "lucide-react";

const CATEGORIES = ["General", "Academic", "Business", "Technology", "Medical", "Science"];

const emptyWord: Omit<VocabularyWord, "id"> = {
  english: "",
  sinhala: "",
  category: "General",
  difficulty: 2,
};

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="difficulty-dots">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`difficulty-dot ${i <= level ? "filled" : ""}`}
        />
      ))}
    </div>
  );
}

export default function VocabularyPage() {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [filtered, setFiltered] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
  const [form, setForm] = useState<Omit<VocabularyWord, "id">>(emptyWord);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<VocabularyWord | null>(null);
  const [bulkText, setBulkText] = useState("");
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVocabulary();
      setWords(data);
    } catch {
      addToast("Failed to load vocabulary", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      words.filter(
        (w) =>
          (categoryFilter === "All" || w.category === categoryFilter) &&
          (w.english.toLowerCase().includes(q) || w.sinhala.toLowerCase().includes(q))
      )
    );
  }, [search, words, categoryFilter]);

  const openAdd = () => {
    setEditingWord(null);
    setForm(emptyWord);
    setIsModalOpen(true);
  };

  const openEdit = (word: VocabularyWord) => {
    setEditingWord(word);
    setForm({ ...word });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.english || !form.sinhala) {
      addToast("English and Sinhala fields are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingWord?.id) {
        await updateVocabularyWord(editingWord.id, form);
        addToast("Word updated successfully");
      } else {
        await addVocabularyWord(form);
        addToast("Word added successfully");
      }
      setIsModalOpen(false);
      await load();
    } catch {
      addToast("Failed to save word", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (word: VocabularyWord) => {
    if (!word.id) return;
    try {
      await deleteVocabularyWord(word.id);
      addToast("Word deleted");
      setDeleteConfirm(null);
      await load();
    } catch {
      addToast("Failed to delete word", "error");
    }
  };

  // Bulk import: one word per line: english,sinhala,category,difficulty
  const handleBulkImport = async () => {
    const lines = bulkText.trim().split("\n").filter((l) => l.trim());
    if (lines.length === 0) return;
    setBulkSaving(true);
    let count = 0;
    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        try {
          await addVocabularyWord({
            english: parts[0],
            sinhala: parts[1],
            category: parts[2] || "General",
            difficulty: parseInt(parts[3]) || 2,
          });
          count++;
        } catch {
          // skip
        }
      }
    }
    addToast(`Imported ${count} words successfully`);
    setBulkModalOpen(false);
    setBulkText("");
    setBulkSaving(false);
    await load();
  };

  const field = (key: keyof Omit<VocabularyWord, "id">, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const uniqueCategories = ["All", ...Array.from(new Set(words.map((w) => w.category)))];

  const diffColors = ["", "badge-green", "badge-blue", "badge-yellow", "badge-red", "badge-red"];

  return (
    <>
      <Header
        title="Vocabulary"
        description={`${words.length} words in the dictionary`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => setBulkModalOpen(true)}>
              <Upload size={15} /> Bulk Import
            </button>
            <button
              className="btn btn-primary"
              onClick={openAdd}
              style={{ background: "#ec4899" }}
            >
              <Plus size={15} /> Add Word
            </button>
          </div>
        }
      />
      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div className="search-bar">
                <Search />
                <input
                  placeholder="Search words..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="form-control"
                style={{ width: "auto", padding: "8px 12px" }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
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
                <p>Loading vocabulary...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <Languages />
                <h3>No words found</h3>
                <p>Add vocabulary words or use Bulk Import.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>English</th>
                    <th>Sinhala</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((word) => (
                    <tr key={word.id}>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{word.english}</span>
                      </td>
                      <td style={{ fontFamily: "sans-serif", fontSize: 14 }}>{word.sinhala}</td>
                      <td>
                        <span className="badge badge-gray">{word.category}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <DifficultyDots level={word.difficulty} />
                          <span
                            className={`badge ${diffColors[word.difficulty] || "badge-gray"}`}
                            style={{ fontSize: 11 }}
                          >
                            {word.difficulty}/5
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-icon" onClick={() => openEdit(word)}>
                            <Pencil size={14} />
                          </button>
                          <button className="btn btn-danger btn-icon" onClick={() => setDeleteConfirm(word)}>
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
        title={editingWord ? "Edit Word" : "Add Vocabulary Word"}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ background: "#ec4899" }}
            >
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              {editingWord ? "Save Changes" : "Add Word"}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">English *</label>
            <input className="form-control" placeholder="English word" value={form.english} onChange={(e) => field("english", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Sinhala *</label>
            <input className="form-control" placeholder="සිංහල" value={form.sinhala} onChange={(e) => field("sinhala", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" value={form.category} onChange={(e) => field("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Difficulty (1–5)</label>
            <input className="form-control" type="number" min={1} max={5} value={form.difficulty} onChange={(e) => field("difficulty", parseInt(e.target.value))} />
          </div>
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title="Bulk Import Vocabulary"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setBulkModalOpen(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleBulkImport}
              disabled={bulkSaving}
              style={{ background: "#ec4899" }}
            >
              {bulkSaving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Upload size={14} />}
              Import Words
            </button>
          </>
        }
      >
        <div
          style={{
            background: "rgba(236,72,153,0.05)",
            border: "1px solid rgba(236,72,153,0.2)",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12.5,
            color: "#831843",
            marginBottom: 16,
          }}
        >
          <strong>Format:</strong> One word per line. Each line:{" "}
          <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 4px", borderRadius: 3 }}>
            english,sinhala,category,difficulty
          </code>
          <br />
          Example: <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 4px", borderRadius: 3 }}>ability,හැකියාව,General,2</code>
        </div>
        <div className="form-group">
          <label className="form-label">Paste words below</label>
          <textarea
            className="form-control"
            placeholder={"ability,හැකියාව,General,2\nscience,විද්‍යාව,Academic,3\n..."}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={10}
            style={{ fontFamily: "monospace", fontSize: 12.5 }}
          />
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
          {bulkText.trim().split("\n").filter((l) => l.trim()).length} words to import
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Word"
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
          Delete <strong style={{ color: "var(--text-primary)" }}>{deleteConfirm?.english}</strong>{" "}
          ({deleteConfirm?.sinhala})?
        </p>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
