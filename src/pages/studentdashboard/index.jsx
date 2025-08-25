import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Compass,
  Bell,
  CalendarDays,
  Sparkles,
  Search,
  Heart,
  Plus,
  Check,
  Clock,
  ChevronRight,
  Menu,
  Inbox,
} from "lucide-react";

// Brand palette
const colors = {
  paper: "#e7e7e7",
  mist: "#d2d3de",
  lilac: "#ac98cd",
  plum: "#6a509b",
};

// Simple layout shell with responsive sidebar
function Shell({ page, setPage, children }) {
  const [open, setOpen] = useState(true);
  const nav = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { key: "profile", label: "My Profile", icon: <User size={18} /> },
    { key: "explore", label: "Explore", icon: <Compass size={18} /> },
    { key: "details", label: "Societies", icon: <Sparkles size={18} /> },
    { key: "quiz", label: "Quiz", icon: <Inbox size={18} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { key: "events", label: "Events", icon: <CalendarDays size={18} /> },
  ];

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
        style={{ borderBottom: `1px solid ${colors.mist}` }}
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
          <div className="flex items-center gap-2">
            {/* Logo*/}
            <img
              src="src/assets/icon1.png" 
              alt="PukkeConnect Logo"
              className="size-10 rounded-xl object-contain flex-shrink-0" 
              style={{
                background: colors.white,
              }}
            />
            {/* hidden md:block to hide PukkeConnect text on small screens */}
            <div className="font-semibold hidden md:block" style={{ color: colors.plum }}>
              PukkeConnect
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-[360px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
              <input
                placeholder="Search societies, events, posts…"
                className="w-full rounded-2xl pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-lilac"
                style={{ background: colors.mist, color: "#111" }}
              />
            </div>
            <button
              className="rounded-2xl px-3 py-2 text-white hidden md:block hover:opacity-90 transition-opacity"
              style={{ background: colors.plum }}
            >
              New Post
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
              <div className="text-xs opacity-70 mb-1">Logged in as</div>
              <div className="text-sm font-semibold">Musawakhe</div>
              <div className="text-xs opacity-70">BSc IT • NWU</div>
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
const mockRecommended = [
  { id: 1, name: "AI & Robotics Society", tags: ["AI", "Workshops"], members: 1242 },
  { id: 2, name: "Hiking & Nature Club", tags: ["Outdoors", "Weekend"], members: 684 },
  { id: 3, name: "Entrepreneurs NWU", tags: ["Pitch", "Networking"], members: 910 },
];

const mockEvents = [
  { id: 1, title: "Campus Tech Expo", date: "Sep 10, 2025", time: "14:00", location: "Hall B", rsvp: true },
  { id: 2, title: "Sunset Hiking Trail", date: "Sep 14, 2025", time: "16:30", location: "Koppie", rsvp: false },
  { id: 3, title: "Startup Pitch Night", date: "Sep 20, 2025", time: "18:00", location: "Innovation Hub", rsvp: false },
];

const mockSocieties = [
  { id: 1, name: "Photography Circle", category: "Arts", tags: ["Creativity", "Workshops"], liked: true },
  { id: 2, name: "Data Science Guild", category: "Tech", tags: ["Python", "Kaggle"], liked: false },
  { id: 3, name: "Debate Union", category: "Academic", tags: ["Public Speaking"], liked: false },
  { id: 4, name: "Chess Club", category: "Games", tags: ["Strategy"], liked: true },
];

// Pages
function DashboardPage() {
  return (
    <>
      <Card title="Welcome back, Musawakhe 👋" subtitle="Here’s a quick glance at your societies and events.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl p-4" style={{ background: colors.lilac }}>
            <div className="text-white/90 text-sm">Active Societies</div>
            <div className="text-3xl font-bold text-white">4</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: colors.plum }}>
            <div className="text-white/90 text-sm">Upcoming Events</div>
            <div className="text-3xl font-bold text-white">3</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: colors.mist }}>
            <div className="text-sm">New Matches</div>
            <div className="text-3xl font-bold">6</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recommended societies" subtitle="Based on your interests (AI, Outdoors, Entrepreneurship)"
          action={<button className="text-sm rounded-xl px-3 py-1 text-white hover:opacity-90 transition-opacity" style={{ background: colors.plum }}>See all</button>}
        >
          <div className="space-y-3">
            {mockRecommended.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl" style={{ background: colors.paper }}>
                {/* Group avatar and text content */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-xl grid place-items-center text-white font-bold flex-shrink-0" style={{ background: colors.plum }}>
                    {s.name.split(" ")[0][0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{s.name}</div>
                    <div className="text-xs opacity-70 flex items-center gap-2">
                      {s.tags.map((t) => <Pill key={t}>{t}</Pill>)}
                      <span className="truncate">• {s.members.toLocaleString()} members</span>
                    </div>
                  </div>
                </div>
                <button className="rounded-xl px-3 py-1 text-sm flex items-center gap-2 hover:bg-mist/80 transition-colors flex-shrink-0 whitespace-nowrap" style={{ background: colors.mist }}>
                  <Plus size={16} /> Join
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Upcoming events" subtitle="Don’t miss activities from your societies"
          action={<button className="text-sm rounded-xl px-3 py-1 hover:bg-mist/80 transition-colors" style={{ background: colors.mist }}>Calendar</button>}
        >
          <div className="space-y-3">
            {mockEvents.map((e) => (
              <div key={e.id} className="p-3 rounded-2xl flex items-center justify-between gap-3" style={{ background: colors.paper }}>
                {/* Group date and event details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-xl px-3 py-2 text-sm font-semibold text-white flex-shrink-0" style={{ background: colors.lilac }}>{e.date}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{e.title}</div>
                    <div className="text-xs opacity-70 flex items-center gap-3"><Clock size={14} className="flex-shrink-0" /> <span className="truncate">{e.time} • {e.location}</span></div>
                  </div>
                </div>
                <button className="rounded-xl px-3 py-1 text-sm flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0 whitespace-nowrap"
                  style={{ background: e.rsvp ? colors.plum : colors.mist, color: e.rsvp ? "white" : "#111" }}
                >
                  {e.rsvp ? <Check size={16} /> : <Plus size={16} />} {e.rsvp ? "Going" : "RSVP"}
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function ProfilePage() {
  return (
    <>
      <Card title="My Profile" subtitle="Keep your details up to date.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="rounded-3xl p-4 flex flex-col items-center gap-3" style={{ background: colors.paper }}>
              <div className="size-20 rounded-2xl grid place-items-center text-white text-2xl font-bold" style={{ background: colors.plum }}>MC</div>
              <div className="text-center">
                <div className="font-semibold">Musawakhe Chipeya</div>
                <div className="text-xs opacity-70">BSc IT • NWU</div>
              </div>
              <button className="rounded-xl px-3 py-1 text-white hover:opacity-90 transition-opacity" style={{ background: colors.plum }}>Edit photo</button>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-2xl p-4" style={{ background: "white", border: `1px solid ${colors.mist}` }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input label="Study field" placeholder="Information Technology" />
                <Input label="Availability" placeholder="Weekends, 16:00-19:00" />
                <Input label="Interests" placeholder="AI, Hiking, Startups" />
                <Input label="Campus" placeholder="NWU Potchefstroom" />
              </div>
              <div className="mt-3 flex gap-2">
                <button className="rounded-2xl px-4 py-2 text-white hover:opacity-90 transition-opacity" style={{ background: colors.plum }}>Save changes</button>
                <button className="rounded-2xl px-4 py-2 hover:bg-mist/80 transition-colors" style={{ background: colors.mist }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

function ExplorePage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() =>
    mockSocieties.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase())
    ), [query]);

  return (
    <>
      <Card title="Explore societies" subtitle="Filter and find groups that match your vibe.">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
              className="rounded-2xl pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-lilac"
              style={{ background: colors.mist }}
            />
          </div>
          <select className="rounded-2xl px-3 py-2 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-lilac" style={{ background: colors.mist }}>
            <option>All categories</option>
            <option>Tech</option>
            <option>Arts</option>
            <option>Academic</option>
            <option>Games</option>
          </select>
          <select className="rounded-2xl px-3 py-2 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-lilac" style={{ background: colors.mist }}>
            <option>Any availability</option>
            <option>Weekdays</option>
            <option>Evenings</option>
            <option>Weekends</option>
            <option>Flexible</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="rounded-3xl p-4 space-y-2"
              style={{ background: "white", border: `1px solid ${colors.mist}` }}
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl grid place-items-center text-white font-bold" style={{ background: colors.lilac }}>
                  {s.name[0]}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs opacity-70">{s.category}</div>
                </div>
                <button className="rounded-xl p-2 hover:bg-mist/80 transition-colors" style={{ background: colors.mist }}>
                  <Heart size={16} className={s.liked ? "fill-current text-red-500" : ""} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {s.tags.map((t) => <Pill key={t}>{t}</Pill>)}
              </div>
              <button className="rounded-2xl px-3 py-2 w-full text-white hover:opacity-90 transition-opacity" style={{ background: colors.plum }}>View details</button>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function SocietyDetailsPage() {
  return (
    <Card title="AI & Robotics Society" subtitle="Learn, build, and compete with fellow innovators.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl p-4" style={{ background: colors.paper }}>
            <h4 className="font-semibold mb-1">About</h4>
            <p className="text-sm opacity-80">We host weekly workshops on ML, robotics, and hack nights. Open to all levels.</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: colors.paper }}>
            <h4 className="font-semibold mb-1">Recent posts</h4>
            <ul className="space-y-2 text-sm">
              <li>• Photos from last week’s robotics demo</li>
              <li>• Call for mentors: Intro to Python series</li>
              <li>• Survey: What do you want next?</li>
            </ul>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={{ background: colors.mist }}>
            <div className="text-sm opacity-80">Members</div>
            <div className="text-2xl font-bold">1,242</div>
          </div>
          <button className="rounded-2xl px-4 py-3 w-full text-white hover:opacity-90 transition-opacity" style={{ background: colors.plum }}>
            Join Society
          </button>
          <button className="rounded-2xl px-4 py-3 w-full hover:bg-mist/80 transition-colors" style={{ background: colors.mist }}>
            Like recent posts
          </button>
        </div>
      </div>
    </Card>
  );
}

function QuizPage() {
  return (
    <Card title="Matchmaking Quiz" subtitle="Answer a few quick questions to personalize your recommendations.">
      <div className="space-y-4">
        <QBlock q="Which activities interest you most?" opts={["Tech & Coding", "Outdoors", "Arts & Culture", "Entrepreneurship"]} />
        <QBlock q="When are you usually available?" opts={["Weekdays", "Evenings", "Weekends", "Flexible"]} />
        <QBlock q="Preferred group size?" opts={["Small (<20)", "Medium (20-50)", "Large (50+)"]} />
        <div className="flex gap-2">
          <button className="rounded-2xl px-4 py-2 hover:bg-mist/80 transition-colors" style={{ background: colors.mist }}>Save draft</button>
          <button className="rounded-2xl px-4 py-2 text-white hover:opacity-90 transition-opacity" style={{ background: colors.plum }}>Get matches</button>
        </div>
      </div>
    </Card>
  );
}

function NotificationsPage() {
  return (
    <Card title="Notifications" subtitle="Your latest alerts and updates.">
      <ul className="space-y-2">
        <Notice text="You have 3 new society matches" time="2h ago" />
        <Notice text="AI & Robotics posted a new event" time="Yesterday" />
        <Notice text="Hiking & Nature Club liked your comment" time="2 days ago" />
      </ul>
    </Card>
  );
}

function EventsPage() {
  return (
    <Card title="Upcoming Events" subtitle="Browse and RSVP.">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockEvents.map((e) => (
          <div key={e.id} className="rounded-3xl p-4 space-y-2"
            style={{ background: "white", border: `1px solid ${colors.mist}` }}
          >
            <div className="rounded-xl px-3 py-1 inline-block text-xs text-white" style={{ background: colors.lilac }}>{e.date}</div>
            <div className="font-semibold">{e.title}</div>
            <div className="text-xs opacity-70">{e.time} • {e.location}</div>
            <button className="rounded-2xl px-3 py-2 w-full text-white hover:opacity-90 transition-opacity" style={{ background: colors.plum }}>{e.rsvp ? "Going" : "RSVP"}</button>
          </div>
        ))}
      </div>
    </Card>
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

function Notice({ text, time }) {
  return (
    <li className="p-3 rounded-2xl flex items-center gap-3" style={{ background: colors.paper }}>
      <Bell size={18} className="text-plum flex-shrink-0" /> {/* Added flex-shrink-0 here */}
      <div className="flex-1">
        <div className="text-sm">{text}</div>
        <div className="text-xs opacity-60">{time}</div>
      </div>
      <button className="rounded-xl px-3 py-1 text-sm hover:bg-mist/80 transition-colors flex-shrink-0" style={{ background: colors.mist }}>Mark read</button>
    </li>
  );
}

// Original App component, renamed to StudentDashboardApp
function StudentDashboardApp() {
  const [page, setPage] = useState("dashboard");

  return (
    <Shell page={page} setPage={setPage}>
      {page === "dashboard" && <DashboardPage />}
      {page === "profile" && <ProfilePage />}
      {page === "explore" && <ExplorePage />}
      {page === "details" && <SocietyDetailsPage />}
      {page === "quiz" && <QuizPage />}
      {page === "notifications" && <NotificationsPage />}
      {page === "events" && <EventsPage />}
    </Shell>
  );
}

// The new default exported App component
export default function App() {
  return <StudentDashboardApp />;
}
