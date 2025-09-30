import React, { useState } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Flag,
  ClipboardList,
  Building2,
  Search,
  ChevronRight,
  Menu,
  Check,
  X,
} from "lucide-react";

// Brand palette
const colors = {
  paper: "#e7e7e7",
  mist: "#d2d3de",
  lilac: "#ac98cd",
  plum: "#6a509b",
};

// Shell layout reused from student dashboard but adapted for admin
function Shell({ page, setPage, children }) {
  const [open, setOpen] = useState(true);
  const nav = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { key: "societies", label: "Societies", icon: <Building2 size={18} /> },
    { key: "reports", label: "Reports", icon: <ClipboardList size={18} /> },
    { key: "moderation", label: "Moderation", icon: <Flag size={18} /> },
    { key: "users", label: "Users", icon: <Users size={18} /> },
  ];

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: `linear-gradient(to bottom, ${colors.plum} 0%, white 100%)` }}
    >
      {/* Topbar */}
      <div
        className="sticky top-0 z-40"
        style={{ borderBottom: `1px solid ${colors.mist}`, background: "white" }}
      >
        <div className="mx-auto max-w-7xl py-3 flex items-center gap-3 px-4 md:px-6 lg:px-8">
          <button
            className="md:hidden rounded-xl p-2"
            style={{ background: colors.mist }}
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <Menu />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="src/assets/icon1.png"
              alt="PukkeConnect Logo"
              className="size-10 rounded-xl object-contain flex-shrink-0"
            />
            {/* REMOVED 'Admin' from the title */}
            <div className="font-semibold hidden md:block" style={{ color: colors.plum }}>
              PukkeConnect
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-[360px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
              <input
                placeholder="Search users, societies, reports…"
                className="w-full rounded-2xl pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-lilac"
                style={{ background: colors.mist, color: "#111" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl py-6 grid grid-cols-12 gap-6 px-4 md:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className={`col-span-12 md:col-span-3 lg:col-span-2 ${open ? "block" : "hidden md:block"}`}>
          <div
            className="rounded-3xl p-3 sticky top-20"
            style={{ background: "white", border: `1px solid ${colors.mist}` }}
          >
            <nav className="space-y-1">
              {nav.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setPage(item.key);
                    // Close sidebar on mobile after clicking
                    if (window.innerWidth < 768) setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-left transition hover:bg-mist ${
                    page === item.key ? "text-white" : "text-gray-800"
                  }`}
                  style={{ background: page === item.key ? colors.lilac : "transparent" }}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <span className="text-sm font-medium truncate">{item.label}</span>
                  {page === item.key && <ChevronRight className="ml-auto flex-shrink-0" size={16} />}
                </button>
              ))}
            </nav>

            <div className="mt-4 p-3 rounded-2xl" style={{ background: colors.mist }}>
              <div className="text-xs opacity-70 mb-1">Logged in as</div>
              <div className="text-sm font-semibold">Admin</div>
              <div className="text-xs opacity-70">PukkeConnect</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

// Card wrapper for consistency
function Card({ title, subtitle, action, children }) {
  return (
    <div
      className="rounded-3xl p-4 md:p-5 shadow-sm"
      style={{ background: "white", border: `1px solid ${colors.mist}` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1">
          {title && (
            <h3 className="font-semibold text-lg" style={{ color: colors.plum }}>
              {title}
            </h3>
          )}
          {subtitle && <p className="text-sm opacity-70">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}


// Mock data
const stats = { users: 4520, societies: 128, reports: 14, active: 842 };
const pending = [
  { id: 1, name: "Campus Climbers", uni: "NWU", date: "2025-09-10", description: "Outdoor climbing and safety group." },
  { id: 2, name: "Quantum Circle", uni: "NWU", date: "2025-09-12", description: "Quantum computing study and research group." },
];
const flagged = [
  { id: 1, type: "Post", title: "Inappropriate meme", by: "student123" },
  { id: 2, type: "Comment", title: "Spam on Tech Expo", by: "bot_user" },
];
const activity = [
  "Admin Jana approved Society 'Debate Union' — 2h ago",
  "3 users reported a post in 'Photography Circle' — Yesterday",
  "New society application: 'Campus Climbers' — 2025-09-10",
];
const mockUsers = [
  { id: 101, name: "Jessica Smith", email: "jess.smith@nwu.ac.za", status: "Active", joined: "2024-01-15", reports: 0 },
  { id: 102, name: "Sipho Dlamini", email: "sipho.d@nwu.ac.za", status: "Active", joined: "2023-11-20", reports: 3 },
  { id: 103, name: "Emily Clark", email: "eclark@nwu.ac.za", status: "Suspended", joined: "2024-03-01", reports: 12 },
  { id: 104, name: "David Johnson", email: "djohnson@nwu.ac.za", status: "Active", joined: "2024-05-10", reports: 1 },
];

/**
 * Reusable component for displaying the list of pending society applications.
 */
function PendingSocietiesList() {
  // State for mock confirmation message (to avoid using alert())
  const [confirmMessage, setConfirmMessage] = useState(null);
  const pendingCount = pending.length;

  const handleApproveAll = () => {
    // Mock action: In a real app, this would trigger an API call.
    console.log(`ACTION: Approving all ${pendingCount} pending societies.`);
    setConfirmMessage(`Successfully approved all ${pendingCount} pending societies.`);
    
    // Clear the message after 3 seconds
    setTimeout(() => {
        setConfirmMessage(null);
    }, 3000);
  };

  const actionButton = pendingCount > 0 ? (
    <button 
      onClick={handleApproveAll}
      className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90 shadow-md" 
      style={{ background: colors.lilac, color: "white" }}
    >
      Approve All ({pendingCount})
    </button>
  ) : null;

  return (
    <Card 
      title="Pending Society Registrations" 
      subtitle="Review applications"
      action={actionButton} // Pass the "Approve All" button here
    >
      {/* Mock Confirmation Message */}
      <AnimatePresence>
        {confirmMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 mb-3 rounded-xl font-medium text-sm border"
            style={{ background: colors.paper, color: colors.plum, borderColor: colors.lilac }}
          >
            {confirmMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="space-y-3">
        {pending.map((s) => (
          <li key={s.id} className="p-3 rounded-2xl" style={{ background: colors.paper }}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs opacity-70">{s.uni} • {s.date}</div>
                <div className="text-sm mt-1 opacity-80">{s.description}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="rounded-xl px-3 py-1 text-sm flex items-center gap-1" style={{ background: colors.plum, color: "white" }}><Check size={14}/> Approve</button>
                <button className="rounded-xl px-3 py-1 text-sm flex items-center gap-1" style={{ background: colors.mist }}><X size={14}/> Reject</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}


// Pages
function DashboardPage() {
  return (
    <>
      {/* Welcome + Key Metrics */}
      <Card title="Welcome back, Admin 👋" subtitle="Here’s a quick glance at your platform metrics.">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-2xl p-4" style={{ background: colors.lilac }}>
            <div className="text-white/90 text-sm">Users</div>
            <div className="text-3xl font-bold text-white">{stats.users}</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: colors.plum }}>
            <div className="text-white/90 text-sm">Societies</div>
            <div className="text-3xl font-bold text-white">{stats.societies}</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: colors.mist }}>
            <div className="text-sm">Active this week</div>
            <div className="text-3xl font-bold">{stats.active}</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: colors.lilac }}>
            <div className="text-white/90 text-sm">Reports</div>
            <div className="text-3xl font-bold text-white">{stats.reports}</div>
          </div>
        </div>
      </Card>

      {/* Pending Societies (Summary Vibe) + Recent Activity in 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending Society Registrations - Quick action view */}
        <PendingSocietiesList />

        {/* Recent Activity: Enhanced with Mist dividers */}
        <Card title="Recent Activity" subtitle="A feed of recent moderation actions and platform events.">
          <ul className="space-y-0 divide-y" style={{ borderColor: colors.mist }}>
            {activity.map((a, i) => {
              // Split content and timestamp
              const parts = a.split(" — ");
              const content = parts[0];
              const time = parts[1];
              
              return (
                <li
                  key={i}
                  className="py-3 flex items-start gap-3 first:pt-0 last:pb-0"
                  style={{ borderColor: colors.mist }} 
                >
                  <ChevronRight size={18} className="mt-0.5 flex-shrink-0" style={{ color: colors.plum }}/>
                  <div className="flex-1 text-sm">
                    <span className="opacity-90 font-medium">{content}</span>
                    {time && <span className="block text-xs opacity-60 mt-0.5">{time}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}

function SocietiesPage() {
  // Societies page now primarily displays the full pending list
  return (
    <div className="space-y-6">
      <PendingSocietiesList />
      <Card title="Approved Societies List" subtitle="Search and manage all active societies.">
        <p className="text-sm opacity-80">
          This section will contain the complete searchable table for all 128 approved societies.
        </p>
      </Card>
    </div>
  );
}

function ReportsPage() {
  return (
    <Card title="Reports Summary" subtitle="Recent moderation activity">
      <ul className="text-sm opacity-80 space-y-2">
        <li>New reports in last 24h: 5</li>

        <li>Pending moderation: {flagged.length}</li>
      </ul>
      <p className="mt-4 text-xs opacity-60">
        This view provides an overview. Navigate to the Moderation tab for queue management.
      </p>
    </Card>
  );
}

function ModerationPage() {
  return (
    <Card title="Moderation Queue" subtitle={`Review and act on ${flagged.length} flagged content items.`}>
      <ul className="space-y-2">
        {flagged.map((f) => (
          <li key={f.id} className="p-3 rounded-2xl" style={{ background: colors.paper }}>
            <div className="font-medium">{f.title}</div>
            <div className="text-xs opacity-70">{f.type} reported by {f.by}</div>
            <div className="mt-2 flex gap-2">
              <button className="rounded-xl px-3 py-1 text-sm" style={{ background: colors.plum, color: "white" }}>Resolve</button>
              <button className="rounded-xl px-3 py-1 text-sm" style={{ background: colors.mist }}>View Original</button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function UsersPage() {
  return (
    <Card title="User Management" subtitle={`Viewing ${mockUsers.length} recent users. Use the search bar for full list lookup.`}>
      <div className="space-y-3">
        {mockUsers.map((user) => (
          <div key={user.id} className="p-3 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between" style={{ background: colors.paper }}>
            <div className="flex-1 min-w-0 mb-2 md:mb-0">
              <div className="font-medium truncate" style={{ color: colors.plum }}>{user.name}</div>
              <div className="text-xs opacity-70 truncate">{user.email} | Joined: {user.joined}</div>
              <div className={`text-xs font-semibold mt-1 ${user.status === 'Suspended' ? 'text-red-600' : 'text-green-600'}`}>
                {user.status} ({user.reports} reports)
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button className="rounded-xl px-3 py-1 text-sm" style={{ background: colors.lilac, color: "white" }}>
                View Profile
              </button>
              <button 
                className={`rounded-xl px-3 py-1 text-sm transition`}
                style={{ 
                  background: user.status === 'Suspended' ? colors.plum : colors.mist, 
                  color: user.status === 'Suspended' ? 'white' : 'black' 
                }}
              >
                {user.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Main Admin Dashboard
export default function PlatformAdminDashboard() {
  const [page, setPage] = useState("dashboard");

  return (
    <Shell page={page} setPage={setPage}>
      {/* Page Routing */}
      {page === "dashboard" && <DashboardPage />}
      {page === "societies" && <SocietiesPage />}
      {page === "reports" && <ReportsPage />}
      {page === "moderation" && <ModerationPage />}
      {page === "users" && <UsersPage />}
    </Shell>
  );
}
