"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  Course,
} from "@/lib/firestore";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { ToastContainer, useToast } from "@/components/Toast";
import { Plus, Search, Pencil, Trash2, GraduationCap, Star, RefreshCw } from "lucide-react";

const COURSE_TYPES = ["English", "Science", "General"] as const;

const emptyCourse: Omit<Course, "id"> = {
  title: "",
  description: "",
  duration: "",
  rating: 4.0,
  image: "",
  type: "General",
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<Omit<Course, "id">>(emptyCourse);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Course | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
      setFiltered(data);
    } catch {
      addToast("Failed to load courses", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      courses.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.type || "").toLowerCase().includes(q)
      )
    );
  }, [search, courses]);

  const openAdd = () => {
    setEditingCourse(null);
    setForm(emptyCourse);
    setIsModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({ ...course });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) {
      addToast("Title is required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingCourse?.id) {
        await updateCourse(editingCourse.id, form);
        addToast("Course updated successfully");
      } else {
        await addCourse(form);
        addToast("Course added successfully");
      }
      setIsModalOpen(false);
      await load();
    } catch {
      addToast("Failed to save course", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course: Course) => {
    if (!course.id) return;
    try {
      await deleteCourse(course.id);
      addToast("Course deleted");
      setDeleteConfirm(null);
      await load();
    } catch {
      addToast("Failed to delete course", "error");
    }
  };

  const field = (key: keyof Omit<Course, "id">, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const typeColors: Record<string, string> = {
    English: "badge-blue",
    Science: "badge-green",
    General: "badge-purple",
  };

  return (
    <>
      <Header
        title="Courses"
        description={`${courses.length} courses available`}
        actions={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={15} /> Add Course
          </button>
        }
      />
      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <div className="search-bar">
              <Search />
              <input
                placeholder="Search courses..."
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
                <p>Loading courses...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <GraduationCap />
                <h3>No courses found</h3>
                <p>Add your first course to get started.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Rating</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((course) => (
                    <tr key={course.id}>
                      <td>
                        {course.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.image}
                            alt={course.title}
                            style={{
                              width: 48,
                              height: 48,
                              objectFit: "cover",
                              borderRadius: 8,
                              border: "1px solid var(--border)",
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              background: "var(--bg-main)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <GraduationCap size={18} style={{ color: "var(--text-muted)" }} />
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{course.title}</span>
                      </td>
                      <td>
                        <span className={`badge ${typeColors[course.type || "General"] || "badge-gray"}`}>
                          {course.type || "General"}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{course.duration}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Star size={13} fill="#f59e0b" style={{ color: "#f59e0b" }} />
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{course.rating}</span>
                        </div>
                      </td>
                      <td
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 12.5,
                          maxWidth: 220,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {course.description}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-icon" onClick={() => openEdit(course)}>
                            <Pencil size={14} />
                          </button>
                          <button className="btn btn-danger btn-icon" onClick={() => setDeleteConfirm(course)}>
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
        title={editingCourse ? "Edit Course" : "Add New Course"}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              {editingCourse ? "Save Changes" : "Add Course"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-control" placeholder="Course title" value={form.title} onChange={(e) => field("title", e.target.value)} />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-control" value={form.type} onChange={(e) => field("type", e.target.value)}>
              {COURSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Duration</label>
            <input className="form-control" placeholder="e.g. 4 weeks" value={form.duration} onChange={(e) => field("duration", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Rating (0–5)</label>
            <input className="form-control" type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => field("rating", parseFloat(e.target.value))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Image URL</label>
          <input className="form-control" placeholder="https://..." value={form.image} onChange={(e) => field("image", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" placeholder="Course description..." value={form.description} onChange={(e) => field("description", e.target.value)} rows={3} />
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Course"
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
