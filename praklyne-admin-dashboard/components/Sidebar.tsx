"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Film,
  GraduationCap,
  Clapperboard,
  Languages,
  Users,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/users", icon: Users, label: "Users" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/books", icon: BookOpen, label: "Books" },
      { href: "/videos/short", icon: Video, label: "Short Videos" },
      { href: "/videos/long", icon: Film, label: "Long Videos" },
      { href: "/courses", icon: GraduationCap, label: "Courses" },
      { href: "/documentaries", icon: Clapperboard, label: "Documentaries" },
    ],
  },
  {
    label: "Learning",
    items: [
      { href: "/vocabulary", icon: Languages, label: "Vocabulary" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">P</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">Praklyne</span>
          <span className="sidebar-brand-sub">Admin Dashboard</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive(item.href) ? "active" : ""}`}
                >
                  <Icon size={16} />
                  {item.label}
                  {isActive(item.href) && (
                    <ChevronRight size={13} style={{ marginLeft: "auto", opacity: 0.5 }} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div
          className="nav-item"
          style={{ color: "#ef4444", cursor: "pointer" }}
          onClick={() => {}}
        >
          <LogOut size={16} />
          Sign Out
        </div>
      </div>
    </aside>
  );
}
