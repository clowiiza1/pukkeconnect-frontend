import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Building2,
  Search,
  ChevronRight,
  Menu,
  Check,
  X,
  Calendar,
  MessageSquare,
  BarChart3,
  Bell,
  Plus,
  Home,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SocietiesManager from "./SocietiesManager.jsx";

import ReportsPanel from "./ReportsPanel.jsx";

import UsersManager from "./UsersManager.jsx";
import EventsManager from "./EventsManager.jsx";
import PostsManager from "./PostsManager.jsx";
import AnalyticsPage from "./AnalyticsPage.jsx";
import AnnouncementsPage from "./AnnouncementsPage.jsx";
import { api, asApiError } from "@/services/apis.jsx";
import { approveSociety, rejectSociety } from "@/services/admin.js";
import { useAuth } from "@/context/AuthContext";

// Brand palette
const colors = {
  paper: "#e7e7e7",
  mist: "#d2d3de",
  lilac: "#ac98cd",
  plum: "#6a509b",
};

const campusOptions = ["Mafikeng", "Potchefstroom", "Vanderbijlpark"];

// Shell layout reused from student dashboard but adapted for admin
function Shell({ page, setPage, children }) {
  const [open, setOpen] = useState(true);
  const { user, logout } = useAuth();
  const nav = [
    { key: "dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { key: "announcements", label: "Announcements", icon: <Bell size={18} /> },
    { key: "societies", label: "Societies", icon: <Building2 size={18} /> },
    { key: "users", label: "Users", icon: <Users size={18} /> },
    { key: "events", label: "Events", icon: <Calendar size={18} /> },
    { key: "posts", label: "Posts", icon: <MessageSquare size={18} /> },
    { key: "reports", label: "Reports", icon: <ClipboardList size={18} /> },
    { key: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
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
          <Link
            to="/"
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lilac rounded-xl"
            aria-label="Go to PukkeConnect home"
          >
            <img
              src="src/assets/icon1.png"
              alt="PukkeConnect Logo"
              className="size-10 rounded-xl object-contain flex-shrink-0"
            />
            <span className="font-semibold hidden md:block" style={{ color: colors.plum }}>
              PukkeConnect
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-opacity-20"
              style={{ background: colors.mist }}
            >
              <Home size={18} style={{ color: colors.plum }} />
              <span className="text-sm font-medium hidden md:block" style={{ color: colors.plum }}>
                Home
              </span>
            </Link>
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-opacity-80"
              style={{ background: colors.plum, color: 'white' }}
            >
              <LogOut size={18} />
              <span className="text-sm font-medium hidden md:block">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl py-6 grid grid-cols-12 gap-6 px-4 md:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className={`col-span-12 md:col-span-4 lg:col-span-3 ${open ? "block" : "hidden md:block"}`}>
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
                  <span className="text-sm font-medium">{item.label}</span>
                  {page === item.key && <ChevronRight className="ml-auto flex-shrink-0" size={16} />}
                </button>
              ))}
            </nav>

            <div className="mt-4 p-3 rounded-2xl" style={{ background: colors.mist }}>
              <div className="text-xs opacity-70 mb-1">Logged in as</div>
              <div className="text-sm font-semibold">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || "Admin"}
              </div>
              <div className="text-xs opacity-70">
                {user?.role === "university_admin" ? "University Admin" : user?.role || "PukkeConnect"}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-8 lg:col-span-9">
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


/**
 * Reusable component for displaying the list of pending society applications.
 */
function PendingSocietiesList() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmMessage, setConfirmMessage] = useState(null);

  useEffect(() => {
    loadPendingSocieties();
  }, []);

  const loadPendingSocieties = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/societies", { params: { status: "pending", limit: 100 } });
      setPending(response.data.data || []);
    } catch (err) {
      console.error("Failed to load pending societies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (societyId) => {
    try {
      await approveSociety(societyId);
      setConfirmMessage(`Successfully approved society`);
      setTimeout(() => setConfirmMessage(null), 3000);
      // Reload the list
      loadPendingSocieties();
    } catch (err) {
      setConfirmMessage(`Error: ${asApiError(err)?.message || "Failed to approve"}`);
      setTimeout(() => setConfirmMessage(null), 3000);
    }
  };

  const handleReject = async (societyId) => {
    try {
      await rejectSociety(societyId);
      setConfirmMessage(`Successfully rejected society`);
      setTimeout(() => setConfirmMessage(null), 3000);
      // Reload the list
      loadPendingSocieties();
    } catch (err) {
      setConfirmMessage(`Error: ${asApiError(err)?.message || "Failed to reject"}`);
      setTimeout(() => setConfirmMessage(null), 3000);
    }
  };

  const pendingCount = pending.length;

  return (
    <Card
      title="Pending Society Registrations"
      subtitle={loading ? "Loading..." : `${pendingCount} pending application${pendingCount !== 1 ? 's' : ''}`}
    >
      {/* Confirmation Message */}
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

      {loading ? (
        <div className="text-center py-8 text-sm opacity-70">Loading pending societies...</div>
      ) : pendingCount === 0 ? (
        <div className="text-center py-8 text-sm opacity-70">No pending applications</div>
      ) : (
        <ul className="space-y-3">
          {pending.map((s) => (
            <li key={s.societyId} className="p-3 rounded-2xl" style={{ background: colors.paper }}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs opacity-70">
                    {s.campus || "NWU"} • {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm mt-1 opacity-80">{s.description || "No description"}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(s.societyId)}
                    className="rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition hover:opacity-90"
                    style={{ background: colors.plum, color: "white" }}
                  >
                    <Check size={14}/> Approve
                  </button>
                  <button
                    onClick={() => handleReject(s.societyId)}
                    className="rounded-xl px-3 py-1 text-sm flex items-center gap-1 transition hover:opacity-90"
                    style={{ background: colors.mist }}
                  >
                    <X size={14}/> Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}


// Pages
function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    loadStats();
    loadRecentUsers();
    loadRecentEvents();
    loadRecentPosts();
  }, []);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const response = await api.get("/admin/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadRecentUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get("/admin/users", { params: { limit: 5 } });
      setRecentUsers(response.data.data || []);
    } catch (err) {
      console.error("Failed to load recent users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadRecentEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await api.get("/events", { params: { limit: 5 } });
      setRecentEvents(response.data.data || []);
    } catch (err) {
      console.error("Failed to load recent events:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadRecentPosts = async () => {
    try {
      setLoadingPosts(true);
      const response = await api.get("/admin/posts", { params: { limit: 5 } });
      setRecentPosts(response.data.data || []);
    } catch (err) {
      console.error("Failed to load recent posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  return (
    <>
      {/* Welcome + Key Metrics */}
      <Card title="Welcome back, Admin 👋" subtitle="Here's a quick glance at your platform metrics.">
        {loadingStats ? (
          <div className="text-center py-8 text-sm opacity-70">Loading metrics...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-2xl p-4" style={{ background: colors.lilac }}>
              <div className="text-white/90 text-sm">Users</div>
              <div className="text-3xl font-bold text-white">{stats?.users || 0}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: colors.plum }}>
              <div className="text-white/90 text-sm">Societies</div>
              <div className="text-3xl font-bold text-white">{stats?.societies || 0}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: colors.mist }}>
              <div className="text-sm">Events</div>
              <div className="text-3xl font-bold">{stats?.events || 0}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: colors.lilac }}>
              <div className="text-white/90 text-sm">Posts</div>
              <div className="text-3xl font-bold text-white">{stats?.posts || 0}</div>
            </div>
          </div>
        )}
      </Card>

      {/* Pending Societies (Summary Vibe) + Recent Users in 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending Society Registrations - Quick action view */}
        <PendingSocietiesList />

        {/* Recent Users */}
        <Card title="Recent Users" subtitle="Latest user registrations">
          {loadingUsers ? (
            <div className="text-center py-8 text-sm opacity-70">Loading users...</div>
          ) : recentUsers.length === 0 ? (
            <div className="text-center py-8 text-sm opacity-70">No recent users</div>
          ) : (
            <ul className="space-y-0 divide-y" style={{ borderColor: colors.mist }}>
              {recentUsers.map((user) => (
                <li
                  key={user.id}
                  className="py-3 flex items-start gap-3 first:pt-0 last:pb-0"
                  style={{ borderColor: colors.mist }}
                >
                  <ChevronRight size={18} className="mt-0.5 flex-shrink-0" style={{ color: colors.plum }}/>
                  <div className="flex-1 text-sm">
                    <span className="opacity-90 font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="block text-xs opacity-60 mt-0.5">
                      {user.universityNumber} • {user.role} • {user.campus || "N/A"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Recent Events and Posts in 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Events */}
        <Card title="Recent Events" subtitle="Latest events across societies">
          {loadingEvents ? (
            <div className="text-center py-8 text-sm opacity-70">Loading events...</div>
          ) : recentEvents.length === 0 ? (
            <div className="text-center py-8 text-sm opacity-70">No recent events</div>
          ) : (
            <ul className="space-y-0 divide-y" style={{ borderColor: colors.mist }}>
              {recentEvents.map((event) => (
                <li
                  key={event.id}
                  className="py-3 flex items-start gap-3 first:pt-0 last:pb-0"
                  style={{ borderColor: colors.mist }}
                >
                  <ChevronRight size={18} className="mt-0.5 flex-shrink-0" style={{ color: colors.plum }}/>
                  <div className="flex-1 text-sm">
                    <span className="opacity-90 font-medium">
                      {event.title}
                    </span>
                    <span className="block text-xs opacity-60 mt-0.5">
                      {event.society?.name || "N/A"} • {new Date(event.startsAt).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent Posts */}
        <Card title="Recent Posts" subtitle="Latest posts from societies">
          {loadingPosts ? (
            <div className="text-center py-8 text-sm opacity-70">Loading posts...</div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-8 text-sm opacity-70">No recent posts</div>
          ) : (
            <ul className="space-y-0 divide-y" style={{ borderColor: colors.mist }}>
              {recentPosts.map((post) => (
                <li
                  key={post.id}
                  className="py-3 flex items-start gap-3 first:pt-0 last:pb-0"
                  style={{ borderColor: colors.mist }}
                >
                  <ChevronRight size={18} className="mt-0.5 flex-shrink-0" style={{ color: colors.plum }}/>
                  <div className="flex-1 text-sm">
                    <span className="opacity-90 font-medium">
                      {post.society?.name || "N/A"}
                    </span>
                    <span className="block text-xs opacity-60 mt-0.5">
                      {post.content.substring(0, 60)}{post.content.length > 60 ? "..." : ""}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function SocietiesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    category: "",
    campus: "",
    adminUserId: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (showCreateModal) {
      loadUsers();
    }
  }, [showCreateModal]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get("/admin/users", { params: { limit: 100 } });
      setUsers(response.data.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreate = async () => {
    try {
      setCreating(true);
      setCreateError(null);

      const response = await api.post("/societies", {
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        category: createForm.category.trim() || undefined,
        campus: createForm.campus || undefined,
      });

      const societyId = response.data.societyId;

      // If an admin was selected, assign them to the society
      if (createForm.adminUserId) {
        await api.put(`/societies/${societyId}/assign-admin`, {
          adminUserId: createForm.adminUserId,
        });
      }

      // Reset form and close modal
      setCreateForm({ name: "", description: "", category: "", campus: "", adminUserId: "" });
      setShowCreateModal(false);
      // Note: You might want to trigger a refresh of the societies list here
    } catch (err) {
      setCreateError(asApiError(err)?.message || "Failed to create society");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PendingSocietiesList />
      <Card
        title="Approved Societies"
        subtitle="Search and manage every approved society."
        action={
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90 shadow-md flex items-center gap-2"
            style={{ background: colors.plum, color: "white" }}
          >
            <Plus size={16} />
            Create Society
          </button>
        }
      >
        <SocietiesManager campusOptions={campusOptions} />
      </Card>

      {/* Create Society Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl p-6"
              style={{ background: "white", border: `1px solid ${colors.mist}` }}
            >
              <h3 className="text-xl font-semibold mb-4" style={{ color: colors.plum }}>
                Create New Society
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Society Name *</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.mist, focusRing: colors.lilac }}
                    placeholder="e.g. AI & Robotics Society"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Description *</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                    style={{ borderColor: colors.mist }}
                    placeholder="Brief description of the society..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Category *</label>
                  <input
                    type="text"
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.mist }}
                    placeholder="e.g. Technology, Arts, Sports"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Campus *</label>
                  <select
                    value={createForm.campus}
                    onChange={(e) => setCreateForm({ ...createForm, campus: e.target.value })}
                    className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.mist }}
                  >
                    <option value="">Select campus</option>
                    {campusOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Assign Society Admin (Optional)</label>
                  <select
                    value={createForm.adminUserId}
                    onChange={(e) => setCreateForm({ ...createForm, adminUserId: e.target.value })}
                    className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.mist }}
                    disabled={loadingUsers}
                  >
                    <option value="">No admin assigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.universityNumber})
                      </option>
                    ))}
                  </select>
                  {loadingUsers && (
                    <div className="text-xs text-gray-500 mt-1">Loading users...</div>
                  )}
                </div>

                {createError && (
                  <div className="p-3 rounded-xl text-sm font-medium" style={{ background: "#fee", color: "#c00" }}>
                    {createError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCreate}
                    disabled={creating || !createForm.name.trim() || !createForm.description.trim() || !createForm.category.trim() || !createForm.campus}
                    className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
                    style={{ background: colors.plum }}
                  >
                    {creating ? "Creating..." : "Create Society"}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateForm({ name: "", description: "", category: "", campus: "", adminUserId: "" });
                      setCreateError(null);
                    }}
                    disabled={creating}
                    className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition"
                    style={{ background: colors.mist }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border p-6" style={{ borderColor: colors.mist, background: "white" }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: colors.plum }}>
          Data Reports & Analytics
        </h2>
        <p className="text-sm text-gray-600">
          Generate comprehensive reports on societies, events, users, posts, and engagement metrics. Filter by campus and date range, then export to PDF.
        </p>
      </div>
      <ReportsPanel />
    </div>
  );
}

function UsersPage() {
  return (
    <Card
      title="User Management"
      subtitle="Browse all platform users, update their details, or remove access."
    >
      <UsersManager campusOptions={campusOptions} />
    </Card>
  );
}

function EventsPage() {
  return (
    <Card
      title="Event Management"
      subtitle="Browse and manage all events across all societies."
    >
      <EventsManager campusOptions={campusOptions} />
    </Card>
  );
}

function PostsPage() {
  return (
    <Card
      title="Post Management"
      subtitle="Browse and manage all posts across all societies."
    >
      <PostsManager />
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
      {page === "analytics" && <AnalyticsPage />}
      {page === "announcements" && <AnnouncementsPage />}
      {page === "societies" && <SocietiesPage />}
      {page === "reports" && <ReportsPage />}
      {page === "users" && <UsersPage />}
      {page === "events" && <EventsPage />}
      {page === "posts" && <PostsPage />}
    </Shell>
  );
}
