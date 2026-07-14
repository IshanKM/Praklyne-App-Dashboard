"use client";

import { useEffect, useState, useCallback } from "react";
import { getUsers, AppUser } from "@/lib/firestore";
import Header from "@/components/Header";
import { ToastContainer, useToast } from "@/components/Toast";
import { Search, Users, RefreshCw, Mail, User } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [filtered, setFiltered] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toasts, addToast, removeToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
      setFiltered(data);
    } catch {
      addToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.email?.toLowerCase().includes(q) ||
          u.displayName?.toLowerCase().includes(q) ||
          u.uid?.toLowerCase().includes(q)
      )
    );
  }, [search, users]);

  return (
    <>
      <Header
        title="Users"
        description={`${users.length} registered app users`}
        actions={
          <button className="btn btn-secondary btn-sm" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />
      <div className="page-content">
        {/* Info banner */}
        <div
          style={{
            background: "rgba(20,184,166,0.07)",
            border: "1px solid rgba(20,184,166,0.2)",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 13,
            color: "#134e4a",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Users size={15} style={{ color: "#14b8a6", flexShrink: 0 }} />
          This is a <strong>read-only</strong> view of users synced from Firebase Auth.
          User management (ban, delete) should be done via the Firebase Console.
        </div>

        <div className="card">
          <div className="card-header">
            <div className="search-bar">
              <Search />
              <input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {filtered.length} results
            </span>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="empty-state">
                <div className="spinner" style={{ margin: "0 auto 12px" }} />
                <p>Loading users...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <Users />
                <h3>No users found</h3>
                <p>
                  Users appear here after they sign in to the app and their profile is synced
                  to Firestore.
                </p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>UID</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id}>
                      <td>
                        {user.photoURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              border: "1px solid var(--border)",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            {(user.displayName || user.email || "?")[0].toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <User size={13} style={{ color: "var(--text-muted)" }} />
                          <span style={{ fontWeight: 600, fontSize: 13.5 }}>
                            {user.displayName || "—"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Mail size={12} style={{ color: "var(--text-muted)" }} />
                          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 11.5,
                            color: "var(--text-muted)",
                            background: "var(--bg-main)",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {user.uid?.slice(0, 16)}...
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
