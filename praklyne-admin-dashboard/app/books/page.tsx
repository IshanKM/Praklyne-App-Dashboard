"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  Book,
} from "@/lib/firestore";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { ToastContainer, useToast } from "@/components/Toast";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  BookOpen,
  RefreshCw,
} from "lucide-react";

const CATEGORIES = ["Fantasy", "Sci-Fi", "Classics", "Science", "History", "Technology", "General"];

const emptyBook: Omit<Book, "id"> = {
  title: "",
  author: "",
  category: "General",
  rating: 4.0,
  pages: 0,
  coverImage: "",
  pdfFileName: "",
  description: "",
  readingProgress: 0,
  isFavorite: false,
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filtered, setFiltered] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<Omit<Book, "id">>(emptyBook);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Book | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBooks();
      setBooks(data);
      setFiltered(data);
    } catch {
      addToast("Failed to load books", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      )
    );
  }, [search, books]);

  const openAdd = () => {
    setEditingBook(null);
    setForm(emptyBook);
    setIsModalOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setForm({ ...book });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.author) {
      addToast("Title and Author are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingBook?.id) {
        await updateBook(editingBook.id, form);
        addToast("Book updated successfully");
      } else {
        await addBook(form);
        addToast("Book added successfully");
      }
      setIsModalOpen(false);
      await load();
    } catch {
      addToast("Failed to save book", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (book: Book) => {
    if (!book.id) return;
    try {
      await deleteBook(book.id);
      addToast("Book deleted");
      setDeleteConfirm(null);
      await load();
    } catch {
      addToast("Failed to delete book", "error");
    }
  };

  const field = (key: keyof Omit<Book, "id">, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <>
      <Header
        title="Books"
        description={`${books.length} books in your library`}
        actions={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={15} /> Add Book
          </button>
        }
      />
      <div className="page-content">
        <div className="card">
          {/* Toolbar */}
          <div className="card-header">
            <div className="search-bar">
              <Search />
              <input
                placeholder="Search books..."
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

          {/* Table */}
          <div className="table-wrapper">
            {loading ? (
              <div className="empty-state">
                <div className="spinner" style={{ margin: "0 auto 12px" }} />
                <p>Loading books...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <BookOpen />
                <h3>No books found</h3>
                <p>Add your first book to get started.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Rating</th>
                    <th>Pages</th>
                    <th>PDF File</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((book) => (
                    <tr key={book.id}>
                      <td>
                        {book.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="cover-preview"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="cover-preview"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "var(--bg-main)",
                            }}
                          >
                            <BookOpen size={14} style={{ color: "var(--text-muted)" }} />
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{book.title}</span>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{book.author}</td>
                      <td>
                        <span className="badge badge-purple">{book.category}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Star
                            size={13}
                            fill="#f59e0b"
                            style={{ color: "#f59e0b", flexShrink: 0 }}
                          />
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{book.rating}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{book.pages}</td>
                      <td>
                        <span className="badge badge-gray" style={{ fontFamily: "monospace", fontSize: 11 }}>
                          {book.pdfFileName || "—"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-ghost btn-icon"
                            onClick={() => openEdit(book)}
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-icon"
                            onClick={() => setDeleteConfirm(book)}
                            title="Delete"
                          >
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
        title={editingBook ? "Edit Book" : "Add New Book"}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              {editingBook ? "Save Changes" : "Add Book"}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-control"
              placeholder="Book title"
              value={form.title}
              onChange={(e) => field("title", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Author *</label>
            <input
              className="form-control"
              placeholder="Author name"
              value={form.author}
              onChange={(e) => field("author", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={form.category}
              onChange={(e) => field("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Rating (0–5)</label>
            <input
              className="form-control"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={form.rating}
              onChange={(e) => field("rating", parseFloat(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Pages</label>
            <input
              className="form-control"
              type="number"
              min={0}
              value={form.pages}
              onChange={(e) => field("pages", parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">PDF Filename</label>
            <input
              className="form-control"
              placeholder="e.g. example_book"
              value={form.pdfFileName}
              onChange={(e) => field("pdfFileName", e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Cover Image URL</label>
          <input
            className="form-control"
            placeholder="https://..."
            value={form.coverImage}
            onChange={(e) => field("coverImage", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            placeholder="Short description of the book..."
            value={form.description}
            onChange={(e) => field("description", e.target.value)}
            rows={3}
          />
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Book"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              <Trash2 size={14} /> Delete
            </button>
          </>
        }
      >
        <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
          Are you sure you want to delete{" "}
          <strong style={{ color: "var(--text-primary)" }}>{deleteConfirm?.title}</strong>?
          This action cannot be undone.
        </p>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
