"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getVideos,
  addVideo,
  updateVideo,
  deleteVideo,
  Video,
} from "@/lib/firestore";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { ToastContainer, useToast } from "@/components/Toast";
import { Plus, Search, Pencil, Trash2, Video as VideoIcon, RefreshCw, ExternalLink } from "lucide-react";

const CATEGORIES = ["Physics", "Chemistry", "Biology", "Mathematics", "Science", "Technology", "History", "General"];

interface VideoPageProps {
  videoType: "Short" | "Long";
}

export function VideosPage({ videoType }: VideoPageProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filtered, setFiltered] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [form, setForm] = useState<Omit<Video, "id">>({
    title: "",
    youtubeId: "",
    category: "Science",
    description: "",
    type: videoType,
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Video | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVideos(videoType);
      setVideos(data);
      setFiltered(data);
    } catch {
      addToast("Failed to load videos", "error");
    } finally {
      setLoading(false);
    }
  }, [videoType]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      videos.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.youtubeId.toLowerCase().includes(q)
      )
    );
  }, [search, videos]);

  const openAdd = () => {
    setEditingVideo(null);
    setForm({ title: "", youtubeId: "", category: "Science", description: "", type: videoType });
    setIsModalOpen(true);
  };

  const openEdit = (video: Video) => {
    setEditingVideo(video);
    setForm({ ...video });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.youtubeId) {
      addToast("Title and YouTube ID are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingVideo?.id) {
        await updateVideo(editingVideo.id, form);
        addToast("Video updated successfully");
      } else {
        await addVideo(form);
        addToast("Video added successfully");
      }
      setIsModalOpen(false);
      await load();
    } catch {
      addToast("Failed to save video", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (video: Video) => {
    if (!video.id) return;
    try {
      await deleteVideo(video.id);
      addToast("Video deleted");
      setDeleteConfirm(null);
      await load();
    } catch {
      addToast("Failed to delete video", "error");
    }
  };

  const field = (key: keyof Omit<Video, "id">, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const typeColor = videoType === "Short" ? "#3b82f6" : "#6366f1";
  const typeBadge = videoType === "Short" ? "badge-blue" : "badge-purple";

  return (
    <>
      <Header
        title={`${videoType} Videos`}
        description={`${videos.length} ${videoType.toLowerCase()} videos`}
        actions={
          <button className="btn btn-primary" onClick={openAdd} style={{ background: typeColor }}>
            <Plus size={15} /> Add {videoType} Video
          </button>
        }
      />
      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <div className="search-bar">
              <Search />
              <input
                placeholder="Search videos..."
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
                <p>Loading videos...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <VideoIcon />
                <h3>No videos found</h3>
                <p>Add your first {videoType.toLowerCase()} video to get started.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Thumbnail</th>
                    <th>Title</th>
                    <th>YouTube ID</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((video) => (
                    <tr key={video.id}>
                      <td>
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                          alt={video.title}
                          style={{
                            width: 80,
                            height: 45,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='45'%3E%3Crect fill='%23f3f4f6' width='80' height='45'/%3E%3C/svg%3E";
                          }}
                        />
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{video.title}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 12,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {video.youtubeId}
                          </span>
                          <a
                            href={`https://youtube.com/watch?v=${video.youtubeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink size={12} style={{ color: "var(--text-muted)" }} />
                          </a>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-gray">{video.category}</span>
                      </td>
                      <td>
                        <span className={`badge ${typeBadge}`}>{video.type}</span>
                      </td>
                      <td
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 12.5,
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {video.description}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-ghost btn-icon"
                            onClick={() => openEdit(video)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-icon"
                            onClick={() => setDeleteConfirm(video)}
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
        title={editingVideo ? `Edit ${videoType} Video` : `Add ${videoType} Video`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ background: typeColor }}
            >
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              {editingVideo ? "Save Changes" : "Add Video"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input
            className="form-control"
            placeholder="Video title"
            value={form.title}
            onChange={(e) => field("title", e.target.value)}
          />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">YouTube Video ID *</label>
            <input
              className="form-control"
              placeholder="e.g. dQw4w9WgXcQ"
              value={form.youtubeId}
              onChange={(e) => field("youtubeId", e.target.value)}
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
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            placeholder="Short description of the video..."
            value={form.description}
            onChange={(e) => field("description", e.target.value)}
            rows={3}
          />
        </div>
        {form.youtubeId && (
          <div
            style={{
              padding: "10px 12px",
              background: "var(--bg-main)",
              borderRadius: 8,
              fontSize: 12.5,
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Preview URL:{" "}
            <a
              href={`https://youtube.com/watch?v=${form.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--brand-500)" }}
            >
              youtube.com/watch?v={form.youtubeId}
            </a>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Video"
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
        </p>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
