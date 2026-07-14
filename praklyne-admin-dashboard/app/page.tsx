"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/firestore";
import Header from "@/components/Header";
import Link from "next/link";
import {
  BookOpen,
  Video,
  Film,
  GraduationCap,
  Clapperboard,
  Languages,
  Users,
  Plus,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface Stats {
  books: number;
  videos: number;
  courses: number;
  documentaries: number;
  vocabulary: number;
  users: number;
}

const statCards = (stats: Stats) => [
  {
    label: "Books",
    value: stats.books,
    icon: BookOpen,
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.1)",
    accent: "#7c3aed",
    href: "/books",
  },
  {
    label: "Videos",
    value: stats.videos,
    icon: Video,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    accent: "#3b82f6",
    href: "/videos/short",
  },
  {
    label: "Courses",
    value: stats.courses,
    icon: GraduationCap,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    accent: "#10b981",
    href: "/courses",
  },
  {
    label: "Documentaries",
    value: stats.documentaries,
    icon: Clapperboard,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    accent: "#f59e0b",
    href: "/documentaries",
  },
  {
    label: "Vocabulary Words",
    value: stats.vocabulary,
    icon: Languages,
    color: "#ec4899",
    bg: "rgba(236,72,153,0.1)",
    accent: "#ec4899",
    href: "/vocabulary",
  },
  {
    label: "App Users",
    value: stats.users,
    icon: Users,
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.1)",
    accent: "#14b8a6",
    href: "/users",
  },
];

const quickActions = [
  { label: "Add Book", href: "/books", icon: BookOpen, color: "#7c3aed" },
  { label: "Add Short Video", href: "/videos/short", icon: Video, color: "#3b82f6" },
  { label: "Add Long Video", href: "/videos/long", icon: Film, color: "#6366f1" },
  { label: "Add Course", href: "/courses", icon: GraduationCap, color: "#10b981" },
  { label: "Add Documentary", href: "/documentaries", icon: Clapperboard, color: "#f59e0b" },
  { label: "Add Vocabulary", href: "/vocabulary", icon: Languages, color: "#ec4899" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    books: 0,
    videos: 0,
    courses: 0,
    documentaries: 0,
    vocabulary: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = statCards(stats);

  return (
    <>
      <Header
        title="Dashboard"
        description="Welcome back! Here's what's happening with Praklyne."
      />
      <div className="page-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href} style={{ textDecoration: "none" }}>
                <div className="stats-card" style={{ ["--accent" as string]: card.accent }}>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: card.color,
                      borderRadius: "16px 16px 0 0",
                    }}
                  />
                  <div
                    className="stats-card-icon"
                    style={{ background: card.bg, color: card.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="stats-card-body">
                    {loading ? (
                      <div className="spinner" style={{ marginBottom: 4 }} />
                    ) : (
                      <div className="stats-card-value">{card.value.toLocaleString()}</div>
                    )}
                    <div className="stats-card-label">{card.label}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Quick Actions</div>
              <div className="card-subtitle">Jump to a section and add new content</div>
            </div>
            <TrendingUp size={18} style={{ color: "var(--text-muted)" }} />
          </div>
          <div
            style={{
              padding: "20px 24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      background: "var(--bg-card)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = action.color;
                      (e.currentTarget as HTMLDivElement).style.background = `${action.color}10`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        "var(--border)";
                      (e.currentTarget as HTMLDivElement).style.background =
                        "var(--bg-card)";
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${action.color}18`,
                        color: action.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Plus size={14} />
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {action.label}
                    </span>
                    <ArrowRight
                      size={13}
                      style={{ marginLeft: "auto", color: "var(--text-muted)" }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Info Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)",
            borderRadius: 16,
            padding: "24px 28px",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              🎓 Praklyne Educational Learning App
            </div>
            <div style={{ fontSize: 13.5, opacity: 0.85, maxWidth: 480 }}>
              Manage all app content from this dashboard. Changes are synced to Firebase
              Firestore and immediately reflected in the iOS app for all users.
            </div>
          </div>
          <div
            style={{
              fontSize: 40,
              flexShrink: 0,
              opacity: 0.4,
            }}
          >
            📱
          </div>
        </div>
      </div>
    </>
  );
}
