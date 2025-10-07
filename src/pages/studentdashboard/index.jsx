import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Compass,
  Bell,
  CalendarDays,
  Sparkles,
  Search,
  Plus,
  Check,
  Clock,
  ChevronRight,
  Menu,
  Inbox,
  Home,
  LogOut,
  MessageSquare,
  Heart,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import {
  fetchHomeRecommendations,
  fetchSocietyDetail,
  leaveSociety,
  joinSociety,
  listSocieties,
  fetchMembershipStatus,
  listEvents,
  listStudentMemberships,
  toggleEventRsvp,
} from "@/services/dashboard";
import {
  getMyProfile,
  updateMyProfile,
  getCurrentUser,
  updateCurrentUser,
} from "@/services/profile";
import { listInterests, getStudentInterests, setStudentInterests } from "@/services/interests";
import { fetchMatchmakerQuiz, submitMatchmakerQuizAnswers } from "@/services/quizzes";
import { listNotifications, markNotificationSeen } from "@/services/notifications";
import { getPostsFeed, togglePostLike } from "@/services/posts";
import brandIcon from "@/assets/icon1.png";

// Brand palette
const colors = {
  paper: "#e7e7e7",
  mist: "#d2d3de",
  lilac: "#ac98cd",
  plum: "#6a509b",
};

const MEMBERSHIP_STATUS_ALIASES = new Map([
  ["pending", "pending"],
  ["pending_approval", "pending"],
  ["awaiting_approval", "pending"],
  ["awaiting_review", "pending"],
  ["awaiting_confirmation", "pending"],
  ["in_review", "pending"],
  ["under_review", "pending"],
  ["processing", "pending"],
  ["requested", "pending"],
  ["request_pending", "pending"],
  ["active", "active"],
  ["approved", "active"],
  ["accepted", "active"],
  ["member", "active"],
  ["joined", "active"],
  ["active_member", "active"],
  ["inactive", "inactive"],
  ["left", "inactive"],
  ["withdrawn", "inactive"],
  ["cancelled", "inactive"],
  ["canceled", "inactive"],
  ["rejected", "rejected"],
  ["declined", "rejected"],
  ["denied", "rejected"],
  ["removed", "rejected"],
  ["blocked", "rejected"],
]);

function normalizeMembershipStatusValue(value) {
  if (value == null) return null;
  const raw = typeof value === "string" ? value.trim() : String(value).trim();
  if (!raw) return null;
  const canonical = raw.toLowerCase().replace(/[\s-]+/g, "_");
  if (!/[a-z]/.test(canonical)) return null;
  return MEMBERSHIP_STATUS_ALIASES.get(canonical) ?? canonical;
}

function extractMembershipStatusFromPayload(payload) {
  if (!payload || typeof payload === "boolean") return null;
  if (typeof payload === "string") {
    return normalizeMembershipStatusValue(payload);
  }
  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const normalized = extractMembershipStatusFromPayload(entry);
      if (normalized) return normalized;
    }
    return null;
  }
  if (typeof payload === "object") {
    const directKeys = [
      "status",
      "membershipStatus",
      "membership_status",
      "state",
      "membership_state",
    ];
    for (const key of directKeys) {
      const candidate = payload[key];
      if (typeof candidate === "string") {
        const normalized = normalizeMembershipStatusValue(candidate);
        if (normalized) return normalized;
      } else if (candidate && typeof candidate === "object") {
        const normalized = extractMembershipStatusFromPayload(candidate);
        if (normalized) return normalized;
      }
    }
    if (payload.data) {
      const normalized = extractMembershipStatusFromPayload(payload.data);
      if (normalized) return normalized;
    }
    if (payload.result) {
      const normalized = extractMembershipStatusFromPayload(payload.result);
      if (normalized) return normalized;
    }
  }
  return null;
}

function formatMembershipStatusLabel(status) {
  if (!status) return null;
  const normalized = normalizeMembershipStatusValue(status);
  if (!normalized) {
    const raw = typeof status === "string" ? status.trim() : String(status);
    if (!raw) return null;
    return raw.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }
  switch (normalized) {
    case "pending":
      return "Pending approval";
    case "active":
      return "Active member";
    case "rejected":
      return "Request declined";
    case "inactive":
      return "Inactive";
    default:
      return normalized.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

// Simple layout shell with responsive sidebar
function Shell({ page, setPage, children, student, studentLoading }) {
  const [open, setOpen] = useState(true);
  const { logout } = useAuth();
  const nav = [
    { key: "dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { key: "profile", label: "My Profile", icon: <User size={18} /> },
    { key: "explore", label: "Explore", icon: <Compass size={18} /> },
    { key: "details", label: "Societies", icon: <Sparkles size={18} /> },
    { key: "posts", label: "Posts", icon: <MessageSquare size={18} /> },
    { key: "quiz", label: "Quiz", icon: <Inbox size={18} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { key: "events", label: "Events", icon: <CalendarDays size={18} /> },
  ];

  const firstName = typeof student?.firstName === "string" ? student.firstName.trim() : "";
  const lastName = typeof student?.lastName === "string" ? student.lastName.trim() : "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const studyField = typeof student?.studyField === "string" ? student.studyField.trim() : "";
  const campus = typeof student?.campus === "string" ? student.campus.trim() : "";
  const secondaryLine = [studyField, campus].filter(Boolean).join(" • ");
  const showEmptyHint = !secondaryLine;

  return (
    // gradient background to the main page container
    <div
      className="min-h-screen font-sans"
      style={{
        background: `linear-gradient(to bottom, ${colors.plum} 0%, white 100%)`,
      }}
    >
      {/* Topbar */}
      <div
        className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70"
        style={{ borderBottom: `1px solid ${colors.mist}`,
        background: "white",
       }}
      >
        {/* responsive horizontal padding */}
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
            className="flex items-center gap-2 rounded-xl px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-mediumpur/70"
          >
            <img
              src={brandIcon}
              alt="PukkeConnect Logo"
              className="size-10 rounded-xl object-contain flex-shrink-0"
              style={{
                background: colors.white,
              }}
            />
            <span className="hidden md:block font-semibold" style={{ color: colors.plum }}>
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

      {/* keeping responsive horizontal padding */}
      <div className="mx-auto max-w-7xl py-6 grid grid-cols-12 gap-6 px-4 md:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className={`col-span-12 md:col-span-3 lg:col-span-2 ${open ? "block" : "hidden md:block"}`}>
          <div className="rounded-3xl p-3 sticky top-20"
            style={{ background: "white", border: `1px solid ${colors.mist}` }}
          >
            <nav className="space-y-1">
              {nav.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setPage(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-left transition hover:bg-mist ${page === item.key ? "text-white" : "text-gray-800"}`}
                  style={{
                    background: page === item.key ? colors.lilac : "transparent",
                  }}
                >
                  {/* Wrapped icon in a div with flex-shrink-0 to prevent shrinking */}
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  {/*  truncate to the span for text overflow handling */}
                  <span className="text-sm font-medium truncate">{item.label}</span>
                  {/* flex-shrink-0 to ChevronRight as well */}
                  {page === item.key && <ChevronRight className="ml-auto flex-shrink-0" size={16} />}
                </button>
              ))}
            </nav>

            <div className="mt-4 p-3 rounded-2xl" style={{ background: colors.mist }}>
              {studentLoading ? (
                <div className="space-y-2">
                  <SkeletonBlock className="h-3 w-2/3" />
                  <SkeletonBlock className="h-4 w-3/4" />
                  <SkeletonBlock className="h-3 w-1/2" />
                </div>
              ) : (
                <>
                  <div
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: colors.plum }}
                  >
                    Pleased to see you again
                  </div>
                  <div className="text-sm font-semibold">
                    {displayName || "Welcome back"}
                  </div>
                  {secondaryLine ? (
                    <div className="text-xs opacity-70">{secondaryLine}</div>
                  ) : (
                    <div className="text-xs opacity-60 italic">
                      Add your campus and study field in your profile.
                    </div>
                  )}
                </>
              )}
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

// Reusable UI
function Card({ title, subtitle, action, children }) {
  return (
    <div
      className="rounded-3xl p-4 md:p-5 shadow-sm"
      style={{ background: "white", border: `1px solid ${colors.mist}` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1">
          {title && <h3 className="font-semibold text-lg" style={{ color: colors.plum }}>{title}</h3>}
          {subtitle && <p className="text-sm opacity-70">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="text-xs rounded-xl px-2 py-1" style={{ background: colors.mist }}>
      {children}
    </span>
  );
}

// Mock data
const fallbackRecommended = [
  { id: 1, name: "AI & Robotics Society", tags: ["AI", "Workshops"], members: 1242 },
  { id: 2, name: "Hiking & Nature Club", tags: ["Outdoors", "Weekend"], members: 684 },
  { id: 3, name: "Entrepreneurs NWU", tags: ["Pitch", "Networking"], members: 910 },
];

const fallbackEvents = [
  { id: 1, title: "Campus Tech Expo", date: "Sep 10, 2025", time: "14:00", location: "Hall B", rsvp: true },
  { id: 2, title: "Sunset Hiking Trail", date: "Sep 14, 2025", time: "16:30", location: "Koppie", rsvp: false },
  { id: 3, title: "Startup Pitch Night", date: "Sep 20, 2025", time: "18:00", location: "Innovation Hub", rsvp: false },
];

const fallbackSocieties = [
  { id: "demo-1", name: "Photography Circle", category: "Arts", tags: ["Creativity", "Workshops"], liked: true, membershipStatus: "active" },
  { id: "demo-2", name: "Data Science Guild", category: "Tech", tags: ["Python", "Kaggle"], liked: false, membershipStatus: "active" },
  { id: "demo-3", name: "Debate Union", category: "Academic", tags: ["Public Speaking"], liked: false, membershipStatus: "active" },
  { id: "demo-4", name: "Chess Club", category: "Games", tags: ["Strategy"], liked: true, membershipStatus: "active" },
];

const fallbackDashboard = {
  summary: {
    activeSocieties: 4,
    upcomingEvents: 3,
    newMatches: 6,
  },
  recommended: fallbackRecommended,
  events: fallbackEvents,
  societies: fallbackSocieties,
};

const emptyDashboard = {
  summary: null,
  recommended: [],
  events: [],
  societies: [],
};

const HOME_RAIL_CONFIG = [
  {
    key: "because",
    matchers: ["because"],
    fallbackHeading: "Because you like...",
    fallbackSubtitle: "Handpicked to match your interests",
    getHeading: (rail) => {
      const reason = typeof rail?.reasonTag === "string" && rail.reasonTag.trim();
      if (reason) return `Because you like ${reason}`;
      const title = rail?.title ?? "";
      if (title) return title.replace(/liked/i, "like");
      return "Because you like...";
    },
    getSubtitle: (rail) => joinReasons(rail?.reasons, rail?.title, "Handpicked to match your interests"),
  },
  {
    key: "popular",
    matchers: ["popular"],
    fallbackHeading: "Popular this week",
    fallbackSubtitle: "Trending with students across campus",
    getHeading: () => "Popular this week",
    getSubtitle: (rail) => joinReasons(rail?.reasons, rail?.title, "Trending with students across campus"),
  },
  {
    key: "active",
    matchers: ["active", "fresh", "now"],
    fallbackHeading: "Active right now",
    fallbackSubtitle: "Societies buzzing with new activity",
    getHeading: () => "Active right now",
    getSubtitle: (rail) => joinReasons(rail?.reasons, rail?.title, "Societies buzzing with new activity"),
  },
];

function joinReasons(reasons, fallbackTitle, fallbackCopy) {
  if (Array.isArray(reasons) && reasons.length) {
    return reasons.join(" • ");
  }
  if (fallbackTitle) return fallbackTitle;
  return fallbackCopy;
}

function matchesTokens(rail, tokens) {
  const title = typeof rail?.title === "string" ? rail.title.toLowerCase() : "";
  return tokens.some((token) => title.includes(token));
}

function normalizeHomeRecommendations(payload) {
  const rails = Array.isArray(payload?.rails) ? payload.rails.filter(Boolean) : [];
  const remaining = [...rails];
  const selection = new Map();

  for (const config of HOME_RAIL_CONFIG) {
    const index = remaining.findIndex((rail) => matchesTokens(rail, config.matchers));
    if (index >= 0) {
      selection.set(config.key, remaining.splice(index, 1)[0]);
    }
  }

  for (const config of HOME_RAIL_CONFIG) {
    if (!selection.has(config.key) && remaining.length) {
      selection.set(config.key, remaining.shift());
    }
  }

  return HOME_RAIL_CONFIG.map((config) => {
    const rail = selection.get(config.key) ?? null;
    return {
      key: config.key,
      heading: config.getHeading?.(rail) ?? config.fallbackHeading,
      subtitle: config.getSubtitle?.(rail) ?? config.fallbackSubtitle,
      items: mapRecommendationItems(rail?.items),
    };
  });
}

function mapRecommendationItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => {
    const rawId = item?.societyId ?? item?.id ?? item?.society_id ?? index;
    const id = typeof rawId === "bigint" ? rawId.toString() : String(rawId);
    return {
      societyId: id,
      name: item?.name ?? "Untitled society",
      category: item?.category ?? null,
      campus: item?.campus ?? null,
      description: item?.description ?? null,
      matchScore: typeof item?.matchScore === "number" ? item.matchScore : null,
      reasonPills: Array.isArray(item?.reasonPills) ? item.reasonPills : [],
      interestTags: Array.isArray(item?.interestTags) ? item.interestTags : [],
    };
  });
}

function getSocietyId(entity) {
  if (!entity) return null;
  const raw = entity.id ?? entity.societyId ?? entity.society_id ?? null;
  if (raw === null || raw === undefined) return null;
  return typeof raw === "bigint" ? raw.toString() : String(raw);
}

function formatDateTimeLabel(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLabel(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function isSocietyJoined(entity) {
  if (!entity) return false;
  if (typeof entity.isMember === "boolean") return entity.isMember;
  const status = entity.membershipStatus ?? entity.status ?? null;
  const normalized = normalizeMembershipStatusValue(status);
  if (!normalized) return false;
  return normalized === "active";
}

function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <>
      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-20" />
            ))}
          </div>
        </Card>
        <Card>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-20" />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

const DASHBOARD_CARD_TONES = {
  primary: {
    background: colors.lilac,
    foreground: "white",
  },
  accent: {
    background: colors.plum,
    foreground: "white",
  },
  muted: {
    background: colors.mist,
    foreground: "#111",
  },
};

function DashboardStatCard({ title, value, description, tone = "primary" }) {
  const palette = DASHBOARD_CARD_TONES[tone] ?? DASHBOARD_CARD_TONES.primary;
  return (
    <div
      className="rounded-2xl p-4 shadow-sm"
      style={{ background: palette.background, color: palette.foreground }}
    >
      <div className="text-xs uppercase tracking-wide opacity-80">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs opacity-80">{description}</div>
    </div>
  );
}

function DashboardRecommendationsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-mediumpur/20 bg-white p-4 shadow-sm"
        >
          <SkeletonBlock className="h-3 w-1/4" />
          <SkeletonBlock className="mt-2 h-5 w-1/2" />
          <SkeletonBlock className="mt-2 h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function DashboardRecommendationCard({ recommendation, onView }) {
  if (!recommendation) return null;
  const tags = Array.isArray(recommendation.tags)
    ? recommendation.tags.filter(Boolean).slice(0, 4)
    : [];
  const metaPieces = [recommendation.category, recommendation.campus]
    .filter(Boolean)
    .map((piece) => piece.trim())
    .filter(Boolean);

  return (
    <div className="rounded-2xl border border-mediumpur/20 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          {recommendation.railHeading && (
            <div className="text-xs uppercase tracking-wide" style={{ color: colors.mediumpur }}>
              {recommendation.railHeading}
            </div>
          )}
          <div>
            <div className="text-base font-semibold" style={{ color: colors.plum }}>
              {recommendation.name ?? "Untitled society"}
            </div>
            {metaPieces.length > 0 && (
              <div className="text-xs text-dark/60">{metaPieces.join(" • ")}</div>
            )}
          </div>
          {recommendation.description && (
            <p className="text-sm opacity-80">{recommendation.description}</p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Pill key={tag}>{tag}</Pill>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-shrink-0 items-end">
          <button
            type="button"
            onClick={onView}
            className="rounded-2xl px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: colors.plum }}
          >
            Explore this society
          </button>
        </div>
      </div>
    </div>
  );
}

// Pages
function DashboardPage({
  loading,
  summary,
  recommendations,
  recommendationsLoading,
  recommendationsError,
  events,
  onToggleRsvp,
  onSeeAllRecommendations,
}) {
  if (loading) return <DashboardSkeleton />;

  const stats = {
    activeSocieties: summary?.activeSocieties ?? summary?.active ?? 0,
    upcomingEvents: summary?.upcomingEvents ?? events.length ?? 0,
    newMatches: summary?.newMatches ?? Math.max(0, recommendations.length - 1),
  };

  return (
    <>
      <Card title="Welcome back 👋" subtitle="Here’s a quick glance at your societies and events.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <DashboardStatCard
            title="Active society memberships"
            value={stats.activeSocieties}
            description="Communities you currently belong to"
            tone="primary"
          />
          <DashboardStatCard
            title="Upcoming events"
            value={stats.upcomingEvents}
            description="What's next on your calendar"
            tone="accent"
          />
          <DashboardStatCard
            title="Fresh recommendations"
            value={stats.newMatches}
            description="Explore or update interests for more"
            tone="muted"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="Recommended societies"
          subtitle="A quick taste from your personalised Explore feed."
          action={
            <button
              type="button"
              onClick={onSeeAllRecommendations}
              className="rounded-xl px-3 py-1 text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: colors.plum }}
            >
              See all
            </button>
          }
        >
          {recommendationsLoading ? (
            <DashboardRecommendationsSkeleton />
          ) : recommendationsError && recommendations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              Couldn't load recommendations. Visit Explore to discover societies manually.
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-mediumpur/40 bg-white p-6 text-center">
              <p className="text-sm font-medium text-dark">We don’t have new matches yet.</p>
              <p className="mt-1 text-sm text-dark/70">
                Update your interests and we’ll surface fresh societies for you.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((item, index) => (
                <DashboardRecommendationCard
                  key={item.id ?? `recommendation-${index}`}
                  recommendation={item}
                  onView={onSeeAllRecommendations}
                />
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Upcoming events"
          subtitle="Don’t miss activities from your societies"
        >
          <div className="space-y-3">
            {!loading && events.length === 0 && (
              <div className="rounded-2xl border border-dashed border-mediumpur/40 bg-white p-6 text-center">
                <p className="text-sm font-medium text-dark">No upcoming events</p>
                <p className="mt-1 text-sm text-dark/70">Your societies will list events here once they’re announced.</p>
              </div>
            )}
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-3 rounded-2xl p-3"
                style={{ background: colors.paper }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex-shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-white"
                    style={{ background: colors.lilac }}
                  >
                    {event.date}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="flex items-center gap-3 text-xs opacity-70">
                      <Clock size={14} className="flex-shrink-0" />
                      <span className="truncate">{event.time} • {event.location}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (event.optimistic) return;
                    onToggleRsvp?.(event.id, !event.rsvp);
                  }}
                  disabled={event.optimistic}
                  className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1 text-sm transition-opacity ${
                    event.optimistic ? "cursor-wait opacity-60" : "hover:opacity-90"
                  }`}
                  style={{ background: event.rsvp ? colors.plum : colors.mist, color: event.rsvp ? "white" : "#111" }}
                >
                  {event.rsvp ? <Check size={16} /> : <Plus size={16} />} {event.rsvp ? "Going" : "RSVP"}
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

const EMPTY_PROFILE = { studyField: "", interests: [] };

const EMPTY_USER = { firstName: "", lastName: "", phoneNumber: "", campus: null, universityNumber: null, email: null };

function sanitizeProfile(raw) {
  if (!raw || typeof raw !== "object") return { ...EMPTY_PROFILE };
  const studyField = typeof raw.studyField === "string" ? raw.studyField.trim() : "";
  const interests = Array.isArray(raw.interests)
    ? raw.interests.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
    : [];
  return { studyField, interests };
}

function profileToFormValues(profile) {
  return {
    studyField: profile.studyField,
    interests: [...profile.interests],
  };
}

function formValuesToProfile(form) {
  if (!form) return { ...EMPTY_PROFILE };
  const studyField = (form.studyField ?? "").trim();
  const interests = Array.isArray(form.interests)
    ? form.interests.map((item) => item.trim()).filter(Boolean)
    : [];
  return { studyField, interests };
}

function sanitizeUser(raw) {
  if (!raw || typeof raw !== "object") return { ...EMPTY_USER };
  const firstName = typeof raw.firstName === "string" ? raw.firstName.trim() : "";
  const lastName = typeof raw.lastName === "string" ? raw.lastName.trim() : "";
  const phoneNumber = typeof raw.phoneNumber === "string" ? raw.phoneNumber.trim() : "";
  const campus = typeof raw.campus === "string" ? raw.campus : null;
  const universityNumber = raw.universityNumber ?? null;
  const email = typeof raw.email === "string" ? raw.email.trim() : null;
  return { firstName, lastName, phoneNumber, campus, universityNumber, email };
}

function sanitizeCatalog(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const name = typeof item.name === "string" ? item.name.trim() : null;
      if (!name) return null;
      const id = item.interest_id ?? item.id ?? name;
      return {
        id: id != null ? String(id) : name,
        name,
        normalized: name.toLowerCase(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function userToFormValues(user) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
  };
}

function formValuesToUser(form) {
  if (!form) return { ...EMPTY_USER };
  return {
    firstName: (form.firstName ?? "").trim(),
    lastName: (form.lastName ?? "").trim(),
    phoneNumber: (form.phoneNumber ?? "").trim(),
  };
}

function arraysShallowEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false;
  }
  return true;
}

function profilesEqual(a, b) {
  return a.studyField === b.studyField && arraysShallowEqual(a.interests, b.interests);
}

function usersEqual(a, b) {
  return a.firstName === b.firstName
    && a.lastName === b.lastName
    && a.phoneNumber === b.phoneNumber;
}

function profileToPayload(profile) {
  return {
    studyField: profile.studyField || null,
    interests: profile.interests,
  };
}

function userToPayload(originalUser, draftUser) {
  const payload = {};
  if (draftUser.firstName !== originalUser.firstName) payload.firstName = draftUser.firstName;
  if (draftUser.lastName !== originalUser.lastName) payload.lastName = draftUser.lastName;
  if (draftUser.phoneNumber !== originalUser.phoneNumber) payload.phoneNumber = draftUser.phoneNumber;
  return payload;
}

function ProfilePage() {
  const { user, login } = useAuth();
  const { push } = useToast();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(profileToFormValues(EMPTY_PROFILE));
  const [originalUser, setOriginalUser] = useState(null);
  const [userForm, setUserForm] = useState(userToFormValues(EMPTY_USER));
  const [catalog, setCatalog] = useState([]);
  const [catalogError, setCatalogError] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const [profileData, userData, interestsData] = await Promise.all([
        getMyProfile().catch((error) => {
          if (error?.status !== 404) throw error;
          return EMPTY_PROFILE;
        }),
        getCurrentUser(),
        listInterests().catch((error) => {
          setCatalogError(error);
          return [];
        }),
      ]);

      const sanitizedProfile = sanitizeProfile(profileData);
      setOriginalProfile(sanitizedProfile);
      setProfileForm(profileToFormValues(sanitizedProfile));

      const sanitizedUser = sanitizeUser(userData);
      setOriginalUser(sanitizedUser);
      setUserForm(userToFormValues(sanitizedUser));

      setCatalog(sanitizeCatalog(interestsData));
    } catch (error) {
      push({
        title: "Couldn't load profile",
        description: error?.message ?? "Please try again shortly.",
        tone: "error",
      });
      const sanitizedProfile = { ...EMPTY_PROFILE };
      const sanitizedUser = { ...EMPTY_USER };
      setOriginalProfile(sanitizedProfile);
      setProfileForm(profileToFormValues(sanitizedProfile));
      setOriginalUser(sanitizedUser);
      setUserForm(userToFormValues(sanitizedUser));
      setCatalog([]);
      setCatalogError(error);
    } finally {
      setLoadingProfile(false);
    }
  }, [push]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileChange = useCallback((field) => (event) => {
    const { value } = event.target;
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleInterest = useCallback((interestName) => {
    setProfileForm((prev) => {
      const current = prev.interests ?? [];
      const exists = current.includes(interestName);
      const nextInterests = exists
        ? current.filter((item) => item !== interestName)
        : [...current, interestName];
      return { ...prev, interests: nextInterests };
    });
  }, []);

  const handleUserChange = useCallback((field) => (event) => {
    const { value } = event.target;
    setUserForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const draftProfile = useMemo(() => formValuesToProfile(profileForm), [profileForm]);
  const draftUser = useMemo(() => formValuesToUser(userForm), [userForm]);

  const profileDirty = useMemo(() => (
    originalProfile ? !profilesEqual(draftProfile, originalProfile) : false
  ), [draftProfile, originalProfile]);

  const userDirty = useMemo(() => (
    originalUser ? !usersEqual({
      firstName: draftUser.firstName,
      lastName: draftUser.lastName,
      phoneNumber: draftUser.phoneNumber,
    }, {
      firstName: originalUser.firstName,
      lastName: originalUser.lastName,
      phoneNumber: originalUser.phoneNumber,
    }) : false
  ), [draftUser, originalUser]);

  const phoneAllowedEmpty = (originalUser?.phoneNumber ?? "").length === 0;
  const phoneValid = draftUser.phoneNumber.length > 0 || phoneAllowedEmpty;
  const namesValid = draftUser.firstName.length > 0 && draftUser.lastName.length > 0;

  const combinedCatalog = useMemo(() => {
    const map = new Map();
    catalog.forEach((item) => {
      map.set(item.name, item);
    });
    (profileForm.interests ?? []).forEach((name) => {
      if (!map.has(name)) {
        map.set(name, {
          id: name,
          name,
          normalized: name.toLowerCase(),
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [catalog, profileForm.interests]);

  const isDirty = profileDirty || userDirty;
  const validationMessage = !namesValid
    ? "First and last name cannot be empty."
    : !phoneValid
      ? "Phone number cannot be empty."
      : undefined;
  const saveDisabled = savingProfile || !isDirty || !!validationMessage;
  const saveTooltip = validationMessage ?? (!isDirty ? "Make changes before saving." : undefined);

  const handleReset = useCallback(() => {
    if (originalProfile) setProfileForm(profileToFormValues(originalProfile));
    if (originalUser) setUserForm(userToFormValues(originalUser));
  }, [originalProfile, originalUser]);

  const handleSave = useCallback(async () => {
    if (saveDisabled) return;
    setSavingProfile(true);

    const previousProfile = originalProfile;
    const previousUser = originalUser;

    try {
      if (userDirty && originalUser) {
        const payload = userToPayload(originalUser, draftUser);
        if (Object.keys(payload).length) {
          const updated = await updateCurrentUser(payload);
          const sanitized = sanitizeUser(updated);
          setOriginalUser(sanitized);
          setUserForm(userToFormValues(sanitized));
          if (typeof login === "function") {
            login({ ...(user ?? {}), ...updated });
          }
        }
      }

      if (profileDirty && originalProfile) {
        const payload = profileToPayload(draftProfile);
        const updatedProfile = await updateMyProfile(payload);
        const sanitizedProfile = sanitizeProfile(updatedProfile);
        setOriginalProfile(sanitizedProfile);
        setProfileForm(profileToFormValues(sanitizedProfile));
      }

      push({ title: "Profile updated", tone: "success" });
    } catch (error) {
      if (previousProfile) {
        setOriginalProfile(previousProfile);
        setProfileForm(profileToFormValues(previousProfile));
      }
      if (previousUser) {
        setOriginalUser(previousUser);
        setUserForm(userToFormValues(previousUser));
      }
      push({
        title: "Couldn't save profile",
        description: error?.message ?? "Please try again shortly.",
        tone: "error",
      });
    } finally {
      setSavingProfile(false);
    }
  }, [saveDisabled, userDirty, originalUser, draftUser, login, user, profileDirty, originalProfile, draftProfile, push]);

  const displayName = useMemo(() => {
    const source = originalUser ?? sanitizeUser(user);
    const firstName = source?.firstName ?? "";
    const lastName = source?.lastName ?? "";
    const combined = `${firstName} ${lastName}`.trim();
    if (combined.length) return combined;
    const fallback = [user?.name, user?.fullName, user?.email]
      .find((value) => typeof value === "string" && value.trim().length);
    return fallback ? fallback.trim() : "Student";
  }, [originalUser, user]);

  const initials = useMemo(() => (
    displayName
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "??"
  ), [displayName]);

  const studentNumber = originalUser?.universityNumber ?? user?.universityNumber ?? user?.studentNumber ?? null;
  const campus = originalUser?.campus ?? user?.campus ?? null;
  const email = originalUser?.email ?? user?.email ?? null;

  return (
    <Card title="My Profile" subtitle="Keep your details up to date.">
      {loadingProfile ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SkeletonBlock className="h-48" />
          <SkeletonBlock className="md:col-span-2 h-48" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex flex-col items-center gap-3 rounded-3xl p-4" style={{ background: colors.paper }}>
              <div
                className="grid size-20 place-items-center rounded-2xl text-2xl font-bold text-white"
                style={{ background: colors.plum }}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="text-center">
                <div className="font-semibold">{displayName}</div>
                {(studentNumber || campus) && (
                  <div className="text-xs opacity-70">
                    {[studentNumber, campus].filter(Boolean).join(" • ")}
                  </div>
                )}
                {email && (
                  <div className="text-xs opacity-70">{email}</div>
                )}
              </div>
              <button
                type="button"
                className="rounded-2xl px-3 py-1 text-sm text-white opacity-60"
                style={{ background: colors.plum }}
                disabled
              >
                Photo uploads coming soon
              </button>
            </div>
          </div>
          <div className="space-y-4 md:col-span-2">
            <div className="rounded-2xl p-4" style={{ background: "white", border: `1px solid ${colors.mist}` }}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  label="First name"
                  placeholder="e.g. Thandi"
                  value={userForm.firstName}
                  onChange={handleUserChange("firstName")}
                />
                <Input
                  label="Last name"
                  placeholder="e.g. Molefe"
                  value={userForm.lastName}
                  onChange={handleUserChange("lastName")}
                />
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Phone number"
                  placeholder="e.g. 082 123 4567"
                  value={userForm.phoneNumber}
                  onChange={handleUserChange("phoneNumber")}
                />
                <Input
                  label="Study field"
                  placeholder="e.g. Information Technology"
                  value={profileForm.studyField}
                  onChange={handleProfileChange("studyField")}
                />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.plum }}>
                  <Sparkles size={16} /> Interests
                  {catalogError && (
                    <span className="text-xs text-red-600">Couldn't load catalog</span>
                  )}
                </div>
                <p className="text-xs opacity-60">Tap a tag to add or remove it from your profile.</p>
                <div className="flex flex-wrap gap-2">
                  {combinedCatalog.length === 0 && (
                    <span className="text-xs opacity-60">No interests available yet.</span>
                  )}
                  {combinedCatalog.map((item) => {
                    const selected = profileForm.interests.includes(item.name);
                    return (
                      <InterestChip
                        key={item.id}
                        active={selected}
                        label={item.name}
                        onClick={() => toggleInterest(item.name)}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div title={saveTooltip} className={saveDisabled ? "cursor-not-allowed" : ""}>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saveDisabled}
                    className="rounded-2xl px-4 py-2 text-white transition-opacity"
                    style={{
                      background: saveDisabled ? colors.mist : colors.plum,
                      color: saveDisabled ? "#555" : "white",
                      opacity: saveDisabled ? 0.7 : 1,
                    }}
                  >
                    {savingProfile ? "Saving..." : "Save changes"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!isDirty || savingProfile}
                  className="rounded-2xl px-4 py-2 transition-colors"
                  style={{
                    background: colors.mist,
                    color: "#111",
                    opacity: !isDirty || savingProfile ? 0.6 : 1,
                    cursor: !isDirty || savingProfile ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function ExplorePage({ societies, onJoin, onLeave }) {
  const { push } = useToast();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [recommendationsPayload, setRecommendationsPayload] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState(null);

  const [remoteSocietiesRaw, setRemoteSocietiesRaw] = useState(null);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [societiesError, setSocietiesError] = useState(null);
  const [societyRefreshKey, setSocietyRefreshKey] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [modalState, setModalState] = useState({ open: false, id: null });
  const [modalDetail, setModalDetail] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [modalMembershipStatus, setModalMembershipStatus] = useState(null);
  const [membershipStatusLoading, setMembershipStatusLoading] = useState(false);
  const [membershipStatusError, setMembershipStatusError] = useState(null);
  const [studentMembershipsMap, setStudentMembershipsMap] = useState(() => new Map());

  const joinedIds = useMemo(() => {
    const joined = new Set();

    studentMembershipsMap.forEach((status, id) => {
      const normalized = normalizeMembershipStatusValue(status);
      if (normalized === "active") {
        joined.add(String(id));
      }
    });

    if (Array.isArray(societies)) {
      societies.forEach((item) => {
        if (!item) return;
        const id = getSocietyId(item);
        if (!id) return;
        if (item.isMember === true) {
          joined.add(id);
          return;
        }
        const normalized = normalizeMembershipStatusValue(item.status ?? item.membershipStatus ?? null);
        if (normalized === "active") joined.add(id);
      });
    }

    return joined;
  }, [societies, studentMembershipsMap]);

  const normalizeSociety = useCallback((item) => {
    if (!item) return null;
    const rawId =
      item.id ??
      item.societyId ??
      item.society_id ??
      item.society?.society_id ??
      null;
    const id = rawId != null ? String(rawId) : null;

    const baseName =
      item.name ??
      item.society_name ??
      item.title ??
      item.society?.society_name ??
      null;

    const campus =
      item.campus ??
      item.society?.campus ??
      item.app_user_society_created_byToapp_user?.campus ??
      null;

    const category = item.category ?? item.society?.category ?? null;
    const description = item.description ?? item.society?.description ?? null;
    const rawCounts = item.counts ?? item._count ?? null;
    const counts = rawCounts
      ? {
          members: rawCounts.members ?? rawCounts.membership ?? null,
          events: rawCounts.events ?? rawCounts.event ?? null,
          posts: rawCounts.posts ?? rawCounts.post ?? null,
        }
      : null;

    let interestTags = [];
    if (Array.isArray(item.interestTags)) {
      interestTags = item.interestTags.filter(Boolean);
    } else if (Array.isArray(item.interests)) {
      interestTags = item.interests
        .map((entry) =>
          typeof entry === "string" ? entry : entry?.name ?? ""
        )
        .filter(Boolean);
    } else if (Array.isArray(item.tags)) {
      interestTags = item.tags.filter(Boolean);
    }

    const mapStatus = id ? studentMembershipsMap.get(id) ?? null : null;
    const rawStatus = mapStatus ?? item.membershipStatus ?? item.status ?? null;
    const normalizedStatus = normalizeMembershipStatusValue(rawStatus);
    const isMember =
      joinedIds.has(id) ||
      item.isMember === true ||
      normalizedStatus === "active";
    const membershipStatus = normalizedStatus ?? (typeof rawStatus === "string" ? rawStatus.trim() : null);

    let displayTags = Array.isArray(item.tags)
      ? item.tags.filter(Boolean)
      : [];
    if (Array.isArray(interestTags) && interestTags.length > 0) {
      displayTags = interestTags.slice();
    }
    if (displayTags.length === 0) {
      const derived = [];
      if (category) derived.push(category);
      if (campus) derived.push(campus);
      if (counts?.members != null) derived.push(`${counts.members} members`);
      if (counts?.events != null) derived.push(`${counts.events} events`);
      displayTags = derived;
    }
    displayTags = displayTags
      .map((tag) => (typeof tag === "string" ? tag.trim() : tag))
      .filter((tag) => typeof tag === "string" && tag.length > 0);
    if (displayTags.length > 0) {
      const seen = new Set();
      displayTags = displayTags.filter((tag) => {
        const key = tag.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    return {
      id,
      name: baseName ?? "Untitled society",
      category,
      campus,
      description,
      interestTags,
      tags: item.tags ?? [],
      displayTags,
      isMember,
      membershipStatus,
      membershipStatusLabel: formatMembershipStatusLabel(membershipStatus ?? rawStatus ?? null),
      counts,
    };
  }, [joinedIds, studentMembershipsMap]);

  const fallbackNormalized = useMemo(() => {
    if (!Array.isArray(societies)) return [];
    return societies.map(normalizeSociety).filter(Boolean);
  }, [societies, normalizeSociety]);

  const remoteNormalized = useMemo(() => {
    if (!Array.isArray(remoteSocietiesRaw)) return null;
    return remoteSocietiesRaw.map(normalizeSociety).filter(Boolean);
  }, [remoteSocietiesRaw, normalizeSociety]);

  const rails = useMemo(
    () => normalizeHomeRecommendations(recommendationsPayload),
    [recommendationsPayload]
  );

  const annotatedRails = useMemo(() => (
    rails.map((rail) => {
      const rawItems = Array.isArray(rail.items) ? rail.items : [];
      const processed = rawItems
        .map((item) => {
          const id = item.societyId != null ? String(item.societyId) : item.id != null ? String(item.id) : null;
          const mapStatus = id ? studentMembershipsMap.get(id) ?? null : null;
          const rawStatus = mapStatus ?? item.membershipStatus ?? item.status ?? null;
          const normalizedStatus = normalizeMembershipStatusValue(rawStatus);
          const membershipStatus = normalizedStatus ?? (typeof rawStatus === "string" ? rawStatus.trim() : null);
          const joined = id ? joinedIds.has(id) || normalizedStatus === "active" || item.isMember === true : false;
          return {
            ...item,
            id,
            isMember: joined,
            membershipStatus,
            membershipStatusLabel: formatMembershipStatusLabel(membershipStatus ?? rawStatus ?? null),
          };
        })
        .filter((item) => !item.isMember);
      return {
        ...rail,
        items: processed,
      };
    })
  ), [rails, joinedIds, studentMembershipsMap]);

  const recommendationBaseMap = useMemo(() => {
    const map = new Map();
    annotatedRails.forEach((rail) => {
      rail.items.forEach((item) => {
        if (!item.id) return;
        const mapStatus = studentMembershipsMap.get(item.id) ?? null;
        const rawStatus = mapStatus ?? item.membershipStatus ?? item.status ?? null;
        const normalizedStatus = normalizeMembershipStatusValue(rawStatus);
        const membershipStatus = normalizedStatus ?? (typeof rawStatus === "string" ? rawStatus.trim() : null);
        const isMember =
          normalizedStatus === "active" ||
          item.isMember === true ||
          joinedIds.has(item.id);
        map.set(item.id, {
          id: item.id,
          name: item.name ?? "Untitled society",
          category: item.category ?? null,
          campus: item.campus ?? null,
          description: item.description ?? null,
          interestTags: Array.isArray(item.interestTags)
            ? item.interestTags
            : Array.isArray(item.reasonPills)
              ? item.reasonPills
              : [],
          tags: item.tags ?? [],
          isMember,
          membershipStatus,
          membershipStatusLabel: formatMembershipStatusLabel(membershipStatus ?? rawStatus ?? null),
        });
      });
    });
    return map;
  }, [annotatedRails, studentMembershipsMap, joinedIds]);

  useEffect(() => {
    let active = true;

    async function loadRecommendations() {
      try {
        setLoadingRecommendations(true);
        const payload = await fetchHomeRecommendations();
        if (!active) return;
        setRecommendationsPayload(payload);
        setRecommendationsError(null);
      } catch (err) {
        if (!active) return;
        setRecommendationsError(err);
        if (err?.status !== 401) {
          push({
            title: "Couldn't load recommendations",
            description: err?.message ?? "Please try again shortly.",
            tone: "error",
          });
        }
      } finally {
        if (active) setLoadingRecommendations(false);
      }
    }

    loadRecommendations();

    return () => {
      active = false;
    };
  }, [push]);

  useEffect(() => {
    let active = true;

    async function loadSocieties() {
      try {
        setLoadingSocieties(true);
        const response = await listSocieties({ page: 1, limit: 100 });
        if (!active) return;
        const rawList = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.results)
            ? response.results
            : Array.isArray(response)
              ? response
              : [];
        setRemoteSocietiesRaw(rawList);
        setSocietiesError(null);
      } catch (err) {
        if (!active) return;
        setSocietiesError(err);
        if (fallbackNormalized.length === 0) {
          push({
            title: "Couldn't load societies",
            description: err?.message ?? "Please try again shortly.",
            tone: "error",
          });
        }
      } finally {
        if (active) setLoadingSocieties(false);
      }
    }

    loadSocieties();

    return () => {
      active = false;
    };
  }, [fallbackNormalized.length, push, societyRefreshKey]);

  const combinedList = remoteNormalized ?? fallbackNormalized;

  const availableCategories = useMemo(() => {
    const map = new Map();
    combinedList.forEach((society) => {
      const label = typeof society?.category === "string" ? society.category.trim() : "";
      if (!label) return;
      const key = label.toLowerCase();
      if (!map.has(key)) map.set(key, label);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [combinedList]);

  useEffect(() => {
    if (selectedCategory === "all") return;
    const hasCategory = availableCategories.some((category) => category.toLowerCase() === selectedCategory.toLowerCase());
    if (!hasCategory) setSelectedCategory("all");
  }, [availableCategories, selectedCategory]);

  useEffect(() => {
    const studentIdentifier =
      user?.universityNumber ??
      user?.studentNumber ??
      user?.id ??
      user?.user_id ??
      null;

    if (!studentIdentifier) {
      setStudentMembershipsMap(new Map());
      return;
    }

    let active = true;

    (async () => {
      try {
        const payload = await listStudentMemberships(studentIdentifier);
        if (!active) return;
        const memberships = Array.isArray(payload?.memberships) ? payload.memberships : [];
        const mapping = new Map();
        memberships.forEach((entry) => {
          const entryId =
            entry?.society?.id ??
            entry?.society?.society_id ??
            entry?.societyId ??
            entry?.society_id ??
            null;
          if (entryId == null) return;
          const id = String(entryId);
          const normalized = normalizeMembershipStatusValue(entry?.status ?? null);
          const fallback = typeof entry?.status === "string"
            ? entry.status.trim().toLowerCase().replace(/[\s-]+/g, "_")
            : null;
          mapping.set(id, normalized ?? fallback ?? null);
        });
        setStudentMembershipsMap(mapping);
      } catch (err) {
        if (!active) return;
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("Failed to load student memberships", err);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [user, societyRefreshKey]);

  const filtered = useMemo(() => {
    const loweredQuery = query.toLowerCase();
    const selectedKey = selectedCategory.toLowerCase();
    return combinedList.filter((society) => {
      const nameMatches = loweredQuery
        ? society.name?.toLowerCase().includes(loweredQuery)
        : true;
      const categoryLabel = typeof society?.category === "string" ? society.category.toLowerCase() : "";
      const categoryMatches =
        selectedCategory === "all" || !selectedCategory
          ? true
          : categoryLabel === selectedKey;
      return nameMatches && categoryMatches;
    });
  }, [combinedList, query, selectedCategory]);

  const showEmpty = !loadingSocieties && filtered.length === 0;

  const activeNormalized = useMemo(() => (
    modalState.id ? combinedList.find((item) => item.id === modalState.id) ?? null : null
  ), [combinedList, modalState.id]);

  const derivedModalStatus = useMemo(() => {
    if (!modalState.id) return null;
    const sources = [
      modalMembershipStatus,
      modalDetail?.membershipStatus ?? modalDetail?.status ?? null,
      activeNormalized?.membershipStatus ?? activeNormalized?.status ?? null,
      recommendationBaseMap.get(modalState.id)?.membershipStatus ??
        recommendationBaseMap.get(modalState.id)?.status ??
        null,
      modalState.id ? studentMembershipsMap.get(modalState.id) ?? null : null,
    ];
    for (const candidate of sources) {
      const normalized = normalizeMembershipStatusValue(candidate);
      if (normalized) return normalized;
    }
    return null;
  }, [modalState.id, modalMembershipStatus, modalDetail, activeNormalized, recommendationBaseMap, studentMembershipsMap]);

  useEffect(() => {
    if (!modalState.open || !modalState.id) {
      setModalDetail(null);
      setModalError(null);
      setModalLoading(false);
      setModalMembershipStatus(null);
      setMembershipStatusError(null);
      setMembershipStatusLoading(false);
      return;
    }

    let active = true;
    setModalLoading(true);
    setModalError(null);

    (async () => {
      try {
        const detail = await fetchSocietyDetail(modalState.id);
        if (!active) return;
        setModalDetail(detail);
      } catch (err) {
        if (!active) return;
        setModalError(err);
      } finally {
        if (active) setModalLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [modalState]);

  useEffect(() => {
    if (!modalState.open || !modalState.id) {
      setModalMembershipStatus(null);
      setMembershipStatusError(null);
      setMembershipStatusLoading(false);
      return;
    }

    const studentIdentifier =
      user?.universityNumber ??
      user?.studentNumber ??
      user?.id ??
      user?.user_id ??
      null;

    const likelyHasMembership =
      (modalState.id && joinedIds.has(modalState.id)) ||
      derivedModalStatus === "active" ||
      derivedModalStatus === "pending";

    if (!studentIdentifier || !likelyHasMembership) {
      setModalMembershipStatus(null);
      setMembershipStatusError(null);
      setMembershipStatusLoading(false);
      return;
    }

    let active = true;
    setMembershipStatusLoading(true);
    setMembershipStatusError(null);
    (async () => {
      try {
        const statusPayload = await fetchMembershipStatus(studentIdentifier, modalState.id);
        if (!active) return;
        const normalized = extractMembershipStatusFromPayload(statusPayload);
        if (normalized) {
          setModalMembershipStatus(normalized);
        } else if (typeof statusPayload === "string") {
          setModalMembershipStatus(normalizeMembershipStatusValue(statusPayload));
        } else {
          setModalMembershipStatus(null);
        }
      } catch (err) {
        if (!active) return;
        if (err?.status === 404) {
          setModalMembershipStatus(null);
          setMembershipStatusError(null);
        } else {
          setMembershipStatusError(err);
        }
      } finally {
        if (active) setMembershipStatusLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [modalState, user, joinedIds, derivedModalStatus]);

  useEffect(() => {
    if (!modalState.open) {
      setMembershipLoading(false);
    }
  }, [modalState.open]);

  const closeModal = useCallback(() => {
    setModalState({ open: false, id: null });
    setModalDetail(null);
    setModalError(null);
    setMembershipLoading(false);
    setModalMembershipStatus(null);
    setMembershipStatusError(null);
    setMembershipStatusLoading(false);
  }, []);

  const openModal = useCallback((societyId) => {
    setModalState({ open: true, id: societyId });
    setModalDetail(null);
    setModalError(null);
  }, []);

  const handleMembershipAction = useCallback(async () => {
    if (!modalState.id) return;
    const joined = joinedIds.has(modalState.id);
    setMembershipLoading(true);
    try {
      const handler = joined ? onLeave : onJoin;
      if (!handler) {
        setMembershipLoading(false);
        return;
      }
      const success = await handler(modalState.id);
      if (success) {
        setSocietyRefreshKey((key) => key + 1);
        closeModal();
      }
    } finally {
      setMembershipLoading(false);
    }
  }, [joinedIds, modalState.id, onJoin, onLeave, closeModal]);

  const membershipStatusValue = useMemo(() => {
    if (!modalState.id) return null;
    if (derivedModalStatus) return derivedModalStatus;
    return joinedIds.has(modalState.id) ? "active" : null;
  }, [modalState.id, derivedModalStatus, joinedIds]);

  const modalJoined = membershipStatusValue === "active" || joinedIds.has(modalState.id ?? "");

  const mergedModalSociety = useMemo(() => {
    if (!modalState.open) return null;
    if (!activeNormalized && !modalDetail && !recommendationBaseMap.has(modalState.id)) return null;
    const base = activeNormalized ?? recommendationBaseMap.get(modalState.id) ?? {};
    const detail = modalDetail ?? {};
    return {
      ...base,
      ...detail,
      name: detail.name ?? base.name,
      description: detail.description ?? base.description,
      campus: detail.campus ?? base.campus,
      category: detail.category ?? base.category,
      interestTags: detail.interestTags ?? detail.tags ?? base.interestTags ?? base.tags ?? [],
      counts: detail.counts ?? base.counts ?? null,
      recentEvents: Array.isArray(detail.recentEvents) ? detail.recentEvents : [],
      recentPosts: Array.isArray(detail.recentPosts) ? detail.recentPosts : [],
    };
  }, [modalState.open, activeNormalized, modalDetail]);

  return (
    <>
      <Card
        title="Discover your next society"
        subtitle="Browse personalised matches, trending communities, and the societies you already belong to. Scroll the carousels, then use the filters below to dig deeper."
      />

      {annotatedRails.map((rail) => (
        <RecommendationRail
          key={rail.key}
          heading={rail.heading}
          subtitle={rail.subtitle}
          items={rail.items}
          loading={loadingRecommendations}
          onView={openModal}
        />
      ))}

      {!loadingRecommendations && recommendationsError && (
        <Card>
          <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Couldn't refresh recommendations. Please try again in a moment.
          </div>
        </Card>
      )}

      <Card title="Explore all societies" subtitle="Filter and find groups that match your vibe.">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="rounded-2xl px-4 py-2 pl-9 outline-none focus:ring-2 focus:ring-lilac"
              style={{ background: colors.mist }}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="appearance-none cursor-pointer rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-lilac"
            style={{ background: colors.mist }}
          >
            <option value="all">All categories</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {loadingSocieties && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-40" />
            ))}
          </div>
        )}

        {societiesError && !loadingSocieties && (
          <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Couldn't load the full society catalog. Showing saved results instead.
          </div>
        )}

        {showEmpty && (
          <div className="rounded-3xl border border-dashed border-mediumpur/40 bg-white p-8 text-center">
            <p className="text-sm font-medium text-dark">No societies match your filters yet.</p>
            <p className="mt-1 text-sm text-dark/70">Adjust the search to discover more groups.</p>
          </div>
        )}

       {!showEmpty && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((society, index) => (
              <ExploreSocietyCard
                key={society.id ?? `explore-${index}`}
                society={society}
                onView={() => openModal(society.id)}
              />
            ))}
          </div>
        )}
      </Card>

      {modalState.open && (
        <ExploreSocietyModal
          society={mergedModalSociety}
          loading={modalLoading}
          error={modalError}
          joined={modalJoined}
          membershipStatus={membershipStatusValue}
          statusLoading={membershipStatusLoading}
          statusError={membershipStatusError}
          onClose={closeModal}
          onToggleMembership={handleMembershipAction}
          membershipLoading={membershipLoading}
        />
      )}
    </>
  );
}

function SocietyDetailsPage({ loading, societies = [], onLeave, error }) {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [detailMap, setDetailMap] = useState({});
  const [detailErrors, setDetailErrors] = useState({});
  const [detailLoadingIds, setDetailLoadingIds] = useState({});

  const joinedSocieties = useMemo(() => {
    if (!Array.isArray(societies)) return [];
    return societies.filter((society) => {
      if (!society) return false;
      if (typeof society.isMember === "boolean") return society.isMember;
      const status = society.membershipStatus ?? society.status ?? null;
      if (typeof status === "string") {
        const lowered = status.toLowerCase();
        return lowered !== "left" && lowered !== "inactive";
      }
      return true;
    });
  }, [societies]);

  const categories = useMemo(() => {
    const map = new Map();
    joinedSocieties.forEach((society) => {
      const baseCategory = typeof society?.category === "string" ? society.category.trim() : "";
      if (baseCategory) map.set(baseCategory.toLowerCase(), baseCategory);
      const id = getSocietyId(society);
      if (id && detailMap[id]) {
        const detailCategory =
          typeof detailMap[id]?.category === "string" ? detailMap[id].category.trim() : "";
        if (detailCategory) map.set(detailCategory.toLowerCase(), detailCategory);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [joinedSocieties, detailMap]);

  useEffect(() => {
    if (selectedCategory === "all") return;
    const exists = categories.some(
      (category) => category.toLowerCase() === selectedCategory.toLowerCase()
    );
    if (!exists) setSelectedCategory("all");
  }, [categories, selectedCategory]);

  useEffect(() => {
    const numericSocieties = joinedSocieties.filter((society) => {
      const id = getSocietyId(society);
      return id && /^\d+$/.test(id);
    });

    if (numericSocieties.length === 0) {
      setDetailMap({});
      setDetailErrors({});
      setDetailLoadingIds({});
      return;
    }

    let active = true;

    (async () => {
      for (const society of numericSocieties) {
        const id = getSocietyId(society);
        if (!id) continue;
        setDetailLoadingIds((prev) => ({ ...prev, [id]: true }));
        try {
          const detail = await fetchSocietyDetail(id);
          if (!active) return;
          setDetailMap((prev) => ({ ...prev, [id]: detail }));
          setDetailErrors((prev) => {
            if (!prev[id]) return prev;
            const next = { ...prev };
            delete next[id];
            return next;
          });
        } catch (err) {
          if (!active) return;
          setDetailErrors((prev) => ({ ...prev, [id]: err }));
          if (err?.status && err.status !== 404) {
            push({
              title: "Couldn't load a society",
              description: err?.message ?? "Please try again shortly.",
              tone: "error",
            });
          }
        } finally {
          if (!active) return;
          setDetailLoadingIds((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [joinedSocieties, push]);

  const filteredSocieties = useMemo(() => {
    const search = query.trim().toLowerCase();
    const selectedKey = selectedCategory.toLowerCase();
    return joinedSocieties.filter((society) => {
      const id = getSocietyId(society);
      const detail = id ? detailMap[id] ?? null : null;
      const name = (detail?.name ?? society?.name ?? "").toLowerCase();
      const categoryLabel = (detail?.category ?? society?.category ?? "").toLowerCase();
      const matchesQuery = !search || name.includes(search);
      const matchesCategory =
        selectedCategory === "all" || !selectedCategory ? true : categoryLabel === selectedKey;
      return matchesQuery && matchesCategory;
    });
  }, [joinedSocieties, detailMap, query, selectedCategory]);

  const enrichedSocieties = useMemo(
    () =>
      filteredSocieties.map((society) => {
        const id = getSocietyId(society);
        const detail = id && /^\d+$/.test(id) ? detailMap[id] ?? null : null;
        return {
          id,
          merged: mergeSocietySnapshot(society, detail),
          loadingDetail: id && /^\d+$/.test(id) ? !!detailLoadingIds[id] : false,
          detailError: id && /^\d+$/.test(id) ? detailErrors[id] ?? null : null,
        };
      }),
    [filteredSocieties, detailMap, detailErrors, detailLoadingIds]
  );

  const showEmptyState = !loading && joinedSocieties.length === 0;
  const showNoResults = !loading && joinedSocieties.length > 0 && enrichedSocieties.length === 0;

  const handleClearFilters = useCallback(() => {
    setQuery("");
    setSelectedCategory("all");
  }, []);

  return (
    <div className="space-y-6">
      <Card title="My societies" subtitle="Keep tabs on the communities you're part of.">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px] md:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="w-full rounded-2xl px-4 py-2 pl-9 outline-none focus:ring-2 focus:ring-lilac"
              style={{ background: colors.mist }}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="appearance-none cursor-pointer rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-lilac"
            style={{ background: colors.mist }}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {!loading && error && (
          <div className="mb-4 rounded-2xl border border-dashed border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Couldn't refresh your society list. Showing the latest information we have.
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: Math.min(3, Math.max(1, joinedSocieties.length || 3)) }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-mediumpur/20 bg-white shadow-sm"
                >
                  <SkeletonBlock className="h-52 w-full" />
                </div>
              )
            )}
          </div>
        ) : showEmptyState ? (
          <div className="rounded-3xl border border-dashed border-mediumpur/40 bg-white p-8 text-center">
            <p className="text-sm font-medium text-dark">You haven't joined any societies yet.</p>
            <p className="mt-1 text-sm text-dark/70">
              Visit Explore to find communities that align with your interests.
            </p>
          </div>
        ) : showNoResults ? (
          <div className="space-y-3 rounded-3xl border border-dashed border-mediumpur/40 bg-white p-8 text-center">
            <div className="text-sm font-medium text-dark">No societies match your filters.</div>
            <div className="text-sm text-dark/70">
              Try adjusting your search or clearing the current filters.
            </div>
            {(query || selectedCategory !== "all") && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-2xl px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
                style={{ background: colors.lilac }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {enrichedSocieties.map((entry, index) => (
              <MySocietyCard
                key={entry.id ?? `society-${index}`}
                society={entry.merged}
                loadingDetail={entry.loadingDetail}
                detailError={entry.detailError}
                onLeave={onLeave}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function mergeSocietySnapshot(base, detail) {
  if (!base && !detail) return null;

  const detailId =
    detail && (detail.societyId ?? detail.id ?? detail.society_id ?? detail?.society?.society_id ?? null);
  const baseId = getSocietyId(base);
  const id = detailId != null ? String(detailId) : baseId;

  const counts = detail?.counts ?? base?.counts ?? null;

  const rawTags = (() => {
    if (Array.isArray(base?.displayTags) && base.displayTags.length) return base.displayTags;
    if (Array.isArray(detail?.interestTags) && detail.interestTags.length) return detail.interestTags;
    if (Array.isArray(detail?.tags) && detail.tags.length) return detail.tags;
    if (Array.isArray(base?.interestTags) && base.interestTags.length) return base.interestTags;
    if (Array.isArray(base?.tags) && base.tags.length) return base.tags;
    return [];
  })();

  const uniqueTags = Array.from(
    new Map(
      rawTags
        .filter(Boolean)
        .map((tag) => {
          const value = typeof tag === "string" ? tag.trim() : String(tag);
          return [value.toLowerCase(), value];
        })
    ).values()
  );

  return {
    ...base,
    ...(detail ?? {}),
    id,
    name: detail?.name ?? base?.name ?? base?.society_name ?? "Untitled society",
    category: detail?.category ?? base?.category ?? base?.society?.category ?? null,
    campus: detail?.campus ?? base?.campus ?? base?.society?.campus ?? null,
    description: detail?.description ?? base?.description ?? base?.society?.description ?? null,
    counts,
    interestTags: uniqueTags,
    displayTags: uniqueTags,
    recentEvents: Array.isArray(detail?.recentEvents)
      ? detail.recentEvents
      : Array.isArray(base?.recentEvents)
        ? base.recentEvents
        : [],
    recentPosts: Array.isArray(detail?.recentPosts)
      ? detail.recentPosts
      : Array.isArray(base?.recentPosts)
        ? base.recentPosts
        : [],
    membershipStatus: base?.membershipStatus ?? base?.status ?? detail?.status ?? null,
    membershipStatusLabel: base?.membershipStatusLabel ?? detail?.membershipStatusLabel ?? null,
    isMember: base?.isMember ?? true,
    role: base?.role ?? base?.membershipRole ?? null,
  };
}

function mapEventFromApi(item) {
  if (!item) return null;
  const eventId = item.eventId ?? item.id ?? item.event_id ?? null;
  const id = eventId != null ? String(eventId) : null;
  const startsAt = item.startsAt ?? item.starts_at ?? null;
  const endsAt = item.endsAt ?? item.ends_at ?? null;
  const startDate = startsAt ? new Date(startsAt) : null;
  const endDate = endsAt ? new Date(endsAt) : null;
  const dateLabel = formatDateLabel(startsAt) ?? "Date to be announced";
  const timeLabel = startDate && !Number.isNaN(startDate.getTime())
    ? startDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "TBA";

  const societyId =
    item.society?.societyId ??
    item.society?.society_id ??
    item.societyId ??
    item.society_id ??
    null;

  return {
    id,
    title: item.title ?? "Upcoming event",
    description: item.description ?? null,
    location: item.location ?? null,
    startsAt,
    endsAt,
    date: dateLabel,
    time: timeLabel,
    capacity: item.capacity ?? null,
    society: societyId
      ? { id: String(societyId), name: item.society?.name ?? item.society?.society_name ?? null }
      : item.society?.name
        ? { id: null, name: item.society.name }
        : null,
    createdBy: item.createdBy ?? null,
    stats: {
      likes: item.likes ?? 0,
      rsvps: item.rsvps ?? 0,
    },
    rsvp: false,
    rsvpStatus: null,
    optimistic: false,
  };
}

function MySocietyCard({ society, loadingDetail, detailError, onLeave }) {
  const [leaving, setLeaving] = useState(false);
  const societyId = getSocietyId(society);
  const description = society?.description ?? null;
  const category = society?.category ?? null;
  const campus = society?.campus ?? null;

  const membershipStatus = society?.membershipStatus ?? society?.status ?? null;
  const normalizedStatus = normalizeMembershipStatusValue(membershipStatus);
  const statusLabel = normalizedStatus
    ? formatMembershipStatusLabel(normalizedStatus)
    : society?.membershipStatusLabel ?? null;

  const counts = society?.counts ?? null;
  const stats = [
    { label: "Members", value: counts?.members },
    { label: "Events", value: counts?.events },
    { label: "Posts", value: counts?.posts },
  ].filter((stat) => stat.value != null);

  const tags = Array.isArray(society?.displayTags) && society.displayTags.length
    ? society.displayTags
    : Array.isArray(society?.interestTags)
      ? society.interestTags
      : [];

  const recentEvents = Array.isArray(society?.recentEvents)
    ? society.recentEvents.slice(0, 2)
    : [];
  const recentPosts = Array.isArray(society?.recentPosts)
    ? society.recentPosts.slice(0, 2)
    : [];

  const canLeave = typeof onLeave === "function" && societyId && normalizedStatus !== "pending";

  const handleLeave = useCallback(async () => {
    if (!canLeave) return;
    try {
      setLeaving(true);
      await onLeave(societyId);
    } finally {
      setLeaving(false);
    }
  }, [canLeave, onLeave, societyId]);

  return (
    <div className="overflow-hidden rounded-3xl border border-mediumpur/20 bg-white shadow-sm">
      <div className="flex flex-col xl:flex-row">
        <div
          className="flex items-center justify-center px-6 py-12 text-sm text-white/90 xl:w-1/3"
          style={{
            background: `linear-gradient(135deg, ${colors.plum} 0%, ${colors.lilac} 60%, rgba(255,255,255,0.95) 100%)`,
          }}
        >
          <span className="text-center">Society visuals coming soon</span>
        </div>
        <div className="flex-1 space-y-4 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              {category && (
                <div className="text-xs uppercase tracking-wide" style={{ color: colors.mediumpur }}>
                  {category}
                </div>
              )}
              <h3 className="text-2xl font-semibold" style={{ color: colors.plum }}>
                {society?.name ?? "Untitled society"}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2 text-xs opacity-70">
                {campus && <span>{campus}</span>}
                {statusLabel && <span>• {statusLabel}</span>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {canLeave && (
                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={leaving}
                  className={`rounded-2xl px-4 py-2 text-sm transition-colors ${
                    leaving ? "cursor-wait opacity-60" : "hover:opacity-90"
                  }`}
                  style={{ background: "#f8d2d2", color: "#7f1d1d", border: "1px solid #fca5a5" }}
                >
                  {leaving ? "Leaving..." : "Leave society"}
                </button>
              )}
              {!canLeave && statusLabel && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
                  Membership {statusLabel.toLowerCase()}
                </div>
              )}
              {loadingDetail && (
                <div className="text-xs text-dark/60">Refreshing society details…</div>
              )}
              {detailError && !loadingDetail && (
                <div className="text-xs text-rose-700">Couldn't fetch the latest details.</div>
              )}
            </div>
          </div>

          {description && <p className="text-sm opacity-80">{description}</p>}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 6).map((tag) => (
                <Pill key={tag}>{tag}</Pill>
              ))}
            </div>
          )}

          {stats.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-lilac/40 bg-lilac/10 p-3 text-center"
                >
                  <div className="text-xs uppercase tracking-wide opacity-70">{stat.label}</div>
                  <div className="text-lg font-semibold" style={{ color: colors.plum }}>
                    {stat.value ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {loadingDetail ? (
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-1/4" />
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-20 w-full" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} style={{ color: colors.plum }} />
                  <h4 className="text-sm font-semibold" style={{ color: colors.plum }}>
                    Upcoming events
                  </h4>
                </div>
                {recentEvents.length > 0 ? (
                  <ul className="space-y-2">
                    {recentEvents.map((event) => (
                      <li
                        key={event.eventId ?? event.title}
                        className="rounded-2xl border border-mediumpur/30 bg-white/80 p-3 text-sm"
                      >
                        <div className="font-medium">{event.title ?? "Event"}</div>
                        <div className="text-xs opacity-70">
                          {formatDateTimeLabel(event.startsAt) ?? "Date to be announced"}
                          {event.location ? ` • ${event.location}` : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-2xl border border-dashed border-mediumpur/30 bg-white/70 p-3 text-xs text-dark/60">
                    No upcoming events yet.
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Inbox size={16} style={{ color: colors.plum }} />
                  <h4 className="text-sm font-semibold" style={{ color: colors.plum }}>
                    Recent posts
                  </h4>
                </div>
                {recentPosts.length > 0 ? (
                  <ul className="space-y-2">
                    {recentPosts.map((post) => (
                      <li
                        key={post.postId ?? post.title ?? post.createdAt}
                        className="rounded-2xl border border-mediumpur/30 bg-white/80 p-3 text-sm"
                      >
                        <div className="text-xs uppercase tracking-wide opacity-60">
                          {formatDateLabel(post.createdAt) ?? "Recent"}
                        </div>
                        <div className="mt-1 font-medium">{post.title ?? "Update"}</div>
                        {post.content && (
                          <p className="opacity-80">{post.content}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-2xl border border-dashed border-mediumpur/30 bg-white/70 p-3 text-xs text-dark/60">
                    No posts yet. Check back soon.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const RELATIVE_TIME_FORMAT = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function formatRelativeTime(value) {
  if (!value) return null;
  const date = new Date(value);
  const now = Date.now();
  if (Number.isNaN(date.getTime())) return null;
  let deltaSeconds = Math.round((date.getTime() - now) / 1000);
  const divisions = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" },
  ];
  for (const division of divisions) {
    if (Math.abs(deltaSeconds) < division.amount) {
      return RELATIVE_TIME_FORMAT.format(Math.round(deltaSeconds), division.unit);
    }
    deltaSeconds /= division.amount;
  }
  return null;
}

function notificationTypeToLabel(type) {
  return NOTIFICATION_TYPE_LABELS[type] ?? "Update";
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl border border-mediumpur/10 bg-white p-4 shadow-sm"
        >
          <SkeletonBlock className="h-4 w-1/4" />
          <SkeletonBlock className="mt-3 h-3 w-full" />
          <SkeletonBlock className="mt-2 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

function NotificationCard({ notification, onMarkSeen, marking }) {
  const seen = Boolean(notification?.seenAt);
  const createdAt = notification?.createdAt ?? null;
  const timeLabel = formatDateTimeLabel(createdAt) ?? formatDateLabel(createdAt) ?? "Recently";
  const relativeLabel = formatRelativeTime(createdAt);
  const typeLabel = notificationTypeToLabel(notification?.type ?? "general");
  const linkUrl = typeof notification?.linkUrl === "string" ? notification.linkUrl : null;

  return (
    <div
      className="rounded-3xl border border-mediumpur/20 bg-white shadow-sm"
      style={{
        background: seen
          ? "white"
          : "linear-gradient(135deg, rgba(172,152,205,0.08) 0%, rgba(210,211,222,0.14) 60%, rgba(255,255,255,0.95) 100%)",
      }}
    >
      <div className="flex flex-col gap-4 p-5 md:flex-row md:justify-between">
        <div className="space-y-3 md:flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              style={{ background: `${colors.lilac}33`, color: colors.plum }}
            >
              {typeLabel}
            </span>
            {!seen && (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                New
              </span>
            )}
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-medium" style={{ color: colors.plum }}>
              {notification?.message ?? "Notification"}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-dark/60">
              <span>{timeLabel}</span>
              {relativeLabel && <span>• {relativeLabel}</span>}
            </div>
          </div>
      </div>
      <div className="flex items-start gap-2 md:flex-col md:items-end">
        {onMarkSeen && !seen && (
          <button
            type="button"
              onClick={() => onMarkSeen(notification.id)}
              disabled={marking}
              className={`rounded-2xl px-3 py-2 text-xs font-medium transition-opacity ${
                marking ? "cursor-wait opacity-60" : "hover:opacity-90"
              }`}
              style={{ background: colors.plum, color: "white" }}
            >
              {marking ? "Marking…" : "Mark as read"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ExploreSocietyCard({ society, onView }) {
  const name = society?.name ?? "Untitled society";
  const category = society?.category ?? "Society";
  const campus = society?.campus ?? null;
  const description = society?.description ?? null;
  const tags = Array.isArray(society?.displayTags)
    ? society.displayTags
    : Array.isArray(society?.interestTags)
      ? society.interestTags
      : Array.isArray(society?.tags)
        ? society.tags
        : [];
  const membershipStatus = society?.membershipStatus ?? society?.status ?? null;
  const normalizedStatus = normalizeMembershipStatusValue(membershipStatus);
  const statusLabel = normalizedStatus
    ? formatMembershipStatusLabel(normalizedStatus)
    : society?.membershipStatusLabel ?? (membershipStatus ? formatMembershipStatusLabel(membershipStatus) : null);
  const joined = society?.isMember ?? isSocietyJoined(society);
  const chips = [];
  if (campus) chips.push(campus);
  if (normalizedStatus === "pending") chips.push(statusLabel ?? "Pending approval");
  else if (joined) chips.push("Joined");
  const canOpen = Boolean(society?.id);

  return (
    <div
      className="flex min-h-[260px] flex-col justify-between rounded-3xl p-4 shadow-sm"
      style={{
        background: "linear-gradient(135deg, rgba(172, 152, 205, 0.14) 0%, rgba(210, 211, 222, 0.24) 45%, rgba(255,255,255,0.95) 100%)",
        border: `1px solid ${colors.mist}`,
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide" style={{ color: colors.plum }}>
          <span>{category}</span>
          {joined && (
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: colors.plum }}>
              <Check size={14} /> {normalizedStatus === "active" ? "Joined" : statusLabel ?? "Joined"}
            </span>
          )}
        </div>
        <div>
          <div className="text-lg font-semibold" style={{ color: colors.plum }}>
            {name}
          </div>
          {chips.length > 0 && (
            <div className="mt-1 text-xs opacity-70">{chips.join(" • ")}</div>
          )}
        </div>
        {description && <p className="text-sm opacity-80">{description}</p>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.slice(0, 4).map((tag) => (
          <Pill key={tag}>{tag}</Pill>
        ))}
        {!tags.length && <span className="text-xs opacity-60">Add tags to describe this society</span>}
      </div>
      <button
        type="button"
        onClick={() => {
          if (canOpen) onView?.(society.id);
        }}
        disabled={!canOpen}
        className="mt-4 w-full rounded-2xl px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
        style={{
          background: colors.plum,
          opacity: canOpen ? 1 : 0.6,
          cursor: canOpen ? "pointer" : "not-allowed",
        }}
      >
        View society
      </button>
    </div>
  );
}

function RecommendationRail({ heading, subtitle, items = [], loading, onView }) {
  return (
    <Card title={heading} subtitle={subtitle}>
      {loading ? (
        <RecommendationSkeleton />
      ) : items.length ? (
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {items.map((item, index) => (
            <RecommendationCard
              key={item.id ?? item.societyId ?? index}
              item={item}
              onView={onView}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-mediumpur/40 bg-white p-6 text-center">
          <p className="text-sm text-dark/70">
            Complete the matchmaking quiz to unlock fresh society recommendations.
          </p>
        </div>
      )}
    </Card>
  );
}

function RecommendationCard({ item, onView }) {
  const reasonsRaw = item.reasonPills?.length ? item.reasonPills : item.interestTags;
  const reasons = Array.isArray(reasonsRaw) ? [...new Set(reasonsRaw)].slice(0, 4) : [];
  const score = typeof item.matchScore === "number" ? Math.round(item.matchScore * 100) : null;
  const matchScore = score !== null ? Math.min(Math.max(score, 0), 100) : null;
  const joined = item.isMember ?? false;
  const targetId = item.id ?? item.societyId ?? item.society_id ?? null;

  return (
    <div
      className="flex min-w-[280px] max-w-[320px] flex-col justify-between rounded-3xl p-4 shadow-sm"
      style={{
        background: "linear-gradient(135deg, rgba(172, 152, 205, 0.18) 0%, rgba(210, 211, 222, 0.32) 45%, rgba(255,255,255,0.95) 100%)",
        border: `1px solid ${colors.mist}`,
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide" style={{ color: colors.plum }}>
          <span>{item.category ?? "Society"}</span>
          {joined && (
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: colors.plum }}>
              <Check size={14} /> Joined
            </span>
          )}
          {matchScore !== null && <span>{matchScore}% match</span>}
        </div>
        <div>
          <div className="text-lg font-semibold" style={{ color: colors.plum }}>
            {item.name}
          </div>
          {item.campus && <div className="mt-1 text-xs opacity-70">{item.campus}</div>}
        </div>
        {item.description && (
          <p className="text-sm opacity-80">{item.description}</p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {reasons.length ? (
          reasons.map((pill) => <Pill key={pill}>{pill}</Pill>)
        ) : (
          <span className="text-xs opacity-60">We'll add reasons soon</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          if (targetId) onView?.(targetId);
        }}
        disabled={!targetId}
        className="mt-4 w-full rounded-2xl px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
        style={{
          background: colors.plum,
          opacity: targetId ? 1 : 0.6,
          cursor: targetId ? "pointer" : "not-allowed",
        }}
      >
        View society
      </button>
    </div>
  );
}

function InterestChip({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-1 text-sm transition-all"
      style={{
        background: active
          ? `linear-gradient(135deg, ${colors.plum} 0%, ${colors.lilac} 100%)`
          : colors.mist,
        color: active ? "white" : "#333",
        border: active ? `2px solid ${colors.plum}` : `1px solid ${colors.mist}`,
        transform: active ? "scale(1.02)" : "scale(1)",
      }}
    >
      {label}
    </button>
  );
}

function ExploreSocietyModal({
  society,
  loading,
  error,
  joined,
  membershipStatus,
  statusLoading,
  statusError,
  onClose,
  onToggleMembership,
  membershipLoading,
}) {
  if (!society && !loading && !error) return null;

  const interestTags = society?.interestTags ?? [];
  const counts = society?.counts ?? {};
  const normalizedStatus = normalizeMembershipStatusValue(
    membershipStatus ?? society?.membershipStatus ?? society?.status ?? null
  );
  const statusLabel = normalizedStatus
    ? formatMembershipStatusLabel(normalizedStatus)
    : society?.membershipStatusLabel ?? formatMembershipStatusLabel(society?.membershipStatus ?? society?.status ?? null);
  const isPending = normalizedStatus === "pending";
  const stats = [
    { label: "Members", value: counts.members },
    { label: "Events", value: counts.events },
    { label: "Posts", value: counts.posts },
  ].filter((item) => item.value != null);

  const recentEvents = Array.isArray(society?.recentEvents) ? society.recentEvents : [];
  const recentPosts = Array.isArray(society?.recentPosts) ? society.recentPosts : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white shadow-2xl flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-2xl text-dark/60 hover:text-plum"
          aria-label="Close"
        >
          ×
        </button>

        <div
          className="h-40 w-full flex-shrink-0 rounded-t-3xl"
          style={{
            background: `linear-gradient(135deg, ${colors.plum} 0%, ${colors.lilac} 50%, rgba(255,255,255,0.9) 100%)`,
          }}
        >
          <div className="flex h-full items-center justify-center text-sm text-white/90">
            Society photo coming soon
          </div>
        </div>

        <div className="space-y-6 p-6 overflow-y-auto">
          {loading && (
            <div className="space-y-3">
              <SkeletonBlock className="h-6 w-1/3" />
              <SkeletonBlock className="h-4 w-1/2" />
              <SkeletonBlock className="h-24" />
            </div>
          )}

          {error && !loading && (
            <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Couldn't load this society. Please try again.
            </div>
          )}

          {!loading && !error && society && (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide" style={{ color: colors.plum }}>
                    {society.category ?? "Society"}
                  </div>
                  <h3 className="text-2xl font-semibold" style={{ color: colors.plum }}>
                    {society.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs opacity-70">
                    {society.campus && <span>{society.campus}</span>}
                    {statusLabel && <span>• {statusLabel}</span>}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={onToggleMembership}
                    disabled={membershipLoading || statusLoading || !onToggleMembership || isPending}
                    className={`rounded-2xl px-4 py-2 text-sm text-white transition-opacity ${
                      membershipLoading || statusLoading || isPending
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:opacity-90"
                    }`}
                    style={{ background: joined ? colors.plum : colors.lilac }}
                  >
                    {membershipLoading || statusLoading
                      ? "Processing..."
                      : isPending
                        ? "Request pending"
                        : joined
                          ? "Leave society"
                          : "Request to join"}
                  </button>
                  {statusLoading && !isPending && !membershipLoading && (
                    <div className="text-xs text-dark/60">Checking your latest request status…</div>
                  )}
                  {isPending && (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      <Clock size={14} />
                      <span>Your membership request is being reviewed. We'll notify you once the society responds.</span>
                    </div>
                  )}
                  {statusError && !isPending && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                      Couldn't confirm your request status right now. Please try again in a moment.
                    </div>
                  )}
                </div>
              </div>

              {society.description && (
                <p className="text-sm opacity-80">{society.description}</p>
              )}

              {interestTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {interestTags.slice(0, 8).map((tag) => (
                    <Pill key={tag}>{tag}</Pill>
                  ))}
                </div>
              )}

              {stats.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-lilac/40 bg-lilac/10 p-3 text-center"
                    >
                      <div className="text-xs uppercase tracking-wide opacity-70">{stat.label}</div>
                      <div className="text-lg font-semibold" style={{ color: colors.plum }}>
                        {stat.value ?? "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recentEvents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold" style={{ color: colors.plum }}>Upcoming events</h4>
                  <ul className="space-y-2">
                    {recentEvents.map((event) => (
                      <li
                        key={event.eventId ?? event.title}
                        className="rounded-2xl border border-mediumpur/30 bg-white/80 p-3 text-sm"
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs opacity-70">
                          {formatDateTimeLabel(event.startsAt) ?? "Date to be announced"}
                          {event.location ? ` • ${event.location}` : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recentPosts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold" style={{ color: colors.plum }}>Recent posts</h4>
                  <ul className="space-y-2">
                    {recentPosts.map((post) => (
                      <li
                        key={post.postId ?? post.title}
                        className="rounded-2xl border border-mediumpur/30 bg-white/80 p-3 text-sm"
                      >
                        <div className="text-xs uppercase tracking-wide opacity-60">
                          {formatDateLabel(post.createdAt) ?? "Recent"}
                        </div>
                        <div className="mt-1 font-medium">{post.title ?? "New update"}</div>
                        {post.content && (
                          <p className="opacity-80">{post.content}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RecommendationSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="min-w-[280px]">
          <SkeletonBlock className="h-52 w-full" />
        </div>
      ))}
    </div>
  );
}

function QuizPage({ onRefreshRecommendations }) {
  const { push } = useToast();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Load quiz on mount
  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMatchmakerQuiz();
        setQuiz(data);
        // Initialize answer state
        const initialAnswers = {};
        (data?.questions ?? []).forEach((q) => {
          initialAnswers[q.questionId] = { questionId: q.questionId, optionIds: [], freeText: "" };
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError(err);
        if (err?.status === 404) {
          push({ title: "Quiz not available", description: "The matchmaking quiz is not configured yet.", tone: "warning" });
        }
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [push]);


  const handleAnswerChange = (questionId, kind, value) => {
    setAnswers((prev) => {
      const current = prev[questionId] || { questionId, optionIds: [], freeText: "" };
      if (kind === "text") {
        return { ...prev, [questionId]: { ...current, freeText: value, optionIds: [] } };
      }
      if (kind === "single") {
        return { ...prev, [questionId]: { ...current, optionIds: [value], freeText: "" } };
      }
      if (kind === "multi") {
        const isSelected = current.optionIds.includes(value);
        const updatedOptions = isSelected
          ? current.optionIds.filter((id) => id !== value)
          : [...current.optionIds, value];
        return { ...prev, [questionId]: { ...current, optionIds: updatedOptions, freeText: "" } };
      }
      return prev;
    });
  };

  const validateAnswers = () => {
    if (!quiz?.questions) return { valid: false, message: "No questions found" };

    for (const question of quiz.questions) {
      const answer = answers[question.questionId];
      const isOptional = question.prompt?.toLowerCase().includes("optional");

      // Skip validation for optional questions
      if (isOptional) continue;

      if (!answer) return { valid: false, message: `Please answer: ${question.prompt}` };

      if (question.kind === "text") {
        if (!answer.freeText || !answer.freeText.trim()) {
          return { valid: false, message: `Please provide text for: ${question.prompt}` };
        }
      } else {
        if (!answer.optionIds || answer.optionIds.length === 0) {
          return { valid: false, message: `Please select an option for: ${question.prompt}` };
        }
      }
    }
    return { valid: true };
  };

  const handleSubmit = async () => {
    const validation = validateAnswers();
    if (!validation.valid) {
      push({ title: "Incomplete quiz", description: validation.message, tone: "warning" });
      return;
    }

    setSubmitting(true);
    setError(null);
    setSubmitSuccess(null);

    try {
      const answerArray = Object.values(answers)
        .filter((answer) => {
          // Include answer if it has either freeText or optionIds
          const hasFreeText = answer.freeText && answer.freeText.trim();
          const hasOptions = answer.optionIds && answer.optionIds.length > 0;
          return hasFreeText || hasOptions;
        })
        .map((answer) => ({
          questionId: answer.questionId,
          ...(answer.freeText && answer.freeText.trim() ? { freeText: answer.freeText.trim() } : {}),
          ...(answer.optionIds.length > 0 ? { optionIds: answer.optionIds } : {}),
        }));

      const result = await submitMatchmakerQuizAnswers(answerArray);
      setSubmitSuccess(result);
      push({
        title: "Quiz submitted!",
        description: `You're now matched with ${result.totalInterests} interests`,
        tone: "success"
      });

      // Refresh recommendations
      if (onRefreshRecommendations) {
        onRefreshRecommendations();
      }
    } catch (err) {
      setError(err);
      if (err?.status === 400) {
        push({ title: "Invalid answers", description: err?.message || "Please check your responses", tone: "error" });
      } else if (err?.status === 409) {
        push({ title: "Already submitted", description: "You can retake the quiz to update your interests", tone: "info" });
      } else {
        push({ title: "Submit failed", description: err?.message || "Please try again", tone: "error" });
      }
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <Card title="Matchmaking Quiz" subtitle="Loading your personalized quiz...">
        <div className="space-y-4 animate-pulse">
          <div className="h-20 rounded-2xl" style={{ background: colors.paper }}></div>
          <div className="h-20 rounded-2xl" style={{ background: colors.paper }}></div>
          <div className="h-20 rounded-2xl" style={{ background: colors.paper }}></div>
        </div>
      </Card>
    );
  }

  if (error && error?.status === 404) {
    return (
      <Card title="Quiz Not Available" subtitle="The matchmaking quiz hasn't been configured yet.">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Check back later or manage your interests from your profile.</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Error" subtitle="Failed to load quiz">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error?.message || "Something went wrong"}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-2xl px-4 py-2 hover:bg-mist/80 transition-colors"
            style={{ background: colors.mist }}
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }


  if (submitSuccess) {
    return (
      <Card title="Quiz Completed! 🎉" subtitle="Your recommendations are ready">
        <div className="space-y-4">
          <div className="rounded-2xl p-4" style={{ background: colors.paper }}>
            <h4 className="font-semibold mb-2" style={{ color: colors.plum }}>
              New Interests Added
            </h4>
            {submitSuccess.interestsAdded && submitSuccess.interestsAdded.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {submitSuccess.interestsAdded.map((interest) => (
                  <span
                    key={interest.id}
                    className="rounded-2xl px-3 py-1 text-sm text-white"
                    style={{ background: colors.lilac }}
                  >
                    {interest.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No new interests were added</p>
            )}
          </div>
          <div className="rounded-2xl p-4" style={{ background: colors.paper }}>
            <p className="text-sm">
              <strong>Total Interests:</strong> {submitSuccess.totalInterests}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Your recommendations have been updated based on your answers
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitSuccess(null);
              window.location.reload();
            }}
            className="rounded-2xl px-4 py-2 text-white hover:opacity-90 transition-opacity"
            style={{ background: colors.plum }}
          >
            Retake Quiz
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={quiz?.title || "Matchmaking Quiz"}
      subtitle={quiz?.description || "Answer questions to personalize your recommendations"}
      action={
        quiz?.lastSubmittedAt && (
          <span className="text-xs text-gray-500">
            Last taken: {new Date(quiz.lastSubmittedAt).toLocaleDateString()}
          </span>
        )
      }
    >
      <div className="space-y-4">
        {quiz?.questions?.map((question, idx) => (
          <div key={question.questionId} className="rounded-2xl p-4 space-y-3" style={{ background: colors.paper }}>
            <div className="flex items-start gap-2">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                style={{ background: colors.plum }}
              >
                {idx + 1}
              </span>
              <div className="flex-1">
                <div className="font-medium">{question.prompt}</div>
                {question.kind === "text" && (
                  <textarea
                    value={answers[question.questionId]?.freeText || ""}
                    onChange={(e) => handleAnswerChange(question.questionId, "text", e.target.value)}
                    placeholder="Type your answer here..."
                    className="mt-2 w-full rounded-xl p-3 border-2 focus:outline-none focus:border-lilac transition-colors"
                    style={{ borderColor: colors.mist }}
                    rows={3}
                  />
                )}
                {question.kind === "single" && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {question.options.map((option) => (
                      <button
                        key={option.optionId}
                        onClick={() => handleAnswerChange(question.questionId, "single", option.optionId)}
                        className={`rounded-2xl px-3 py-2 text-sm transition-colors ${
                          answers[question.questionId]?.optionIds?.includes(option.optionId)
                            ? "text-white"
                            : "hover:bg-mist/80"
                        }`}
                        style={{
                          background: answers[question.questionId]?.optionIds?.includes(option.optionId)
                            ? colors.lilac
                            : colors.mist,
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
                {question.kind === "multi" && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {question.options.map((option) => (
                      <button
                        key={option.optionId}
                        onClick={() => handleAnswerChange(question.questionId, "multi", option.optionId)}
                        className={`rounded-2xl px-3 py-2 text-sm transition-colors ${
                          answers[question.questionId]?.optionIds?.includes(option.optionId)
                            ? "text-white"
                            : "hover:bg-mist/80"
                        }`}
                        style={{
                          background: answers[question.questionId]?.optionIds?.includes(option.optionId)
                            ? colors.lilac
                            : colors.mist,
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-2xl px-4 py-2 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ background: colors.plum }}
        >
          {submitting ? "Submitting..." : quiz?.lastSubmittedAt ? "Update Answers" : "Submit Quiz"}
        </button>
      </div>
    </Card>
  );
}

const NOTIFICATION_LIMIT = 20;
const NOTIFICATION_TYPE_LABELS = {
  membership_update: "Membership update",
  event_created: "New event",
  event_reminder: "Event reminder",
  announcement: "Announcement",
  post: "New post",
  general: "Update",
};

function NotificationsPage() {
  const { push } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [markingIds, setMarkingIds] = useState(() => new Set());

  const loadNotifications = useCallback(
    async (pageToLoad = 1, { append = false } = {}) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const payload = await listNotifications({ page: pageToLoad, limit: NOTIFICATION_LIMIT });
        const items = Array.isArray(payload?.data) ? payload.data : [];
        setNotifications((prev) => (append ? [...prev, ...items] : items));
        setHasMore(pageToLoad * NOTIFICATION_LIMIT < (payload?.total ?? items.length));
        setPage(pageToLoad);
        setError(null);
      } catch (err) {
        if (!append) setNotifications([]);
        setError(err);
        if (err?.status !== 401) {
          push({
            title: "Couldn't load notifications",
            description: err?.message ?? "Please try again shortly.",
            tone: "error",
          });
        }
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    [push]
  );

  useEffect(() => {
    loadNotifications(1, { append: false });
  }, [loadNotifications]);

  const unseenCount = useMemo(
    () => notifications.filter((item) => !item.seenAt).length,
    [notifications]
  );

  const handleMarkSeen = useCallback(
    async (notificationId) => {
      if (!notificationId) return;
      setMarkingIds((prev) => {
        const next = new Set(prev);
        next.add(notificationId);
        return next;
      });
      try {
        const result = await markNotificationSeen(notificationId);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notificationId
              ? {
                  ...item,
                  seenAt: result?.seenAt ?? new Date().toISOString(),
                }
              : item
          )
        );
      } catch (err) {
        if (err?.status !== 404) {
          push({
            title: "Couldn't mark as read",
            description: err?.message ?? "Please try again shortly.",
            tone: "error",
          });
        }
      } finally {
        setMarkingIds((prev) => {
          const next = new Set(prev);
          next.delete(notificationId);
          return next;
        });
      }
    },
    [push]
  );

  const handleMarkAll = useCallback(async () => {
    const unseen = notifications.filter((item) => !item.seenAt).map((item) => item.id);
    if (unseen.length === 0) return;
    const batch = new Set(unseen);
    setMarkingIds((prev) => new Set([...prev, ...batch]));
    try {
      await Promise.all(unseen.map((id) => markNotificationSeen(id).catch(() => null)));
      setNotifications((prev) =>
        prev.map((item) =>
          batch.has(item.id)
            ? {
                ...item,
                seenAt: item.seenAt ?? new Date().toISOString(),
              }
            : item
        )
      );
    } finally {
      setMarkingIds((prev) => {
        const next = new Set(prev);
        unseen.forEach((id) => next.delete(id));
        return next;
      });
    }
  }, [notifications]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadNotifications(page + 1, { append: true });
    }
  }, [hasMore, loadingMore, loadNotifications, page]);

  return (
    <Card
      title="Notifications"
      subtitle="Stay informed about memberships, events, and updates."
      action={
        unseenCount > 0 ? (
          <button
            type="button"
            onClick={handleMarkAll}
            className="rounded-2xl px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: colors.plum }}
          >
            Mark all as read
          </button>
        ) : null
      }
    >
      {loading ? (
        <NotificationsSkeleton />
      ) : error && notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          Couldn't load notifications. Please try again shortly.
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-mediumpur/40 bg-white p-8 text-center">
          <p className="text-sm font-medium text-dark">You're all caught up!</p>
          <p className="mt-1 text-sm text-dark/70">New updates from your societies will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkSeen={handleMarkSeen}
              marking={markingIds.has(notification.id)}
            />
          ))}
          {hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className={`rounded-2xl px-4 py-2 text-sm text-white transition-opacity ${
                  loadingMore ? "cursor-wait opacity-60" : "hover:opacity-90"
                }`}
                style={{ background: colors.lilac }}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function EventsPage({ loading, events = [], error, onToggleRsvp }) {
  const [query, setQuery] = useState("");
  const [selectedSociety, setSelectedSociety] = useState("all");
  const [timeFilter, setTimeFilter] = useState("upcoming");

  const societyOptions = useMemo(() => {
    const set = new Set();
    events.forEach((event) => {
      if (event?.society?.name) set.add(event.society.name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [events]);

  useEffect(() => {
    if (selectedSociety === "all") return;
    if (!societyOptions.some((name) => name === selectedSociety)) {
      setSelectedSociety("all");
    }
  }, [societyOptions, selectedSociety]);

  const filteredEvents = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    const now = Date.now();
    return events.filter((event) => {
      const startTime = event?.startsAt ? new Date(event.startsAt).getTime() : null;
      const isUpcoming = startTime == null || startTime >= now;
      const isPast = startTime != null && startTime < now;

      const matchesTime =
        timeFilter === "all"
          ? true
          : timeFilter === "upcoming"
            ? isUpcoming
            : isPast;

      const matchesSociety =
        selectedSociety === "all"
          ? true
          : (event?.society?.name ?? "").toLowerCase() === selectedSociety.toLowerCase();

      const matchesQuery =
        !lowered ||
        [event?.title, event?.society?.name, event?.description]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(lowered));

      return matchesTime && matchesSociety && matchesQuery;
    });
  }, [events, query, selectedSociety, timeFilter]);

  const showEmpty = !loading && events.length === 0;
  const showNoResults = !loading && events.length > 0 && filteredEvents.length === 0;

  const handleClearFilters = useCallback(() => {
    setQuery("");
    setSelectedSociety("all");
    setTimeFilter("upcoming");
  }, []);

  return (
    <Card
      title="Upcoming events"
      subtitle="Discover what's happening in your societies and around campus."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] md:min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events or societies…"
            className="w-full rounded-2xl px-4 py-2 pl-9 outline-none focus:ring-2 focus:ring-lilac"
            style={{ background: colors.mist }}
          />
        </div>
        <select
          value={selectedSociety}
          onChange={(event) => setSelectedSociety(event.target.value)}
          className="appearance-none cursor-pointer rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-lilac"
          style={{ background: colors.mist }}
        >
          <option value="all">All societies</option>
          {societyOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={timeFilter}
          onChange={(event) => setTimeFilter(event.target.value)}
          className="appearance-none cursor-pointer rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-lilac"
          style={{ background: colors.mist }}
        >
          <option value="upcoming">Upcoming</option>
          <option value="all">All</option>
          <option value="past">Past</option>
        </select>
      </div>

      {!loading && error && events.length > 0 && (
        <div className="mb-4 rounded-3xl border border-dashed border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Couldn't refresh events right now. Showing the latest information we have.
        </div>
      )}

      {loading ? (
        <EventsSkeleton />
      ) : showEmpty ? (
        <div className="rounded-3xl border border-dashed border-mediumpur/40 bg-white p-8 text-center">
          <p className="text-sm font-medium text-dark">No events to show yet.</p>
          <p className="mt-1 text-sm text-dark/70">
            Keep an eye out for upcoming activities from your societies.
          </p>
        </div>
      ) : showNoResults ? (
        <div className="space-y-3 rounded-3xl border border-dashed border-mediumpur/40 bg-white p-8 text-center">
          <div className="text-sm font-medium text-dark">No events match your filters.</div>
          <div className="text-sm text-dark/70">Try adjusting your search or reset filters.</div>
          {(query || selectedSociety !== "all" || timeFilter !== "upcoming") && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-2xl px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: colors.lilac }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id ?? event.title} event={event} onToggleRsvp={onToggleRsvp} />
          ))}
        </div>
      )}
    </Card>
  );
}

function EventsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-mediumpur/20 bg-white shadow-sm"
        >
          <div className="flex flex-col xl:flex-row">
            <SkeletonBlock className="h-40 w-full xl:w-1/3" />
            <div className="flex-1 space-y-3 p-6">
              <SkeletonBlock className="h-4 w-1/4" />
              <SkeletonBlock className="h-6 w-1/2" />
              <SkeletonBlock className="h-3 w-3/4" />
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-10 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventCard({ event, onToggleRsvp }) {
  if (!event) return null;
  const going = event.rsvp === true;
  const canToggle = typeof onToggleRsvp === "function" && event.id;
  const buttonDisabled = event.optimistic || !canToggle;
  const startLabel = formatDateTimeLabel(event.startsAt) ?? event.date ?? "Date to be announced";
  const endLabel = event.endsAt ? formatDateTimeLabel(event.endsAt) : null;
  const relativeLabel = formatRelativeTime(event.startsAt);
  const stats = [
    { label: "RSVPs", value: event.stats?.rsvps ?? 0 },
    { label: "Likes", value: event.stats?.likes ?? 0 },
    event.capacity != null ? { label: "Capacity", value: event.capacity } : null,
  ].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-3xl border border-mediumpur/20 bg-white shadow-sm">
      <div className="flex flex-col xl:flex-row">
        <div
          className="flex items-center justify-center px-6 py-12 text-sm text-white/90 xl:w-1/3"
          style={{
            background: `linear-gradient(135deg, ${colors.lilac} 0%, ${colors.plum} 70%, rgba(255,255,255,0.95) 100%)`,
          }}
        >
          <span className="text-center">Event artwork coming soon</span>
        </div>
        <div className="flex-1 space-y-4 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              {event?.society?.name && (
                <div className="text-xs uppercase tracking-wide" style={{ color: colors.mediumpur }}>
                  {event.society.name}
                </div>
              )}
              <h3 className="text-2xl font-semibold" style={{ color: colors.plum }}>
                {event.title ?? "Upcoming event"}
              </h3>
              <div className="flex flex-wrap gap-2 text-xs text-dark/60">
                <span>{startLabel}</span>
                {endLabel && <span>• Ends {endLabel}</span>}
                {relativeLabel && <span>• {relativeLabel}</span>}
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-dark/70">
                {event.location && <span>Location: {event.location}</span>}
                {event.createdBy && (
                  <span>
                    Hosted by {event.createdBy.firstName} {event.createdBy.lastName}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!canToggle) return;
                  onToggleRsvp(event.id, !going);
                }}
                disabled={buttonDisabled}
                className={`rounded-2xl px-4 py-2 text-sm text-white transition-opacity ${
                  buttonDisabled ? "cursor-wait opacity-60" : "hover:opacity-90"
                }`}
                style={{ background: going ? colors.plum : colors.lilac }}
              >
                {buttonDisabled ? "Updating…" : going ? "Cancel RSVP" : "I'm going"}
              </button>
            </div>
          </div>

          {event.description && <p className="text-sm opacity-80">{event.description}</p>}

          {stats.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-lilac/40 bg-lilac/10 p-3 text-center"
                >
                  <div className="text-xs uppercase tracking-wide opacity-70">{stat.label}</div>
                  <div className="text-lg font-semibold" style={{ color: colors.plum }}>
                    {stat.value ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Posts Page
function PostsPage({ loading, posts = [], error, onToggleLike }) {
  const [query, setQuery] = useState("");
  const [selectedSociety, setSelectedSociety] = useState("all");

  const societyOptions = useMemo(() => {
    const set = new Set();
    posts.forEach((post) => {
      if (post?.society?.name) set.add(post.society.name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  useEffect(() => {
    if (selectedSociety === "all") return;
    if (!societyOptions.some((name) => name === selectedSociety)) {
      setSelectedSociety("all");
    }
  }, [societyOptions, selectedSociety]);

  const filteredPosts = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesSociety =
        selectedSociety === "all"
          ? true
          : (post?.society?.name ?? "").toLowerCase() === selectedSociety.toLowerCase();

      const matchesQuery =
        !lowered ||
        [post?.content, post?.society?.name, post?.author?.firstName, post?.author?.lastName]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(lowered));

      return matchesSociety && matchesQuery;
    });
  }, [posts, query, selectedSociety]);

  const showEmpty = !loading && posts.length === 0;
  const showNoResults = !loading && posts.length > 0 && filteredPosts.length === 0;

  const handleClearFilters = useCallback(() => {
    setQuery("");
    setSelectedSociety("all");
  }, []);

  return (
    <Card
      title="Society Posts"
      subtitle="Stay updated with posts from your societies."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] md:min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search posts or societies…"
            className="w-full rounded-2xl px-4 py-2 pl-9 outline-none focus:ring-2 focus:ring-lilac"
            style={{ background: colors.mist }}
          />
        </div>
        <select
          value={selectedSociety}
          onChange={(event) => setSelectedSociety(event.target.value)}
          className="appearance-none cursor-pointer rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-lilac"
          style={{ background: colors.mist }}
        >
          <option value="all">All societies</option>
          {societyOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {!loading && error && posts.length > 0 && (
        <div className="mb-4 rounded-3xl border border-dashed border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Couldn't refresh posts right now. Showing the latest information we have.
        </div>
      )}

      {loading ? (
        <PostsSkeleton />
      ) : showEmpty ? (
        <div className="rounded-3xl border border-dashed border-mediumpur/40 bg-white p-8 text-center">
          <p className="text-sm font-medium text-dark">No posts to show yet.</p>
          <p className="mt-1 text-sm text-dark/70">
            Join societies to see their posts and updates.
          </p>
        </div>
      ) : showNoResults ? (
        <div className="space-y-3 rounded-3xl border border-dashed border-mediumpur/40 bg-white p-8 text-center">
          <div className="text-sm font-medium text-dark">No posts match your filters.</div>
          <div className="text-sm text-dark/70">Try adjusting your search or reset filters.</div>
          {(query || selectedSociety !== "all") && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-2xl px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: colors.lilac }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.postId} post={post} onToggleLike={onToggleLike} />
          ))}
        </div>
      )}
    </Card>
  );
}

function PostsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-mediumpur/20 bg-white shadow-sm p-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-16 w-full bg-gray-200 rounded animate-pulse mt-2" />
              <div className="flex gap-2 mt-2">
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PostCard({ post, onToggleLike }) {
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onToggleLike?.(post.postId, post.likedByMe);
    } finally {
      setIsLiking(false);
    }
  };

  const authorName = [post?.author?.firstName, post?.author?.lastName]
    .filter(Boolean)
    .join(" ") || "Unknown";

  const createdDate = post?.createdAt ? new Date(post.createdAt) : null;
  const timeAgo = createdDate
    ? createdDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="overflow-hidden rounded-3xl border border-mediumpur/20 bg-white shadow-sm p-4">
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ background: colors.lilac }}
        >
          {authorName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-semibold text-dark">{authorName}</div>
            {post?.society?.name && (
              <>
                <span className="text-dark/40">•</span>
                <div className="text-sm text-dark/70">{post.society.name}</div>
              </>
            )}
          </div>
          {timeAgo && <div className="text-xs text-dark/50 mt-1">{timeAgo}</div>}

          {post?.content && (
            <p className="mt-3 text-sm text-dark whitespace-pre-wrap break-words">
              {post.content}
            </p>
          )}

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-sm transition-all ${
                post.likedByMe
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Heart
                size={16}
                className={post.likedByMe ? "fill-current" : ""}
              />
              <span>{post.likeCount || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small atoms
function Input({ label, ...props }) {
  return (
    <label className="block">
      <div className="text-xs mb-1 opacity-70">{label}</div>
      <input {...props} className="w-full rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-lilac"
        style={{ background: colors.mist }} />
    </label>
  );
}

function QBlock({ q, opts }) {
  const [selected, setSelected] = useState([]);

  const handleOptionClick = (option) => {
    setSelected(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="rounded-2xl p-4 space-y-2" style={{ background: colors.paper }}>
      <div className="font-medium">{q}</div>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button
            key={o}
            onClick={() => handleOptionClick(o)}
            className={`rounded-2xl px-3 py-2 transition-colors ${selected.includes(o) ? 'bg-lilac text-white' : 'bg-mist hover:bg-mist/80'}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// Original App component, renamed to StudentDashboardApp
function StudentDashboardApp() {
  const location = useLocation();
  const initialPage = location.state?.page || "dashboard";
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [dashboardState, setDashboardState] = useState(emptyDashboard);
  const { push } = useToast();
  const { user } = useAuth();
  const baseUser = useMemo(() => sanitizeUser(user ?? null), [user]);
  const studentIdentifier = useMemo(
    () =>
      user?.universityNumber ??
      user?.studentNumber ??
      user?.id ??
      user?.user_id ??
      null,
    [user]
  );
  const [studentSummary, setStudentSummary] = useState(() => ({
    firstName: baseUser.firstName,
    lastName: baseUser.lastName,
    campus: baseUser.campus,
    studyField: "",
  }));
  const [studentSummaryLoading, setStudentSummaryLoading] = useState(true);
  const [studentSocieties, setStudentSocieties] = useState([]);
  const [studentSocietiesLoading, setStudentSocietiesLoading] = useState(true);
  const [studentSocietiesError, setStudentSocietiesError] = useState(null);
  const [mySocietyRefreshKey, setMySocietyRefreshKey] = useState(0);
  const [studentEvents, setStudentEvents] = useState([]);
  const [studentEventsLoading, setStudentEventsLoading] = useState(true);
  const [studentEventsError, setStudentEventsError] = useState(null);
  const [studentPosts, setStudentPosts] = useState([]);
  const [studentPostsLoading, setStudentPostsLoading] = useState(true);
  const [studentPostsError, setStudentPostsError] = useState(null);
  const [recommendationRails, setRecommendationRails] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState(null);
  useEffect(() => {
    setDashboardState(fallbackDashboard);
    setLoading(false);
  }, []);

  const loadDashboardRecommendations = useCallback(async () => {
    try {
      setRecommendationsLoading(true);
      const payload = await fetchHomeRecommendations();
      const rails = Array.isArray(payload?.rails) ? payload.rails.filter(Boolean) : [];
      setRecommendationRails(rails);
      setRecommendationsError(null);
    } catch (error) {
      setRecommendationRails([]);
      setRecommendationsError(error);
      if (error?.status && error.status !== 401) {
        push({
          title: "Couldn't load recommendations",
          description: error?.message ?? "Please try again shortly.",
          tone: "error",
        });
      }
    } finally {
      setRecommendationsLoading(false);
    }
  }, [push]);

  useEffect(() => {
    loadDashboardRecommendations();
  }, [loadDashboardRecommendations]);

  useEffect(() => {
    let active = true;
    setStudentSummary((prev) => ({
      firstName: baseUser.firstName,
      lastName: baseUser.lastName,
      campus: baseUser.campus,
      studyField: prev.studyField,
    }));
    setStudentSummaryLoading(true);

    (async () => {
      try {
        const [profileData, userData] = await Promise.all([
          getMyProfile().catch((error) => {
            if (error?.status === 404) return EMPTY_PROFILE;
            throw error;
          }),
          getCurrentUser().catch(() => null),
        ]);
        if (!active) return;
        const sanitizedProfile = sanitizeProfile(profileData ?? EMPTY_PROFILE);
        const sanitizedRemoteUser = sanitizeUser(userData ?? baseUser);
        setStudentSummary({
          firstName: sanitizedRemoteUser.firstName || baseUser.firstName,
          lastName: sanitizedRemoteUser.lastName || baseUser.lastName,
          campus: sanitizedRemoteUser.campus ?? baseUser.campus ?? null,
          studyField: sanitizedProfile.studyField ?? "",
        });
      } catch (error) {
        if (!active) return;
        setStudentSummary({
          firstName: baseUser.firstName,
          lastName: baseUser.lastName,
          campus: baseUser.campus,
          studyField: "",
        });
      } finally {
        if (active) setStudentSummaryLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [baseUser]);

  useEffect(() => {
    if (!studentIdentifier) {
      setStudentSocieties([]);
      setStudentSocietiesError(null);
      setStudentSocietiesLoading(false);
      setDashboardState((prev) => ({ ...prev, societies: [] }));
      return;
    }

    let active = true;
    setStudentSocietiesLoading(true);
    setStudentSocietiesError(null);

    (async () => {
      try {
        const payload = await listStudentMemberships(studentIdentifier);
        if (!active) return;
        const memberships = Array.isArray(payload?.memberships) ? payload.memberships : [];
        const list = memberships
          .map((entry) => {
            const society = entry?.society ?? {};
            const rawId =
              society.id ??
              society.societyId ??
              society.society_id ??
              society?.society?.society_id ??
              null;
            if (rawId == null) return null;
            const id = String(rawId);
            const rawStatus = entry?.status ?? null;
            const normalizedStatus = normalizeMembershipStatusValue(rawStatus);
            const membershipStatus = normalizedStatus ?? (typeof rawStatus === "string" ? rawStatus.trim() : null);
            return {
              id,
              name:
                society.name ??
                society.society_name ??
                entry?.name ??
                entry?.societyName ??
                "Untitled society",
              category: society.category ?? null,
              campus: society.campus ?? null,
              description: society.description ?? null,
              membershipStatus,
              membershipStatusLabel: formatMembershipStatusLabel(membershipStatus ?? rawStatus ?? null),
              isMember: normalizedStatus
                ? normalizedStatus !== "left" && normalizedStatus !== "inactive"
                : true,
              tags: Array.isArray(entry?.tags) ? entry.tags : [],
              interestTags: Array.isArray(entry?.interestTags) ? entry.interestTags : [],
              joinDate: entry?.joinDate ?? null,
            };
          })
          .filter(Boolean);

        setStudentSocieties(list);
        setDashboardState((prev) => ({ ...prev, societies: list }));
      } catch (error) {
        if (!active) return;
        setStudentSocieties([]);
        setStudentSocietiesError(error);
        if (error?.status && error.status !== 404) {
          push({
            title: "Couldn't load your societies",
            description: error?.message ?? "Please try again shortly.",
            tone: "error",
          });
        }
        setDashboardState((prev) => ({ ...prev, societies: [] }));
      } finally {
        if (active) setStudentSocietiesLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [studentIdentifier, push, mySocietyRefreshKey]);

  const loadStudentEvents = useCallback(async () => {
    setStudentEventsLoading(true);
    const joinedIds = Array.isArray(studentSocieties)
      ? Array.from(
          new Set(
            studentSocieties
              .map((society) => {
                const id = getSocietyId(society);
                return id && /^\d+$/.test(id) ? id : null;
              })
              .filter(Boolean)
          )
        )
      : [];

    try {
      const results = [];
      const errors = [];

      if (joinedIds.length > 0) {
        const responses = await Promise.allSettled(
          joinedIds.map((id) => listEvents({ limit: 10, societyId: id }))
        );
        responses.forEach((entry) => {
          if (entry.status === "fulfilled") {
            const chunk = Array.isArray(entry.value?.data)
              ? entry.value.data.map(mapEventFromApi).filter(Boolean)
              : [];
            results.push(...chunk);
          } else if (entry.reason) {
            errors.push(entry.reason);
          }
        });
      }

      const deduped = Array.from(
        new Map(
          results.map((event) => [event.id ?? `${event.title}-${event.startsAt}`, event])
        ).values()
      ).sort((a, b) => {
        const aTime = a?.startsAt ? new Date(a.startsAt).getTime() : Number.POSITIVE_INFINITY;
        const bTime = b?.startsAt ? new Date(b.startsAt).getTime() : Number.POSITIVE_INFINITY;
        return aTime - bTime;
      });

      setStudentEvents(deduped);
      if (errors.length > 0) {
        const primaryError = errors[0];
        setStudentEventsError(primaryError);
        if (primaryError?.status && primaryError.status !== 401) {
          push({
            title: "Some events couldn't load",
            description: primaryError?.message ?? "Please try again shortly.",
            tone: "warning",
          });
        }
      } else {
        setStudentEventsError(null);
      }
    } catch (error) {
      setStudentEvents([]);
      setStudentEventsError(error);
      if (error?.status && error.status !== 401) {
        push({
          title: "Couldn't load events",
          description: error?.message ?? "Please try again shortly.",
          tone: "error",
        });
      }
    } finally {
      setStudentEventsLoading(false);
    }
  }, [baseUser.campus, push, studentSocieties]);

  const loadStudentPosts = useCallback(async () => {
    setStudentPostsLoading(true);
    try {
      const response = await getPostsFeed(1, 50);
      const posts = Array.isArray(response?.data) ? response.data : [];
      setStudentPosts(posts);
      setStudentPostsError(null);
    } catch (error) {
      setStudentPosts([]);
      setStudentPostsError(error);
      if (error?.status && error.status !== 401) {
        push({
          title: "Couldn't load posts",
          description: error?.message ?? "Please try again shortly.",
          tone: "error",
        });
      }
    } finally {
      setStudentPostsLoading(false);
    }
  }, [push]);

  const dashboardRecommendations = useMemo(() => {
    const picks = [];
    const seen = new Set();
    recommendationRails.forEach((rail) => {
      if (!rail) return;
      const items = Array.isArray(rail.items) ? rail.items : [];
      const candidate = items.find((item) => item && (item.societyId != null || item.id != null));
      if (!candidate) return;
      const rawId = candidate.societyId ?? candidate.id ?? null;
      const id = rawId != null ? String(rawId) : null;
      if (id && seen.has(id)) return;
      if (id) seen.add(id);
      picks.push({
        id,
        name: candidate.name ?? candidate.society_name ?? "Untitled society",
        category: candidate.category ?? null,
        campus: candidate.campus ?? null,
        description: candidate.description ?? null,
        tags: Array.isArray(candidate.reasonPills)
          ? candidate.reasonPills
          : Array.isArray(candidate.interestTags)
            ? candidate.interestTags
            : Array.isArray(candidate.tags)
              ? candidate.tags
              : [],
        railHeading: rail.heading ?? null,
        railSubtitle: rail.subtitle ?? null,
      });
    });
    return picks;
  }, [recommendationRails]);

  useEffect(() => {
    if (studentSocietiesLoading) return;
    loadStudentEvents();
    loadStudentPosts();
  }, [loadStudentEvents, loadStudentPosts, studentSocietiesLoading]);

  useEffect(() => {
    setDashboardState((prev) => ({ ...prev, events: studentEvents }));
  }, [studentEvents]);

  useEffect(() => {
    setDashboardState((prev) => ({ ...prev, recommended: dashboardRecommendations }));
  }, [dashboardRecommendations]);

  const handleToggleRsvp = useCallback(async (eventId, attending) => {
    const idString = String(eventId);
    let snapshot = null;
    setStudentEvents((prev) => {
      snapshot = prev;
      return prev.map((event) => {
        if (event.id !== idString) return event;
        const wasGoing = event.rsvp === true;
        const nextGoing = attending;
        const delta = (nextGoing ? 1 : 0) - (wasGoing ? 1 : 0);
        const nextStats = {
          ...event.stats,
          rsvps: Math.max(0, (event.stats?.rsvps ?? 0) + delta),
        };
        return {
          ...event,
          rsvp: nextGoing,
          rsvpStatus: nextGoing ? event.rsvpStatus ?? "going" : null,
          optimistic: true,
          stats: nextStats,
        };
      });
    });

    try {
      const result = await toggleEventRsvp(idString, attending);
      setStudentEvents((prev) =>
        prev.map((event) =>
          event.id === idString
            ? {
                ...event,
                optimistic: false,
                rsvp: attending,
                rsvpStatus: attending ? result?.status ?? "going" : null,
              }
            : event
        )
      );
      push({
        title: attending ? "RSVP confirmed" : "RSVP withdrawn",
        tone: "success",
      });
    } catch (error) {
      if (snapshot) setStudentEvents(snapshot);
      push({
        title: "Could not update RSVP",
        description: error.message,
        tone: "error",
      });
    }
  }, [push]);

  const handleTogglePostLike = useCallback(async (postId, currentlyLiked) => {
    const idString = String(postId);
    let snapshot = null;
    setStudentPosts((prev) => {
      snapshot = prev;
      return prev.map((post) => {
        if (post.postId !== idString) return post;
        const nextLiked = !currentlyLiked;
        const delta = (nextLiked ? 1 : 0) - (currentlyLiked ? 1 : 0);
        return {
          ...post,
          likedByMe: nextLiked,
          likeCount: Math.max(0, (post.likeCount ?? 0) + delta),
          optimistic: true,
        };
      });
    });

    try {
      await togglePostLike(idString, currentlyLiked);
      setStudentPosts((prev) =>
        prev.map((post) =>
          post.postId === idString ? { ...post, optimistic: false } : post
        )
      );
    } catch (error) {
      if (snapshot) setStudentPosts(snapshot);
      push({
        title: "Could not update like",
        description: error.message,
        tone: "error",
      });
    }
  }, [push]);

  const handleLeaveSociety = useCallback(async (societyId) => {
    const idString = String(societyId);
    let snapshot;
    setDashboardState((prev) => {
      snapshot = prev;
      const markOptimistic = (list = []) =>
        list.map((society) =>
          getSocietyId(society) === idString
            ? { ...society, optimistic: true }
            : society
        );
      return {
        ...prev,
        societies: markOptimistic(prev.societies),
      };
    });

    try {
      await leaveSociety(societyId);
      setDashboardState((prev) => {
        const filterSocieties = (list = []) =>
          list.filter((society) => getSocietyId(society) !== idString);
        return {
          ...prev,
          societies: filterSocieties(prev.societies),
        };
      });
      push({
        title: "Left society",
        tone: "success",
      });
      setStudentSocieties((prev) => prev.filter((society) => getSocietyId(society) !== idString));
      setMySocietyRefreshKey((key) => key + 1);
      loadStudentEvents();
      loadStudentPosts();
      return true;
    } catch (error) {
      setDashboardState(snapshot);
      push({
        title: "Could not leave society",
        description: error.message,
        tone: "error",
      });
      return false;
    }
  }, [push, loadStudentEvents, loadStudentPosts]);

  const handleJoinSociety = useCallback(async (societyId) => {
    try {
      await joinSociety(societyId);
      push({
        title: "Membership request sent",
        description: "We'll notify you once it's approved.",
        tone: "success",
      });
      setMySocietyRefreshKey((key) => key + 1);
      loadStudentEvents();
      return true;
    } catch (error) {
      push({
        title: "Could not request membership",
        description: error.message,
        tone: "error",
      });
      return false;
    }
  }, [push, loadStudentEvents]);

  const dashboardLoading =
    loading || studentEventsLoading || studentSocietiesLoading || (recommendationsLoading && dashboardRecommendations.length === 0);

  return (
    <Shell
      page={page}
      setPage={setPage}
      student={studentSummary}
      studentLoading={studentSummaryLoading}
    >
      {page === "dashboard" && (
        <DashboardPage
          loading={dashboardLoading}
          summary={{
            activeSocieties: studentSocieties.length,
            upcomingEvents: studentEvents.length,
            newMatches: dashboardRecommendations.length,
          }}
          recommendations={dashboardRecommendations}
          recommendationsLoading={recommendationsLoading}
          recommendationsError={recommendationsError}
          events={studentEvents}
          onToggleRsvp={handleToggleRsvp}
          onSeeAllRecommendations={() => setPage("explore")}
        />
      )}
      {page === "profile" && <ProfilePage />}
      {page === "explore" && (
        <ExplorePage
          societies={dashboardState.societies}
          onJoin={handleJoinSociety}
          onLeave={handleLeaveSociety}
        />
      )}
      {page === "details" && (
        <SocietyDetailsPage
          loading={studentSocietiesLoading}
          societies={studentSocieties}
          error={studentSocietiesError}
          onLeave={handleLeaveSociety}
        />
      )}
      {page === "quiz" && <QuizPage onRefreshRecommendations={loadDashboardRecommendations} />}
      {page === "notifications" && <NotificationsPage />}
      {page === "events" && (
        <EventsPage
          loading={studentEventsLoading}
          error={studentEventsError}
          events={studentEvents}
          onToggleRsvp={handleToggleRsvp}
        />
      )}
      {page === "posts" && (
        <PostsPage
          loading={studentPostsLoading}
          error={studentPostsError}
          posts={studentPosts}
          onToggleLike={handleTogglePostLike}
        />
      )}
    </Shell>
  );
}

// The new default exported App component
export default function App() {
  return <StudentDashboardApp />;
}
