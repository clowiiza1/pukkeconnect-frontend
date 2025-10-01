import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
//=====MOCK IMAGES FOR MEMBERS ======//
import photo1 from "@/assets/photo1.jpg";
import photo2 from "@/assets/photo2.jpg";
import photo3 from "@/assets/photo3.jpg";
import aws from "@/assets/aws.jpeg";
// Society Admin Services
import {
  getSocietyDetails,
  updateSociety,
  getSocietyMembers,
  updateMembershipStatus,
  getSocietyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  cancelEvent,
  getEventRsvps,
  getSocietyPosts,
  createPost,
  updatePost,
  deletePost,
  getMySociety
} from "@/services/societyAdmin";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  ShieldCheck,
  Settings,
  Plus,
  Check,
  X,
  Eye,
  Search,
  Heart,
  MessageCircle,
  ChevronRight,
  Menu,
  Download,
  ArrowLeft,
  BarChart3,
  Trash2,
  Edit3,
  Share2,
  ImagePlus,
  CheckCircle,
  PauseCircle,
  XCircle,
  MapPin,
} from "lucide-react";


// Brand palette (aligns with student dashboard)
const colors = {
  paper: "#e7e7e7",
  mist: "#d2d3de",
  lilac: "#ac98cd",
  plum: "#6a509b",
};

// Reusable UI
function Card({ title, subtitle, action, children }) {
  return (
    <div
      className="rounded-3xl p-4 md:p-5 shadow-sm"
      style={{ background: "white", border: `1px solid ${colors.mist}` }}
    >
      {(title || subtitle || action) && (
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
      )}
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

// Confirmation Modal Component
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", confirmColor = "red" }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-xl"
          style={{ border: `1px solid ${colors.mist}` }}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.plum }}>
            {title}
          </h3>
          <p className="text-gray-600 mb-6">{message}</p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-medium transition-colors hover:bg-gray-100"
              style={{ color: colors.plum }}
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-xl font-medium text-white transition-colors ${
                confirmColor === 'red' ? 'bg-red-600 hover:bg-red-700' :
                confirmColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
                'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Mock data
const mockStats = { members: 248, pending: 7, events: 3, posts: 12 };

const mockMembers = [
  { id: 1, name: "Ayesha Khan", role: "President", email: "ayesha@email.com", phone: "(229) 555-0109", joinDate: "7/27/21", image: photo1 },
  { id: 2, name: "Liam Smith", role: "Treasurer", email: "liam@email.com", phone: "(404) 555-0120", joinDate: "10/28/20", image: photo2 },
  { id: 3, name: "Zinhle Mokoena", role: "Member", email: "zinhle@email.com", phone: "(684) 555-0102", joinDate: "9/14/22", image: photo3 },
  { id: 4, name: "Carlos Diaz", role: "Member", email: "carlos@email.com", phone: "(229) 555-0111", joinDate: "1/15/23", image: photo1 },
];


const mockEvents = [
  { id: 101, title: "Intro to ML Workshop", date: "Sep 12, 2025", time: "16:00", location: "Lab A", rsvp: 52 },
  { id: 102, title: "Robotics Build Night", date: "Sep 19, 2025", time: "18:30", location: "Makerspace", rsvp: 34 },
  { id: 103, title: "AI Ethics Roundtable", date: "Sep 28, 2025", time: "15:00", location: "Room 2.14", rsvp: 21 },
];

const mockPosts = [
  {
    id: 201,
    title: "Upcoming AI Event 🚀",
    description: "Join us for an exciting AI & Robotics event hosted by Tech Innovators Society. Expect demos, guest speakers, and networking!",
    image: photo1,
    status: "Published",
    date: "2025-09-01 14:30",
    likes: 12,
    comments: [
      { id: 1, name: "Ayesha", text: "This looks amazing!" },
      { id: 2, name: "Carlos", text: "Count me in 👏" },
    ],
  },
  {
    id: 202,
    title: "AWS Summit Johannesburg",
    description: "Our society had an amazing time attending the AWS Summit in Johannesburg. Learned so much about cloud & AI!",
    image: aws,
    status: "Published",
    date: "2025-08-25 10:00",
    likes: 8,
    comments: [
      { id: 1, name: "Zinhle", text: "Wish I could’ve joined!" },
    ],
  },
  {
    id: 203,
    title: "AI and Jobs 🤖",
    description: "Do you think AI will take over most tech jobs in the next decade? Share your thoughts below!",
    image: null,
    status: "Draft",
    date: "2025-08-15 18:45",
    likes: 3,
    comments: [],
  },
];

const mockActivity = [
  { id: 401, text: "Approved join request from Naledi", time: "2h ago" },
  { id: 402, text: "Published: Photos from last build!", time: "Yesterday" },
  { id: 403, text: "Updated event: Robotics Build Night", time: "2 days ago" },
];

const mockParticipation = [
  { label: "Event attendance", value: 72 },
  { label: "Weekly post rate", value: 65 },
  { label: "Member retention", value: 88 },
  { label: "Comment activity", value: 54 },
];

// Layout shell (light, like student dashboard)
function Shell({ page, setPage, children }) {
  const [open, setOpen] = useState(true);
  const [societyData, setSocietyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Get user from AuthContext

  const nav = [
    { key: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { key: "members", label: "Members", icon: <Users size={18} /> },
    { key: "events", label: "Events", icon: <CalendarDays size={18} /> },
    { key: "posts", label: "Posts", icon: <FileText size={18} /> },
    { key: "posts-detailed", label: "Posts (Advanced)", icon: <FileText size={18} /> },
    { key: "requests", label: "Requests", icon: <ShieldCheck size={18} /> },
    { key: "messages", label: "Messages", icon: <MessageCircle size={18} /> }, // Added Messages
    { key: "settings", label: "Settings", icon: <Settings size={18} /> },
    { key: "metrics", label: "Metrics", icon: <BarChart3 size={18} /> },
  ];

  // Load society data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get society data
        const society = await getMySociety();
        setSocietyData(society);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);


  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: `linear-gradient(to bottom, ${colors.plum} 0%, white 100%)` }}
    >
      {/* Topbar */}
      <div
        className="sticky top-0 z-40 bg-white"
        style={{
          borderBottom: `1px solid ${colors.mist}`,
        }}
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
            className="flex items-center gap-2 rounded-xl px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-mediumpur/70"
          >
            <img
              src="src/assets/icon1.png"
              alt="PukkeConnect Logo"
              className="size-10 rounded-xl object-contain flex-shrink-0"
            />
            <span className="hidden md:flex flex-col leading-tight font-semibold" style={{ color: colors.plum }}>
              PukkeConnect
              <span className="text-xs font-medium" style={{ color: colors.plum }}>
                Society Admin
              </span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-[360px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
              <input
                placeholder="Search members, events, posts"
                className="w-full rounded-2xl pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-lilac"
                style={{ background: colors.mist, color: "#111" }}
              />
            </div>
            <button
              className="rounded-2xl px-3 py-2 text-white hidden md:block hover:opacity-90 transition-opacity"
              style={{ background: colors.plum }}
            >
              New Event
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl py-6 grid grid-cols-12 gap-6 px-4 md:px-6 lg:px-8">
      

     
      {/* Sidebar */}
        <aside className={`col-span-12 md:col-span-3 lg:col-span-2 ${open ? "block" : "hidden md:block"} md:ml-[-1rem]`}>
          <div 
            className="rounded-3xl p-3 sticky top-20 flex flex-col min-h-[85vh]"
            style={{ 
              background: "white", 
              border: `1px solid ${colors.mist}`,
              marginLeft: '-0.5rem'
            }}
          >
            <nav className="space-y-1 flex-1">
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
                  {/* truncate to the span for text overflow handling */}
                  <span className="text-sm font-medium truncate">{item.label}</span>
                  {/* flex-shrink-0 to ChevronRight as well */}
                  {page === item.key && <ChevronRight className="ml-auto flex-shrink-0" size={16} />}
                </button>
              ))}
            </nav>

            <div className="mt-4 p-3 rounded-2xl" style={{ background: colors.mist }}>
              {loading ? (
                <div className="text-xs text-gray-500">Loading...</div>
              ) : (
                <>
                  <div className="text-xs opacity-70 mb-1">Managing</div>
                  <div className="text-sm font-semibold truncate" title={societyData?.name}>
                    {societyData?.name || 'AI & Robotics Society'}
                  </div>
                  <div className="text-xs opacity-70 mt-2">Admin</div>
                  <div className="text-xs font-medium">
                    {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                  </div>
                  <div className="text-xs opacity-70">
                    {user?.universityNumber || 'N/A'}
                  </div>
                </>
              )}
            </div>

            {/* Logout Button - Positioned at the bottom */}
            <div className="mt-auto pt-4">
              <button
                onClick={() => console.log("Logging out...")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-left transition text-gray-800 hover:bg-mist"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12H3m12-6l6 6-6 6"
                  />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </button>
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

// Overiew Pages
function OverviewPage() {
  return (
    <>
      <Card title="Overview" subtitle="Quick stats for your society.">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-2xl p-4" style={{ background: colors.lilac }}>
            <div className="text-white/90 text-sm">Members</div>
            <div className="text-3xl font-bold text-white">{mockStats.members}</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: colors.plum }}>
            <div className="text-white/90 text-sm">Pending Requests</div>
            <div className="text-3xl font-bold text-white">{mockStats.pending}</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: colors.mist }}>
            <div className="text-sm">Upcoming Events</div>
            <div className="text-3xl font-bold">{mockStats.events}</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: colors.paper }}>
            <div className="text-sm">Posts</div>
            <div className="text-3xl font-bold">{mockStats.posts}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Upcoming events"
          subtitle="Manage RSVPs and details"
          action={
            <button className="text-sm rounded-xl px-3 py-1 text-white hover:opacity-90 transition-opacity" style={{ background: colors.plum }}>
              <Plus size={16} className="inline mr-1" /> New event
            </button>
          }
        >
          <div className="space-y-3">
            {mockEvents.map((e) => (
              <div key={e.id} className="p-3 rounded-2xl flex items-center justify-between gap-3" style={{ background: colors.paper }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-xl px-3 py-2 text-sm font-semibold text-white flex-shrink-0" style={{ background: colors.lilac }}>
                    {e.date}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{e.title}</div>
                    <div className="text-xs opacity-70">{e.time} • {e.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Pill>{e.rsvp} going</Pill>
                  <button className="rounded-xl px-3 py-1 text-sm hover:bg-mist/80 transition-colors" style={{ background: colors.mist }}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent posts" subtitle="Drafts, scheduled, and published">
          <div className="space-y-3">
            {mockPosts.map((p) => (
              <div key={p.id} className="p-3 rounded-2xl flex items-center justify-between gap-3" style={{ background: colors.paper }}>
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs opacity-70">Status: {p.status}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="rounded-xl px-3 py-1 text-sm hover:bg-mist/80 transition-colors flex items-center gap-1" style={{ background: colors.mist }}><Edit3 size={14} /> Edit</button>
                  <button className="rounded-xl px-3 py-1 text-sm text-white hover:opacity-90 transition-opacity" style={{ background: colors.plum }}>Publish</button>
                  <button className="rounded-xl px-3 py-1 text-sm hover:bg-mist/80 transition-colors flex items-center gap-1" style={{ background: colors.mist }}><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Recent activity" subtitle="Latest actions across your society">
        <ul className="space-y-2">
          {mockActivity.map((a) => (
            <li key={a.id} className="p-3 rounded-2xl flex items-center justify-between" style={{ background: colors.paper }}>
              <span className="text-sm">{a.text}</span>
              <span className="text-xs opacity-60">{a.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}


//=======Members Page=====//
function MembersPage() {
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const societyId = "1001"; // TODO: Get from auth context
  const [societyName, setSocietyName] = useState("");

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Confirm",
    confirmColor: "red"
  });

  // Load members and society details from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch society details and members in parallel
        const [societyData, membersData] = await Promise.all([
          getSocietyDetails(societyId),
          getSocietyMembers(societyId)
        ]);

        // Set society name
        setSocietyName(societyData.name || societyData.society_name || "");

        // Transform backend data to match frontend structure
        const transformedMembers = membersData.map(member => ({
          id: member.studentId || member.student_id,
          universityNumber: member.universityNumber || member.university_number || "",
          name: `${member.firstName || member.first_name || ""} ${member.lastName || member.last_name || ""}`.trim(),
          role: "Member", // Default role as requested
          email: member.email || "",
          phone: member.phoneNumber || member.phone_number || "",
          joinDate: member.joinDate || member.join_date
            ? new Date(member.joinDate || member.join_date).toLocaleDateString('en-US', {
                year: '2-digit',
                month: 'numeric',
                day: 'numeric'
              })
            : "",
          image: null, // Placeholder for future photo integration
          status: member.status || "active"
        }));

        setMembers(transformedMembers);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [societyId]);

  const filteredMembers = members.filter((m) => {
    const searchTerm = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(searchTerm) ||
      m.role.toLowerCase().includes(searchTerm) ||
      m.joinDate.toLowerCase().includes(searchTerm) ||
      (m.status && m.status.toLowerCase().includes(searchTerm)) ||
      m.email.toLowerCase().includes(searchTerm) ||
      m.phone.toLowerCase().includes(searchTerm)
    );
  });

  // Bulk Actions Functions
  const handleMemberSelect = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(member => member.id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkDelete = async () => {
    if (selectedMembers.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: "Suspend Members",
      message: `Are you sure you want to suspend ${selectedMembers.length} selected member(s)?`,
      confirmText: "Suspend",
      confirmColor: "red",
      onConfirm: async () => {
        try {
          // Update each member's status to suspended
          await Promise.all(
            selectedMembers.map(memberId =>
              updateMembershipStatus(societyId, memberId, "suspended")
            )
          );

          // Update local state
          setMembers(members.map(member =>
            selectedMembers.includes(member.id)
              ? { ...member, status: "suspended" }
              : member
          ));

          setSelectedMembers([]);
          setSelectAll(false);
          console.log(`${selectedMembers.length} members suspended`);
        } catch (error) {
          console.error("Error suspending members:", error);
          alert("Failed to suspend members. Please try again.");
        }
      }
    });
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedMembers.length === 0) return;

    try {
      // Update each member's status via API
      await Promise.all(
        selectedMembers.map(memberId =>
          updateMembershipStatus(societyId, memberId, newStatus)
        )
      );

      // Update local state
      setMembers(members.map(member =>
        selectedMembers.includes(member.id)
          ? { ...member, status: newStatus }
          : member
      ));

      console.log(`${selectedMembers.length} members status updated to ${newStatus}`);
      setSelectedMembers([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error updating member status:", error);
      alert("Failed to update member status. Please try again.");
    }
  };

  const handleExportSelected = () => {
    if (selectedMembers.length === 0) return;

    const selectedMembersData = members.filter(m => selectedMembers.includes(m.id));
    const headers = ['Name', 'Role', 'Email', 'Phone', 'Join Date', 'Status'];
    const data = selectedMembersData.map(member => [
      member.name,
      member.role,
      member.email,
      member.phone,
      member.joinDate,
      member.status || 'active'
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `selected-members-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`${selectedMembers.length} selected members exported - Audit log recorded`);
  };

  const handleSuspendMember = async (memberId) => {
    setConfirmModal({
      isOpen: true,
      title: "Suspend Member",
      message: "Are you sure you want to suspend this member?",
      confirmText: "Suspend",
      confirmColor: "red",
      onConfirm: async () => {
        try {
          await updateMembershipStatus(societyId, memberId, "suspended");

          // Update local state
          setMembers(members.map(member =>
            member.id === memberId
              ? { ...member, status: "suspended" }
              : member
          ));
          setSelectedMembers(prev => prev.filter(id => id !== memberId));

          // If viewing this member's details, update selected member
          if (selectedMember && selectedMember.id === memberId) {
            setSelectedMember({ ...selectedMember, status: "suspended" });
          }

          console.log(`Member ${memberId} suspended`);
        } catch (error) {
          console.error("Error suspending member:", error);
          alert("Failed to suspend member. Please try again.");
        }
      }
    });
  };

  const handleApproveMember = async (memberId) => {
    try {
      await updateMembershipStatus(societyId, memberId, "active");

      // Update local state
      setMembers(members.map(member =>
        member.id === memberId
          ? { ...member, status: "active" }
          : member
      ));

      // Update selected member if viewing details
      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember({ ...selectedMember, status: "active" });
      }

      console.log(`Member ${memberId} approved`);
    } catch (error) {
      console.error("Error approving member:", error);
      alert("Failed to approve member. Please try again.");
    }
  };

  const handleRejectMember = async (memberId) => {
    setConfirmModal({
      isOpen: true,
      title: "Reject Membership",
      message: "Are you sure you want to reject this membership request?",
      confirmText: "Reject",
      confirmColor: "red",
      onConfirm: async () => {
        try {
          await updateMembershipStatus(societyId, memberId, "rejected");

          // Update local state
          setMembers(members.map(member =>
            member.id === memberId
              ? { ...member, status: "rejected" }
              : member
          ));

          // Update selected member if viewing details
          if (selectedMember && selectedMember.id === memberId) {
            setSelectedMember({ ...selectedMember, status: "rejected" });
          }

          console.log(`Member ${memberId} rejected`);
        } catch (error) {
          console.error("Error rejecting member:", error);
          alert("Failed to reject member. Please try again.");
        }
      }
    });
  };

  const handleViewMemberDetails = (member) => {
    setSelectedMember(member);
    setViewMode('details');
    console.log(`Member ${member.id} details viewed - Audit log recorded`);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedMember(null);
  };

  const handleDownloadExcel = () => {
    const headers = ['Name', 'Role', 'Email', 'Phone', 'Join Date', 'Status'];
    const data = members.map(member => [
      member.name,
      member.role,
      member.email,
      member.phone,
      member.joinDate,
      member.status || 'active'
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'members.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Member list downloaded - Audit log recorded');
  };

  // Member Details View
  if (viewMode === 'details' && selectedMember) {
    return (
      <Card
        title="Member Details"
        subtitle={`Viewing details for ${selectedMember.name}`}
      >
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-mediumpur hover:text-mediumpur/80 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Member List
          </button>

          {/* Member Profile Header */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            {selectedMember.image ? (
              <img
                src={selectedMember.image}
                alt={selectedMember.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-mediumpur/20 flex items-center justify-center">
                <span className="text-2xl font-medium text-mediumpur">
                  {selectedMember.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{selectedMember.name}</h2>
              <p className="text-gray-600">{selectedMember.role}</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                selectedMember.status === 'approved' ? 'bg-green-100 text-green-800' :
                selectedMember.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                selectedMember.status === 'rejected' ? 'bg-red-100 text-red-800' :
                selectedMember.status === 'suspended' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedMember.status || 'active'}
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-gray-600 w-24 flex-shrink-0">Email:</span>
                  <span className="text-gray-900 font-medium">{selectedMember.email || 'Not provided'}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-600 w-24 flex-shrink-0">Phone:</span>
                  <span className="text-gray-900 font-medium">{selectedMember.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-600 w-24 flex-shrink-0">Joined:</span>
                  <span className="text-gray-900 font-medium">{selectedMember.joinDate || 'Unknown'}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-600 w-24 flex-shrink-0">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedMember.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedMember.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedMember.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    selectedMember.status === 'suspended' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedMember.status || 'active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Information */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-3">Membership Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <span className="text-gray-600 w-32 flex-shrink-0">Member Since:</span>
                  <span className="text-gray-900">{selectedMember.joinDate || 'Unknown'}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-600 w-32 flex-shrink-0">Role:</span>
                  <span className="text-gray-900">{selectedMember.role || 'Member'}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-600 w-32 flex-shrink-0">University Number:</span>
                  <span className="text-gray-900 font-mono text-sm">{selectedMember.universityNumber || 'Not available'}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 italic">
                  Activity tracking coming soon - will show events attended, posts created, and engagement metrics.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {selectedMember.status === 'pending' && (
              <>
                <button
                  onClick={() => handleApproveMember(selectedMember.id)}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <CheckCircle size={16} />
                  Approve Membership
                </button>
                <button
                  onClick={() => handleRejectMember(selectedMember.id)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-600"
                >
                  <XCircle size={16} />
                  Reject Request
                </button>
              </>
            )}
            {selectedMember.status !== 'pending' && selectedMember.status !== 'suspended' && (
              <button
                onClick={() => handleSuspendMember(selectedMember.id)}
                className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-orange-600"
              >
                <PauseCircle size={16} />
                Suspend Member
              </button>
            )}
            {selectedMember.status === 'suspended' && (
              <button
                onClick={() => handleApproveMember(selectedMember.id)}
                className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <CheckCircle size={16} />
                Reactivate Member
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card
        title="Members"
        subtitle="Manage member accounts and view member details"
      >
        <div className="space-y-4 animate-pulse">
          <div className="h-12 rounded-2xl" style={{ background: colors.paper }}></div>
          <div className="h-64 rounded-2xl" style={{ background: colors.paper }}></div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card
        title="Members"
        subtitle="Manage member accounts and view member details"
      >
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading Members</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-mediumpur text-white px-4 py-2 rounded-lg hover:bg-mediumpur/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  // Main Member List View
  return (
    <Card
      title={societyName ? `Members - ${societyName}` : "Members"}
      subtitle="Manage member accounts and view member details"
    >
      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, role, join date, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 outline-none placeholder:text-sm focus:ring-1 focus:ring-lilac text-sm"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Download size={16} />
            Export All
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedMembers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="text-blue-800 text-sm font-medium">
              {selectedMembers.length} member(s) selected
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleExportSelected}
                className="flex items-center gap-2 px-3 py-1.5 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                <Download size={14} />
                Export Selected
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('approved')}
                className="flex items-center gap-2 px-3 py-1.5 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                <CheckCircle size={14} />
                Approve
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('suspended')}
                className="flex items-center gap-2 px-3 py-1.5 text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors text-sm"
              >
                <PauseCircle size={14} />
                Suspend
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('rejected')}
                className="flex items-center gap-2 px-3 py-1.5 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                <XCircle size={14} />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredMembers.length} of {members.length} members
      </div>

      {/* Alternative Flow 2a: No members state */}
      {members.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="text-lg font-medium text-gray-900 mb-2">No members yet</div>
          <p className="text-gray-600 mb-4">Get started by inviting members or approving join requests</p>
          <div className="flex gap-3 justify-center">
            <button className="bg-mediumpur text-white px-4 py-2 rounded-lg hover:bg-mediumpur/90 transition-colors text-sm">
              Invite Members
            </button>
            <button className="border border-mediumpur text-mediumpur px-4 py-2 rounded-lg hover:bg-mediumpur/10 transition-colors text-sm">
              View Join Requests
            </button>
          </div>
        </div>
      ) : (
        /* Main Flow: Member List Table */
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-mediumpur focus:ring-mediumpur w-4 h-4"
                  />
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Member name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Join Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => (
                <tr 
                  key={member.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    index % 2 === 0 ? 'bg-gray-25' : 'bg-white'
                  }`}
                  onClick={() => handleViewMemberDetails(member)}
                >
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => handleMemberSelect(member.id)}
                      className="rounded border-gray-300 text-mediumpur focus:ring-mediumpur w-4 h-4"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-mediumpur/20 flex items-center justify-center">
                          <span className="text-xs font-medium text-mediumpur">
                            {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{member.phone}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{member.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'approved' ? 'bg-green-100 text-green-800' :
                      member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      member.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      member.status === 'suspended' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {member.status || 'active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{member.joinDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleViewMemberDetails(member)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>
                      {member.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveMember(member.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve membership"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => handleRejectMember(member.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject membership"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      {member.status !== 'pending' && member.status !== 'suspended' && (
                        <button
                          onClick={() => handleSuspendMember(member.id)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Suspend member"
                        >
                          <PauseCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty Search Results */}
          {filteredMembers.length === 0 && members.length > 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-sm font-medium mb-2">No members found</div>
              <p className="text-xs">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
      />
    </Card>
  );
}


//====== Events Page =====//
function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [originalEvent, setOriginalEvent] = useState(null); // Track original values
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpList, setRsvpList] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const societyId = "1001"; // TODO: Get from auth context
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "", // Duration in hours
    location: "",
    maxAttendees: "",
    category: "Workshop"
  });

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Confirm",
    confirmColor: "red"
  });

  // Load events from API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getSocietyEvents(societyId);
        console.log("Events API response:", response);
        console.log("Response type:", typeof response);
        console.log("Is array?", Array.isArray(response));

        // Handle if response is wrapped in data property
        const eventsData = Array.isArray(response) ? response : (response?.data || response?.events || []);
        console.log("Events data to transform:", eventsData);

        if (!Array.isArray(eventsData)) {
          console.error("Events data is not an array:", eventsData);
          setEvents([]);
          setFilteredEvents([]);
          return;
        }

        // Transform backend data to match frontend structure
        const transformedEvents = eventsData.map(event => {
          console.log("Transforming event:", event);
          return {
            id: event.eventId || event.id || event.event_id,
            title: event.title,
            description: event.description,
            date: event.startsAt || event.starts_at
              ? new Date(event.startsAt || event.starts_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : "",
            time: event.startsAt || event.starts_at
              ? new Date(event.startsAt || event.starts_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : "",
            location: event.location || "",
            rsvp: event.rsvps || event.rsvpCount || event.rsvp_count || 0,
            capacity: event.capacity,
            startsAt: event.startsAt || event.starts_at,
            endsAt: event.endsAt || event.ends_at,
            status: event.status || 'scheduled',
            rsvpList: [] // Will be loaded on demand
          };
        });

        console.log("Transformed events:", transformedEvents);
        setEvents(transformedEvents);
        setFilteredEvents(transformedEvents);
      } catch (err) {
        console.error("Error loading events:", err);
        setError("Failed to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [societyId]);

  // Load RSVP data when an event is selected
  useEffect(() => {
    const loadRsvpData = async () => {
      if (selectedEvent && selectedEvent.id) {
        try {
          const rsvpData = await getEventRsvps(selectedEvent.id);

          // Update the selected event with RSVP list
          setSelectedEvent(prev => ({
            ...prev,
            rsvpList: rsvpData.map(rsvp => ({
              name: `${rsvp.firstName || rsvp.first_name || ''} ${rsvp.lastName || rsvp.last_name || ''}`.trim(),
              email: rsvp.email || '',
              studentId: rsvp.universityNumber || rsvp.university_number || rsvp.studentId || rsvp.student_id,
              rsvpDate: rsvp.createdAt || rsvp.created_at
                ? new Date(rsvp.createdAt || rsvp.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : ""
            }))
          }));
        } catch (error) {
          console.error("Error loading RSVP data:", error);
        }
      }
    };

    loadRsvpData();
  }, [selectedEvent?.id]);

  // Filter events based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [searchQuery, events]);

  // Handle input changes for both create and edit forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingEvent) {
      setEditingEvent(prev => ({ ...prev, [name]: value }));
    } else {
      setNewEvent(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Handle image upload with preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert("Please upload a valid image file (PNG, JPG, JPEG)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingEvent) {
          setEditingEvent(prev => ({
            ...prev,
            poster: file,
            posterPreview: reader.result
          }));
        } else {
          setNewEvent(prev => ({
            ...prev,
            poster: file,
            posterPreview: reader.result
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate event data (Main Flow step 3 / Alternative Flow 2a)
  const validateEvent = (event) => {
    const errors = {};

    if (!event.title?.trim()) {
      errors.title = "Event title is required";
    }

    if (!event.description?.trim()) {
      errors.description = "Event description is required";
    }

    if (!event.date) {
      errors.date = "Event date is required";
    } else if (new Date(event.date) < new Date().setHours(0, 0, 0, 0)) {
      errors.date = "Event date cannot be in the past";
    }

    if (!event.time) {
      errors.time = "Event time is required";
    }

    if (!event.location?.trim()) {
      errors.location = "Event location is required";
    }

    if (event.maxAttendees && (event.maxAttendees < 1 || event.maxAttendees > 1000)) {
      errors.maxAttendees = "Maximum attendees must be between 1 and 1000";
    }

    return errors;
  };

  // Create new event (Main Flow steps 1-3)
  const handleCreateEvent = async () => {
    const errors = validateEvent(newEvent);
    if (Object.keys(errors).length > 0) {
      // Show validation errors
      alert("Please fix the following errors:\n" + Object.values(errors).join('\n'));
      return;
    }

    try {
      // Combine date and time into ISO string
      const dateTimeString = `${newEvent.date}T${newEvent.time}`;
      const startsAt = new Date(dateTimeString);

      // Calculate end time based on duration
      let endsAt = null;
      if (newEvent.duration) {
        const durationHours = parseFloat(newEvent.duration);
        endsAt = new Date(startsAt.getTime() + durationHours * 60 * 60 * 1000);
      }

      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt ? endsAt.toISOString() : null,
        location: newEvent.location,
        capacity: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : null
      };

      const createdEvent = await createEvent(societyId, eventData);

      // Transform and add to local state
      const transformedEvent = {
        id: createdEvent.eventId || createdEvent.id || createdEvent.event_id,
        title: createdEvent.title,
        description: createdEvent.description,
        date: new Date(createdEvent.startsAt || createdEvent.starts_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        time: new Date(createdEvent.startsAt || createdEvent.starts_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        location: createdEvent.location || "",
        rsvp: 0,
        capacity: createdEvent.capacity,
        startsAt: createdEvent.startsAt || createdEvent.starts_at,
        endsAt: createdEvent.endsAt || createdEvent.ends_at
      };

      setEvents(prev => [...prev, transformedEvent]);
      setIsCreating(false);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "",
        duration: "",
        location: "",
        maxAttendees: "",
        category: "Workshop"
      });
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    }
  };

  // Start editing an event
  const handleEdit = (event) => {
    console.log("Editing event:", event);

    // Extract date and time from startsAt
    const startsAt = new Date(event.startsAt);
    const date = startsAt.toISOString().split('T')[0];
    const time = startsAt.toTimeString().slice(0, 5);

    // Calculate duration if endsAt exists
    let duration = "";
    if (event.endsAt) {
      const endsAt = new Date(event.endsAt);
      const durationMs = endsAt - startsAt;
      const durationHours = durationMs / (1000 * 60 * 60);
      duration = durationHours.toString();
    }

    const editData = {
      ...event,
      date,
      time,
      duration,
      maxAttendees: event.capacity || ""
    };

    console.log("Edit data:", editData);
    setEditingEvent(editData);
    setOriginalEvent(editData); // Save original for comparison
  };

  // Save edited event
  const handleSaveEdit = async () => {
    const errors = validateEvent(editingEvent);
    if (Object.keys(errors).length > 0) {
      alert("Please fix the following errors:\n" + Object.values(errors).join('\n'));
      return;
    }

    try {
      console.log("Saving event with ID:", editingEvent.id);
      console.log("Full editing event:", editingEvent);

      // Combine date and time into ISO string
      const dateTimeString = `${editingEvent.date}T${editingEvent.time}`;
      const startsAt = new Date(dateTimeString);

      // Calculate end time based on duration
      let endsAt = null;
      if (editingEvent.duration) {
        const durationHours = parseFloat(editingEvent.duration);
        endsAt = new Date(startsAt.getTime() + durationHours * 60 * 60 * 1000);
      }

      const eventData = {
        title: editingEvent.title,
        description: editingEvent.description,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt ? endsAt.toISOString() : null,
        location: editingEvent.location,
        capacity: editingEvent.maxAttendees ? parseInt(editingEvent.maxAttendees) : editingEvent.capacity
      };

      console.log("Event data to update:", eventData);
      const updatedEvent = await updateEvent(editingEvent.id, eventData);

      // Transform and update local state
      const transformedEvent = {
        id: updatedEvent.eventId || updatedEvent.id || updatedEvent.event_id,
        title: updatedEvent.title,
        description: updatedEvent.description,
        date: new Date(updatedEvent.startsAt || updatedEvent.starts_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        time: new Date(updatedEvent.startsAt || updatedEvent.starts_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        location: updatedEvent.location || "",
        rsvp: editingEvent.rsvp || 0,
        capacity: updatedEvent.capacity,
        startsAt: updatedEvent.startsAt || updatedEvent.starts_at,
        endsAt: updatedEvent.endsAt || updatedEvent.ends_at
      };

      setEvents(prev => prev.map(e => e.id === editingEvent.id ? transformedEvent : e));
      setEditingEvent(null);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Please try again.");
    }
  };

  // Delete event
  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Event",
      message: "Are you sure you want to delete this event? This action cannot be undone.",
      confirmText: "Delete",
      confirmColor: "red",
      onConfirm: async () => {
        try {
          await deleteEvent(id);
          setEvents(prev => prev.filter(e => e.id !== id));
        } catch (error) {
          console.error("Error deleting event:", error);
          alert("Failed to delete event. Please try again.");
        }
      }
    });
  };

  // Cancel event (Alternative Flow 4a)
  const handleCancelEvent = (eventId) => {
    setConfirmModal({
      isOpen: true,
      title: "Cancel Event",
      message: "Cancel this event? All RSVPs will be notified.",
      confirmText: "Cancel Event",
      confirmColor: "red",
      onConfirm: async () => {
        try {
          const result = await cancelEvent(eventId);

          // Update local state
          setEvents(prev => prev.map(e =>
            e.id === eventId
              ? { ...e, status: 'cancelled' }
              : e
          ));

          alert(`Event cancelled successfully. ${result.notifiedStudents} student(s) have been notified.`);
        } catch (error) {
          console.error("Error cancelling event:", error);
          alert("Failed to cancel event. Please try again.");
        }
      }
    });
  };

  // View RSVP list (Main Flow step 5)
  const handleViewRsvpList = (event) => {
    setSelectedEvent(event);
  };

  // Export RSVP list
  const handleExportRsvpList = (event) => {
    const headers = ['Name', 'Email', 'Student ID', 'RSVP Date'];
    const data = event.rsvpList?.map(rsvp => [
      rsvp.name,
      rsvp.email,
      rsvp.studentId,
      new Date(rsvp.rsvpDate).toLocaleDateString()
    ]) || [];

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rsvp-list-${event.title}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if event has been modified
  const hasEventChanged = () => {
    if (!editingEvent || !originalEvent) return false;

    return (
      editingEvent.title !== originalEvent.title ||
      editingEvent.description !== originalEvent.description ||
      editingEvent.date !== originalEvent.date ||
      editingEvent.time !== originalEvent.time ||
      editingEvent.duration !== originalEvent.duration ||
      editingEvent.location !== originalEvent.location ||
      editingEvent.maxAttendees !== originalEvent.maxAttendees ||
      editingEvent.category !== originalEvent.category
    );
  };

  // Cancel creation or editing
  const handleCancel = () => {
    setIsCreating(false);
    setEditingEvent(null);
    setOriginalEvent(null);
    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      duration: "",
      location: "",
      maxAttendees: "",
      category: "Workshop"
    });
  };

  // Check if event has passed
  const isEventPast = (event) => {
    const endTime = event.endsAt ? new Date(event.endsAt) : new Date(event.startsAt);
    return endTime < new Date();
  };

  // Get event status badge
  const getEventStatusBadge = (event) => {
    // Check if event has passed
    const isPast = isEventPast(event);

    const statusConfig = {
      upcoming: { color: 'bg-green-100 text-green-800', label: 'Upcoming' },
      past: { color: 'bg-gray-100 text-gray-800', label: 'Past' },
      ongoing: { color: 'bg-blue-100 text-blue-800', label: 'Ongoing' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      scheduled: { color: 'bg-green-100 text-green-800', label: 'Upcoming' }
    };

    // Determine status - prioritize cancelled status
    let status = event.status || 'upcoming';
    if (status === 'cancelled') {
      status = 'cancelled';
    } else if (!event.status || event.status === 'scheduled') {
      status = isPast ? 'past' : 'upcoming';
    }

    const config = statusConfig[status] || statusConfig.upcoming;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <Card title="Events Management" subtitle="Create, manage, and track event RSVPs">
      {/* Header with Search and Create Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex-1">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search events by name, description, or location..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white hover:opacity-90 transition whitespace-nowrap text-sm"
          style={{ background: colors.plum }}
        >
          <Plus size={18} />
          Create Event
        </button>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Found {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
          <button
            onClick={clearSearch}
            className="text-sm text-plum hover:underline flex items-center gap-1"
          >
            <X size={14} />
            Clear search
          </button>
        </div>
      )}

      {/* Events Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{events.length}</div>
          <div className="text-sm text-gray-600">Total Events</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {events.filter(e => !isEventPast(e) && e.status !== 'cancelled').length}
          </div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {events.reduce((total, event) => total + (event.rsvp || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total RSVPs</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">
            {events.filter(e => isEventPast(e)).length}
          </div>
          <div className="text-sm text-gray-600">Past</div>
        </div>
      </div>

      {/* Create Event Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Event</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event Poster Upload */}
              <div className="lg:col-span-1">
                <div className="text-sm font-medium mb-2">Event Poster</div>
                <div
                  className="w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-6 bg-gray-50"
                  style={{ borderColor: colors.mist }}
                >
                  <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-gray-500 text-sm font-medium">Coming Soon</span>
                  <span className="text-gray-400 text-xs mt-1">Photo upload functionality</span>
                </div>
              </div>

              {/* Event Details Form */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-sm font-medium mb-1">Event Name *</div>
                    <input
                      name="title"
                      value={newEvent.title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                      placeholder="AI & Robotics Workshop"
                    />
                  </label>

                  <label className="block">
                    <div className="text-sm font-medium mb-1">Category</div>
                    <select
                      name="category"
                      value={newEvent.category}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                    >
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Social">Social</option>
                      <option value="Competition">Competition</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <div className="text-sm font-medium mb-1">Description *</div>
                  <textarea
                    name="description"
                    value={newEvent.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                    placeholder="Describe your event details, agenda, and what attendees can expect..."
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-sm font-medium mb-1">Date *</div>
                    <input
                      type="date"
                      name="date"
                      value={newEvent.date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                    />
                  </label>

                  <label className="block">
                    <div className="text-sm font-medium mb-1">Start Time *</div>
                    <input
                      type="time"
                      name="time"
                      value={newEvent.time}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-sm font-medium mb-1">Duration (hours) *</div>
                    <input
                      type="number"
                      name="duration"
                      value={newEvent.duration}
                      onChange={handleInputChange}
                      min="0.5"
                      max="24"
                      step="0.5"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                      placeholder="e.g., 2"
                    />
                  </label>

                  <label className="block">
                    <div className="text-sm font-medium mb-1">Max Attendees</div>
                    <input
                      type="number"
                      name="maxAttendees"
                      value={newEvent.maxAttendees}
                      onChange={handleInputChange}
                      min="1"
                      max="1000"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                      placeholder="No limit"
                    />
                  </label>
                </div>

                <label className="block">
                  <div className="text-sm font-medium mb-1">Location *</div>
                  <input
                    name="location"
                    value={newEvent.location}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                    placeholder="Building Name, Room Number"
                  />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleCreateEvent}
                className="px-6 py-2 rounded-lg text-white hover:opacity-90 transition text-sm"
                style={{ background: colors.plum }}
              >
                Create Event
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Event</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event Poster Upload */}
              <div className="lg:col-span-1">
                <div className="text-sm font-medium mb-2">Event Poster</div>
                <div
                  className="w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-6 bg-gray-50"
                  style={{ borderColor: colors.mist }}
                >
                  <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-gray-500 text-sm font-medium">Coming Soon</span>
                  <span className="text-gray-400 text-xs mt-1">Photo upload functionality</span>
                </div>
              </div>

              {/* Event Details Form */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-sm font-medium mb-1">Event Name *</div>
                    <input
                      name="title"
                      value={editingEvent.title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                    />
                  </label>

                  <label className="block">
                    <div className="text-sm font-medium mb-1">Category</div>
                    <select
                      name="category"
                      value={editingEvent.category}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                    >
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Social">Social</option>
                      <option value="Competition">Competition</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <div className="text-sm font-medium mb-1">Description *</div>
                  <textarea
                    name="description"
                    value={editingEvent.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-sm font-medium mb-1">Date *</div>
                    <input
                      type="date"
                      name="date"
                      value={editingEvent.date}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                    />
                  </label>

                  <label className="block">
                    <div className="text-sm font-medium mb-1">Start Time *</div>
                    <input
                      type="time"
                      name="time"
                      value={editingEvent.time}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-sm font-medium mb-1">Duration (hours) *</div>
                    <input
                      type="number"
                      name="duration"
                      value={editingEvent.duration || ""}
                      onChange={handleInputChange}
                      min="0.5"
                      max="24"
                      step="0.5"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                      placeholder="e.g., 2"
                    />
                  </label>

                  <label className="block">
                    <div className="text-sm font-medium mb-1">Max Attendees</div>
                    <input
                      type="number"
                      name="maxAttendees"
                      value={editingEvent.maxAttendees}
                      onChange={handleInputChange}
                      min="1"
                      max="1000"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                    />
                  </label>
                </div>

                <label className="block">
                  <div className="text-sm font-medium mb-1">Location *</div>
                  <input
                    name="location"
                    value={editingEvent.location}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
                  />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveEdit}
                disabled={!hasEventChanged()}
                className={`px-6 py-2 rounded-lg text-white transition text-sm ${
                  hasEventChanged()
                    ? 'hover:opacity-90 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ background: colors.plum }}
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RSVP List Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">RSVP List - {selectedEvent.title}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                {selectedEvent.rsvpList?.length || 0} attendee(s) registered
                {selectedEvent.maxAttendees && ` (Max: ${selectedEvent.maxAttendees})`}
              </p>
              <button
                onClick={() => handleExportRsvpList(selectedEvent)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100 transition-colors"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>

            {selectedEvent.rsvpList && selectedEvent.rsvpList.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student ID</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">RSVP Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedEvent.rsvpList.map((rsvp, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{rsvp.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{rsvp.email}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{rsvp.studentId}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(rsvp.rsvpDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No RSVPs yet for this event</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="rounded-2xl p-4 space-y-4 bg-white border hover:shadow-lg transition-shadow"
            style={{ borderColor: colors.mist }}
          >
            {/* Event Poster */}
            {event.posterPreview && (
              <img
                src={event.posterPreview}
                alt={event.title}
                className="w-full h-48 object-cover rounded-xl"
              />
            )}
            
            {/* Event Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">{event.title}</div>
                {getEventStatusBadge(event)}
              </div>
              <div className="text-sm text-gray-600 line-clamp-2">{event.description}</div>
              <div className="text-xs opacity-70 flex items-center gap-1">
                <CalendarDays size={12} />
                {event.date} • {event.time}
              </div>
              <div className="text-xs opacity-70 flex items-center gap-1">
                <MapPin size={12} />
                {event.location}
              </div>
              {event.capacity && (
                <div className="text-xs text-gray-500">
                  Max attendees: {event.capacity}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => handleViewRsvpList(event)}
                className="rounded-lg px-3 py-1 text-sm hover:bg-mist/80 transition-colors flex items-center gap-1"
                style={{ background: colors.mist }}
              >
                <Users size={14} /> {event.rsvp || 0} RSVPs
              </button>
              <div className="flex gap-2">
                {!isEventPast(event) ? (
                  <>
                    <button
                      onClick={() => handleEdit(event)}
                      className="rounded-lg px-3 py-1 text-sm hover:bg-blue-100 transition-colors flex items-center gap-1 text-blue-600"
                      title="Edit Event"
                    >
                      <Edit3 size={14} />
                    </button>
                    {(!event.status || event.status === 'upcoming') && (
                      <button
                        onClick={() => handleCancelEvent(event.id)}
                        className="rounded-lg px-3 py-1 text-sm hover:bg-orange-100 transition-colors flex items-center gap-1 text-orange-600"
                        title="Cancel Event"
                      >
                        <XCircle size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="rounded-lg px-3 py-1 text-sm hover:bg-red-100 transition-colors flex items-center gap-1 text-red-600"
                      title="Delete Event"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-500 px-3 py-1">
                    Past events cannot be edited
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty States */}
      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-lg font-medium mb-2">No events yet</p>
          <p className="text-sm">Create your first event to get started!</p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-4 px-4 py-2 rounded-xl text-white hover:opacity-90 transition"
            style={{ background: colors.plum }}
          >
            Create First Event
          </button>
        </div>
      )}

      {events.length > 0 && filteredEvents.length === 0 && searchQuery && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-lg font-medium mb-2">No events found</p>
          <p className="text-sm">No events match your search for "{searchQuery}"</p>
          <button
            onClick={clearSearch}
            className="mt-4 px-4 py-2 rounded-xl text-plum hover:bg-mist/50 transition-colors"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
      />
    </Card>
  );
}

//====== Posts Page (Simplified - Backend Only) ======//
function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'create'
  const [selectedPost, setSelectedPost] = useState(null);
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [societyId, setSocietyId] = useState(null);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState(null);

  // Load society ID and posts from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get the current user's society
        const society = await getMySociety();
        setSocietyId(society.societyId);

        // Load posts for this society
        const response = await getSocietyPosts(society.societyId);
        const postsData = Array.isArray(response) ? response : (response?.data || []);
        setPosts(postsData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter posts by search
  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create or update post
  const handleSavePost = async (e) => {
    e.preventDefault();

    if (!postContent.trim()) {
      alert("Post content is required");
      return;
    }

    if (!societyId) {
      alert("Society information not loaded. Please refresh the page.");
      return;
    }

    setIsSubmitting(true);

    try {
      let savedPost;

      if (selectedPost) {
        // Update existing post
        savedPost = await updatePost(selectedPost.postId, { content: postContent });
        setPosts(posts.map(p => p.postId === savedPost.postId ? savedPost : p));
      } else {
        // Create new post
        savedPost = await createPost(societyId, { content: postContent });
        setPosts([savedPost, ...posts]);
      }

      // Reset form
      setPostContent('');
      setSelectedPost(null);
      setViewMode('list');
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit post
  const handleEditPost = (post) => {
    setSelectedPost(post);
    setPostContent(post.content);
    setViewMode('create');
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter(p => p.postId !== postId));
      setDeleteConfirmPost(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setPostContent('');
    setSelectedPost(null);
    setViewMode('list');
  };

  if (loading) {
    return (
      <Card title="Posts" subtitle="Loading posts...">
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Card>
    );
  }

  // Create/Edit View
  if (viewMode === 'create') {
    return (
      <Card
        title={selectedPost ? "Edit Post" : "Create Post"}
        subtitle={selectedPost ? "Update your post content" : "Share an update with your society members"}
      >
        <form onSubmit={handleSavePost} className="space-y-6">
          <label className="block">
            <div className="text-sm font-medium mb-2">Content *</div>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's happening in your society?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm min-h-[200px]"
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {postContent.length}/4000 characters
            </div>
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: colors.plum }}
            >
              {isSubmitting ? "Saving..." : (selectedPost ? "Update Post" : "Create Post")}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    );
  }

  // List View
  return (
    <Card title="Posts" subtitle="Share updates and announcements with your society">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-plum focus:ring-1 focus:ring-plum"
          />
        </div>

        {/* Create Button */}
        <button
          onClick={() => setViewMode('create')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors"
          style={{ backgroundColor: colors.plum }}
        >
          <Plus size={18} />
          Create Post
        </button>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredPosts.length} of {posts.length} posts
      </div>

      {/* Empty State */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No posts yet</h3>
          <p className="text-sm text-gray-600 mb-4">Create your first post to engage with your members</p>
          <button
            onClick={() => setViewMode('create')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: colors.plum }}
          >
            <Plus size={18} />
            Create Post
          </button>
        </div>
      ) : (
        /* Posts List */
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.postId}
              className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-900">
                    {post.author ? `${post.author.firstName} ${post.author.lastName}` : "Unknown Author"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditPost(post)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmPost(post)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div className="text-gray-700 whitespace-pre-wrap mb-3">
                {post.content}
              </div>

              {/* Post Stats */}
              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Heart size={16} />
                  <span>{post.likeCount || 0} likes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Search Results */}
      {filteredPosts.length === 0 && posts.length > 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-sm font-medium mb-2">No posts found</div>
          <p className="text-xs">Try adjusting your search terms</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Post</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmPost(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(deleteConfirmPost.postId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

//====== Posts Page (Detailed - For Future Use) ======//
function PostsPageDetailed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mockPosts] = useState([
    {
      id: 1,
      title: "Welcome to Tech Society!",
      content: "We're excited to announce our first meetup of the semester. Join us for an amazing session on web development and networking with fellow tech enthusiasts.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      author: "Admin User",
      createdAt: "2024-01-15T10:30:00Z",
      likes: 24,
      comments: [
        {
          id: 1,
          studentName: "Sarah Chen",
          studentAvatar: "👩‍💼",
          content: "Excited to join! What time does the meetup start?",
          createdAt: "2024-01-15T11:20:00Z",
          likes: 3
        },
        {
          id: 2,
          studentName: "Mike Johnson",
          studentAvatar: "👨‍💻",
          content: "Great initiative! Looking forward to learning web development with everyone.",
          createdAt: "2024-01-15T12:45:00Z",
          likes: 5
        },
        {
          id: 3,
          studentName: "Emily Davis",
          studentAvatar: "👩‍🎓",
          content: "Will there be any prerequisites for the session?",
          createdAt: "2024-01-15T14:30:00Z",
          likes: 2
        }
      ],
      views: 156,
      status: "published",
      type: "announcement"
    },
    {
      id: 2,
      title: "Upcoming Workshop: React Fundamentals",
      content: "Learn React from scratch in our hands-on workshop this Friday. Bring your laptops and get ready to code!",
      image: null,
      author: "Admin User",
      createdAt: "2024-01-12T14:20:00Z",
      likes: 18,
      comments: [
        {
          id: 1,
          studentName: "Alex Kim",
          studentAvatar: "👨‍🎨",
          content: "Perfect timing! I've been wanting to learn React.",
          createdAt: "2024-01-12T15:10:00Z",
          likes: 4
        },
        {
          id: 2,
          studentName: "Priya Patel",
          studentAvatar: "👩‍🔬",
          content: "What should we install before the workshop?",
          createdAt: "2024-01-12T16:45:00Z",
          likes: 1
        }
      ],
      views: 203,
      status: "published",
      type: "event"
    },
    {
      id: 3,
      title: "Member Spotlight: Sarah Chen",
      content: "This month we're featuring Sarah Chen, who recently built an amazing machine learning project...",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
      author: "Admin User",
      createdAt: "2024-01-10T09:15:00Z",
      likes: 32,
      comments: [
        {
          id: 1,
          studentName: "Sarah Chen",
          studentAvatar: "👩‍💼",
          content: "Thank you for featuring me! Happy to share my journey with the community.",
          createdAt: "2024-01-10T10:05:00Z",
          likes: 8
        },
        {
          id: 2,
          studentName: "David Lee",
          studentAvatar: "👨‍💼",
          content: "Inspiring work, Sarah! Could you share more about your project setup?",
          createdAt: "2024-01-10T11:30:00Z",
          likes: 3
        },
        {
          id: 3,
          studentName: "Maria Garcia",
          studentAvatar: "👩‍🏫",
          content: "This is amazing! How long did it take you to complete the project?",
          createdAt: "2024-01-10T13:15:00Z",
          likes: 2
        }
      ],
      views: 189,
      status: "published",
      type: "spotlight"
    }
  ]);

  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'comments'
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState(null);

  // Main Flow 1: Create Post Form State
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    image: null,
    type: 'announcement',
    status: 'draft'
  });

  // Load posts from API on mount
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const societyId = localStorage.getItem("societyId");

        if (!societyId) {
          console.error("No society ID found");
          setPosts(mockPosts); // Fallback to mock data
          return;
        }

        const response = await getSocietyPosts(societyId);
        const postsData = Array.isArray(response) ? response : (response?.data || []);

        // Transform backend data and merge with mock data structure
        const transformedPosts = postsData.map(post => ({
          id: post.postId || post.id,
          title: "Post", // Backend doesn't have title, use placeholder
          content: post.content,
          author: post.author ? `${post.author.firstName} ${post.author.lastName}` : "Unknown",
          createdAt: post.createdAt,
          likes: post.likeCount || 0,
          comments: [], // Backend doesn't return comments yet
          views: 0, // Not available in backend
          status: "published", // Static for now
          type: "announcement", // Static for now
          image: null, // Not available in backend
          postId: post.postId // Keep original ID for API calls
        }));

        setPosts(transformedPosts);
      } catch (err) {
        console.error("Error loading posts:", err);
        setPosts(mockPosts); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [mockPosts]);

  // Filtered posts based on search and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    const matchesType = filterType === 'all' || post.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle input changes and validation
  const handleInputChange = (field, value) => {
    setPostForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Content validation
  const validateContent = () => {
    const errors = [];
    
    if (!postForm.title.trim()) {
      errors.push('Title is required');
    }
    
    if (!postForm.content.trim()) {
      errors.push('Content is required');
    }
    
    if (postForm.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }
    
    if (postForm.content.length > 1000) {
      errors.push('Content must be less than 1000 characters');
    }
    
    // Check for inappropriate content (basic example)
    const inappropriateWords = ['spam', 'inappropriate', 'badword'];
    const content = postForm.title + ' ' + postForm.content;
    if (inappropriateWords.some(word => content.toLowerCase().includes(word))) {
      errors.push('Content contains inappropriate language');
    }
    
    return errors;
  };

  // Save post
  const handleSavePost = async (e) => {
    e.preventDefault();

    const errors = validateContent();
    if (errors.length > 0) {
      alert(`Please fix the following errors:\n${errors.join('\n')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const societyId = localStorage.getItem("societyId");

      if (!societyId) {
        alert("Society ID not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      let savedPost;

      if (selectedPost && selectedPost.postId) {
        // Update existing post - only send content (backend only supports content)
        savedPost = await updatePost(selectedPost.postId, {
          content: postForm.content
        });
      } else {
        // Create new post
        savedPost = await createPost(societyId, {
          content: postForm.content
        });
      }

      // Transform the response
      const transformedPost = {
        id: savedPost.postId,
        title: postForm.title || "Post", // Keep form title for UI
        content: savedPost.content,
        author: savedPost.author ? `${savedPost.author.firstName} ${savedPost.author.lastName}` : "Admin User",
        createdAt: savedPost.createdAt,
        likes: savedPost.likeCount || 0,
        comments: selectedPost ? selectedPost.comments : [],
        views: selectedPost ? selectedPost.views : 0,
        status: postForm.status,
        type: postForm.type,
        image: postForm.image,
        postId: savedPost.postId
      };

      if (selectedPost) {
        // Update existing post in list
        setPosts(posts.map(post => post.id === selectedPost.id ? transformedPost : post));
      } else {
        // Add new post to list
        setPosts([transformedPost, ...posts]);
      }

      // Reset form and return to list view
      setPostForm({
        title: '',
        content: '',
        image: null,
        type: 'announcement',
        status: 'draft'
      });
      setSelectedPost(null);
      setViewMode('list');

      console.log(`Post ${selectedPost ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit post
  const handleEditPost = (post) => {
    setSelectedPost(post);
    setPostForm({
      title: post.title,
      content: post.content,
      image: post.image,
      type: post.type,
      status: post.status
    });
    setViewMode('edit');
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    try {
      // Find the post to get the backend postId
      const post = posts.find(p => p.id === postId);
      const backendPostId = post?.postId || postId;

      await deletePost(backendPostId);
      setPosts(posts.filter(post => post.id !== postId));
      setDeleteConfirmPost(null);
      console.log(`Post ${postId} deleted successfully`);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  // View comments
  const handleViewComments = (post) => {
    setSelectedPost(post);
    setViewMode('comments');
  };

  // Delete comment
  const handleDeleteComment = (postId, commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setPosts(posts.map(post => 
        post.id === postId 
          ? {
              ...post,
              comments: post.comments.filter(comment => comment.id !== commentId)
            }
          : post
      ));
      console.log(`Comment ${commentId} deleted from post ${postId} - Audit log recorded`);
    }
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPostForm(prev => ({
          ...prev,
          image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format relative time for comments
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  // Comments View
  if (viewMode === 'comments' && selectedPost) {
    return (
      <Card
        title="Post Comments"
        subtitle={`Managing comments for: ${selectedPost.title}`}
      >
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2 text-mediumpur hover:text-mediumpur/80 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Posts
          </button>

          {/* Post Summary */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{selectedPost.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{selectedPost.content}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>{selectedPost.likes} likes</span>
              <span>{selectedPost.comments.length} comments</span>
              <span>{selectedPost.views} views</span>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comments ({selectedPost.comments.length})
            </h3>
            
            {selectedPost.comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>No comments yet</p>
                <p className="text-sm">Students will be able to comment once the post is published</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedPost.comments.map((comment) => (
                  <div key={comment.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{comment.studentAvatar}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{comment.studentName}</div>
                          <div className="text-xs text-gray-500">
                            {formatRelativeTime(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{comment.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart size={12} />
                        {comment.likes} likes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Create/Edit Post View
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <Card
        title={viewMode === 'create' ? "Create New Post" : "Edit Post"}
        subtitle={viewMode === 'create' ? "Share updates and announcements with society members" : `Editing: ${selectedPost?.title}`}
      >
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedPost(null);
              setPostForm({
                title: '',
                content: '',
                image: null,
                type: 'announcement',
                status: 'draft'
              });
            }}
            className="flex items-center gap-2 text-mediumpur hover:text-mediumpur/80 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Posts
          </button>

          <form onSubmit={handleSavePost} className="space-y-6">
            {/* Post Type and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
                <select
                  value={postForm.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-mediumpur focus:border-mediumpur text-sm"
                >
                  <option value="announcement">Announcement</option>
                  <option value="event">Event</option>
                  <option value="spotlight">Member Spotlight</option>
                  <option value="news">News</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={postForm.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-mediumpur focus:border-mediumpur text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={postForm.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter post title..."
                className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-mediumpur focus:border-mediumpur placeholder:text-sm text-sm"
                maxLength={100}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {postForm.title.length}/100 characters
              </div>
            </div>

            {/* Content Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={postForm.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your post content here..."
                rows={8}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-mediumpur focus:border-mediumpur placeholder:text-sm text-sm resize-none"
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {postForm.content.length}/1000 characters
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                >
                  <ImagePlus size={16} />
                  {postForm.image ? 'Change Image' : 'Upload Image'}
                </label>
                {postForm.image && (
                  <div className="relative">
                    <img
                      src={postForm.image}
                      alt="Preview"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleInputChange('image', null)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setViewMode('list');
                  setSelectedPost(null);
                  setPostForm({
                    title: '',
                    content: '',
                    image: null,
                    type: 'announcement',
                    status: 'draft'
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-mediumpur text-white rounded-lg hover:bg-mediumpur/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isSubmitting ? 'Saving...' : (viewMode === 'create' ? 'Create Post' : 'Update Post')}
              </button>
            </div>
          </form>
        </div>
      </Card>
    );
  }

  // Main Posts List View
  return (
    <Card
      title="Posts (Advanced)"
      subtitle="Create and manage society posts, announcements, and updates"
    >
      {/* Coming Soon Banner */}
      <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <div className="flex items-center gap-2">
          <div className="text-yellow-800 font-semibold">🚧 Coming Soon</div>
        </div>
        <div className="text-sm text-yellow-700 mt-1">
          Advanced features like titles, images, status filters, categories, and comments are under development.
          Use the basic "Posts" page for creating simple text posts.
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search posts by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 outline-none placeholder:text-sm focus:ring-1 focus:ring-mediumpur text-sm"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setViewMode('create')}
            className="flex items-center gap-2 px-4 py-2 bg-mediumpur text-white rounded-lg hover:bg-mediumpur/90 transition-colors text-sm"
          >
            <Plus size={16} />
            Create Post
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-mediumpur focus:border-mediumpur text-sm"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-mediumpur focus:border-mediumpur text-sm"
          >
            <option value="all">All Types</option>
            <option value="announcement">Announcement</option>
            <option value="event">Event</option>
            <option value="spotlight">Spotlight</option>
            <option value="news">News</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredPosts.length} of {posts.length} posts
      </div>

      {/* Empty State */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="text-lg font-medium text-gray-900 mb-2">No posts yet</div>
          <p className="text-gray-600 mb-4">Create your first post to share updates with society members</p>
          <button
            onClick={() => setViewMode('create')}
            className="bg-mediumpur text-white px-4 py-2 rounded-lg hover:bg-mediumpur/90 transition-colors text-sm"
          >
            Create First Post
          </button>
        </div>
      ) : (
        /* Posts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Post Image */}
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              {/* Post Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    post.type === 'announcement' ? 'bg-blue-100 text-blue-800' :
                    post.type === 'event' ? 'bg-green-100 text-green-800' :
                    post.type === 'spotlight' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {post.type}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    post.status === 'published' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.status}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.content}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>by {post.author}</span>
                </div>
                
                {/* Engagement Metrics */}
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Heart size={12} />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} />
                      {post.comments.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {post.views}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEditPost(post)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-xs"
                  >
                    <Edit3 size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewComments(post)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-xs"
                  >
                    <MessageCircle size={12} />
                    Comments
                  </button>
                  <button
                    onClick={() => setDeleteConfirmPost(post)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-xs"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>

                {/* Recent Comments Preview */}
                {post.comments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-700 mb-2">Recent Comments:</div>
                    <div className="space-y-2">
                      {post.comments.slice(0, 2).map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2 text-xs">
                          <div className="text-lg">{comment.studentAvatar}</div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{comment.studentName}</div>
                            <div className="text-gray-600 line-clamp-1">{comment.content}</div>
                          </div>
                        </div>
                      ))}
                      {post.comments.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{post.comments.length - 2} more comments
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty Search Results */}
      {filteredPosts.length === 0 && posts.length > 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-sm font-medium mb-2">No posts found</div>
          <p className="text-xs">Try adjusting your search terms or filters</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Post</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmPost(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(deleteConfirmPost.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// Mock data for join requests
const mockRequests = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@student.university.edu",
    note: "I'm passionate about AI and would love to contribute to your robotics projects. I have experience with Python and machine learning.",
    status: "pending",
    appliedAt: "2024-01-15T10:30:00Z",
    studentId: "STU2024001",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@student.university.edu",
    note: "Interested in joining the society to learn more about robotics and participate in hackathons.",
    status: "pending",
    appliedAt: "2024-01-14T14:20:00Z",
    studentId: "STU2024002",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@student.university.edu",
    note: "I've been following your society's work and would love to be part of the community. I have background in ML research.",
    status: "pending",
    appliedAt: "2024-01-13T09:15:00Z",
    studentId: "STU2024003",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@student.university.edu",
    note: "Looking to connect with like-minded students interested in AI and robotics. I have experience with ROS and computer vision.",
    status: "pending",
    appliedAt: "2024-01-12T16:45:00Z",
    studentId: "STU2024004",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
  }
];

// Mock notification function
async function mockSendNotification(notificationData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.1) {
        console.log('Notification sent:', notificationData);
        resolve({ success: true });
      } else {
        reject(new Error('Notification service unavailable'));
      }
    }, 1000);
  });
}

//======Requests Page =====//
function RequestsPage() {
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState(mockRequests);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [actionNote, setActionNote] = useState("");
  const [viewingProfile, setViewingProfile] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState({});

  // Filter pending requests
  const pendingRequests = requests.filter(req => req.status === 'pending');

  const filteredRequests = pendingRequests.filter((req) => {
    const searchTerm = search.toLowerCase();
    return (
      req.name.toLowerCase().includes(searchTerm) ||
      req.email.toLowerCase().includes(searchTerm) ||
      req.studentId.toLowerCase().includes(searchTerm) ||
      (req.note && req.note.toLowerCase().includes(searchTerm))
    );
  });

  // Bulk Actions Functions
  const handleRequestSelect = (requestId) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(req => req.id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkAction = async (action) => {
    if (selectedRequests.length === 0) return;

    const updatedRequests = requests.map(req =>
      selectedRequests.includes(req.id) ? {
        ...req,
        status: action,
        processedAt: new Date().toISOString(),
        adminNote: actionNote,
        processedBy: "Admin"
      } : req
    );
    setRequests(updatedRequests);

    // Send notifications for each selected request
    const selectedRequestObjs = requests.filter(req => selectedRequests.includes(req.id));
    for (const request of selectedRequestObjs) {
      await sendNotification(request, action, actionNote);
      recordAuditLog(request.id, action, actionNote);
    }

    // Reset selection and note
    setSelectedRequests([]);
    setActionNote("");
    setSelectAll(false);
  };

  const handleSingleAction = async (requestId, action, note = "") => {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    const updatedRequests = requests.map(req =>
      req.id === requestId ? {
        ...req,
        status: action,
        processedAt: new Date().toISOString(),
        adminNote: note,
        processedBy: "Admin"
      } : req
    );
    setRequests(updatedRequests);

    await sendNotification(request, action, note);
    recordAuditLog(requestId, action, note);
  };

  const handleExportRequests = () => {
    const headers = ['Name', 'Email', 'Student ID', 'Applied Date', 'Status', 'Note'];
    const data = pendingRequests.map(request => [
      request.name,
      request.email,
      request.studentId,
      new Date(request.appliedAt).toLocaleDateString(),
      request.status,
      request.note || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'join-requests.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Join requests downloaded - Audit log recorded');
  };

  // Notification system
  const sendNotification = async (request, action, note) => {
    const notificationId = `${request.id}-${Date.now()}`;

    try {
      setNotificationStatus(prev => ({ ...prev, [notificationId]: 'sending' }));

      const notificationData = {
        student: {
          name: request.name,
          email: request.email,
          studentId: request.studentId
        },
        action: action,
        note: note,
        society: "AI & Robotics Society",
        timestamp: new Date().toISOString()
      };

      await mockSendNotification(notificationData);

      setNotificationStatus(prev => ({ ...prev, [notificationId]: 'success' }));

      setTimeout(() => {
        setNotificationStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[notificationId];
          return newStatus;
        });
      }, 3000);

    } catch (error) {
      setNotificationStatus(prev => ({ ...prev, [notificationId]: 'failed' }));

      setTimeout(() => {
        sendNotification(request, action, note);
      }, 5000);
    }
  };

  const recordAuditLog = (requestId, action, note) => {
    const auditLog = {
      requestId,
      action,
      note,
      admin: "Society Admin",
      timestamp: new Date().toISOString(),
      society: "AI & Robotics Society"
    };
    
    console.log('AUDIT LOG:', auditLog);
  };

  const openStudentProfile = (request) => {
    setViewingProfile(request);
  };

  return (
    <Card
      title="Join Requests"
      subtitle="Review and manage membership applications"
    >
      {/* Coming Soon Banner */}
      <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <div className="flex items-center gap-2">
          <div className="text-yellow-800 font-semibold">🚧 Coming Soon</div>
        </div>
        <div className="text-sm text-yellow-700 mt-1">
          Backend integration for join requests is under development. The page currently shows demo data for testing the interface.
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 outline-none placeholder:text-sm focus:ring-1 focus:ring-lilac text-sm"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportRequests}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Download size={16} />
            Export All
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRequests.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="text-blue-800 text-sm font-medium">
              {selectedRequests.length} request(s) selected
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Action Note Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Add a note (optional)"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 w-64 outline-none focus:ring-1 focus:ring-lilac"
                />
              </div>
              <button
                onClick={() => handleBulkAction('approved')}
                className="flex items-center gap-2 px-3 py-1.5 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                <CheckCircle size={14} />
                Approve Selected
              </button>
              <button
                onClick={() => handleBulkAction('rejected')}
                className="flex items-center gap-2 px-3 py-1.5 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                <XCircle size={14} />
                Reject Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredRequests.length} of {pendingRequests.length} pending requests
      </div>

      {/* Main Flow: Requests Table */}
      {pendingRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="text-lg font-medium text-gray-900 mb-2">No pending requests</div>
          <p className="text-gray-600 mb-4">All join requests have been processed</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-mediumpur focus:ring-mediumpur w-4 h-4"
                  />
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Applicant</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Application Note</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Applied Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request, index) => (
                <tr 
                  key={request.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-gray-25' : 'bg-white'
                  }`}
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={() => handleRequestSelect(request.id)}
                      className="rounded border-gray-300 text-mediumpur focus:ring-mediumpur w-4 h-4"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={request.avatar}
                        alt={request.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.name}</div>
                        <div className="text-xs text-gray-500">{request.email}</div>
                        <div className="text-xs text-gray-400">{request.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-700 max-w-xs">
                      {request.note || "No additional notes provided"}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {new Date(request.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const note = prompt("Add an optional note for the student:");
                          handleSingleAction(request.id, 'approved', note || "");
                        }}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve request"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => {
                          const note = prompt("Add an optional note for the student:");
                          handleSingleAction(request.id, 'rejected', note || "");
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject request"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty Search Results */}
          {filteredRequests.length === 0 && pendingRequests.length > 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-sm font-medium mb-2">No requests found</div>
              <p className="text-xs">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      )}

      {/* Student Profile Modal */}
      {viewingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Applicant Details</h3>
              <button
                onClick={() => setViewingProfile(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Student Basic Info */}
              <div className="flex items-center gap-4">
                <img src={viewingProfile.avatar} alt={viewingProfile.name} className="w-16 h-16 rounded-full" />
                <div>
                  <h4 className="font-semibold text-sm">{viewingProfile.name}</h4>
                  <p className="text-xs text-gray-600">{viewingProfile.email}</p>
                  <p className="text-xs text-gray-500">{viewingProfile.studentId}</p>
                </div>
              </div>
              
              {/* Application Details */}
              <div>
                <label className="text-sm font-medium text-gray-700">Application Note</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                  {viewingProfile.note || "No additional notes provided."}
                </div>
              </div>
              
              {/* Decision Actions */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    const note = prompt("Add an optional note for the student:");
                    handleSingleAction(viewingProfile.id, 'approved', note || "");
                    setViewingProfile(null);
                  }}
                  className="flex-1 rounded-lg px-3 py-2 text-white hover:opacity-90 transition-opacity text-sm bg-green-600"
                >
                  Approve Request
                </button>
                <button
                  onClick={() => {
                    const note = prompt("Add an optional note for the student:");
                    handleSingleAction(viewingProfile.id, 'rejected', note || "");
                    setViewingProfile(null);
                  }}
                  className="flex-1 rounded-lg px-3 py-2 hover:bg-gray-200 transition-colors text-sm border border-gray-300"
                >
                  Decline Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Status Indicators */}
      <div className="fixed bottom-4 right-4 space-y-2">
        {Object.entries(notificationStatus).map(([id, status]) => (
          <div
            key={id}
            className={`px-3 py-2 rounded-lg text-white text-sm ${
              status === 'sending' ? 'bg-blue-500' :
              status === 'success' ? 'bg-green-500' :
              status === 'failed' ? 'bg-red-500' : ''
            }`}
          >
            {status === 'sending' && 'Sending notification...'}
            {status === 'success' && '✓ Notification sent'}
            {status === 'failed' && '✗ Failed to send - retrying...'}
          </div>
        ))}
      </div>
    </Card>
  );
}


//======= Settings Page ======//
function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [societyLogo, setSocietyLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [formData, setFormData] = useState({
    societyName: "",
    category: "",
    description: "",
    adminName: "John",
    adminSurname: "Doe",
    email: "admin@airobotics.com",
    password: "",
    confirmPassword: ""
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [societyId, setSocietyId] = useState(null);

  // Load society data on mount
  useEffect(() => {
    const loadSocietyData = async () => {
      try {
        setLoading(true);
        // TODO: Get societyId from auth context or URL params
        // For now, using hardcoded ID from seeded data
        const testSocietyId = "1001"; // NWU Tech Society from seed
        setSocietyId(testSocietyId);

        const societyData = await getSocietyDetails(testSocietyId);

        setFormData(prev => ({
          ...prev,
          societyName: societyData.name || "",
          category: societyData.category || "",
          description: societyData.description || ""
        }));

        // Set logo preview if exists
        if (societyData.logoUrl) {
          setLogoPreview(societyData.logoUrl);
        }

      } catch (error) {
        console.error("Error loading society data:", error);
        setValidationErrors({
          load: "Failed to load society data. Please refresh the page."
        });
      } finally {
        setLoading(false);
      }
    };

    loadSocietyData();
  }, []);

  // Mock function to check admin authorization (Alternative Flow 2b)
  const checkAdminAuthorization = () => {
    const currentUserRole = "society-admin";
    return currentUserRole === "society-admin";
  };

  // Handle logo upload (Main Flow step 2)
  const handleLogoUpload = (event) => {
    if (!checkAdminAuthorization()) {
      setValidationErrors({ authorization: "You are not authorized to modify society settings." });
      return;
    }

    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setValidationErrors({ logo: "Please upload a valid image file (PNG, JPG, JPEG)" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setValidationErrors({ logo: "Image must be less than 2MB" });
        return;
      }

      setSocietyLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setValidationErrors(prev => ({ ...prev, logo: "" }));
    }
  };

  const removeLogo = () => {
    if (!checkAdminAuthorization()) {
      setValidationErrors({ authorization: "You are not authorized to modify society settings." });
      return;
    }
    setSocietyLogo(null);
    setLogoPreview("");
  };

  // Handle input changes (Main Flow step 2)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form data (Main Flow step 3 / Alternative Flow 2a)
  const validateForm = (tab) => {
    const errors = {};

    if (tab === "Profile") {
      if (!formData.societyName.trim()) {
        errors.societyName = "Society name is required";
      } else if (formData.societyName.trim().length < 3) {
        errors.societyName = "Society name must be at least 3 characters";
      }

      if (!formData.category.trim()) {
        errors.category = "Category is required";
      }

      if (!formData.description.trim()) {
        errors.description = "Description is required";
      } else if (formData.description.trim().length < 20) {
        errors.description = "Description must be at least 20 characters";
      }
    }

    if (tab === "Security") {
      if (!formData.adminName.trim()) {
        errors.adminName = "Admin name is required";
      }

      if (!formData.adminSurname.trim()) {
        errors.adminSurname = "Admin surname is required";
      }

      if (!formData.email.trim()) {
        errors.email = "Email address is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }

      if (formData.password) {
        if (formData.password.length < 8) {
          errors.password = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          errors.password = "Password must contain uppercase, lowercase, and numbers";
        }

        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = "Passwords do not match";
        }
      }
    }

    return errors;
  };

  // Save changes (Main Flow step 4)
  const handleSaveChanges = async (tab) => {
    if (!checkAdminAuthorization()) {
      setValidationErrors({ authorization: "Unauthorized: You are not assigned as an admin for this society." });
      return;
    }

    if (!societyId) {
      setValidationErrors({ submit: "Society ID not found. Please refresh the page." });
      return;
    }

    const errors = validateForm(tab);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSaveStatus("saving");

    try {
      if (tab === "Profile") {
        // Update society profile
        const updateData = {
          name: formData.societyName,
          category: formData.category,
          description: formData.description
        };

        // TODO: Handle logo upload separately when backend endpoint is ready
        // For now, logo upload is deferred to Phase 4

        await updateSociety(societyId, updateData);

        console.log("Society profile updated successfully");
      } else if (tab === "Security") {
        // TODO: Implement admin user profile update
        // This requires a separate user profile endpoint
        console.log("Security updates not yet implemented");
        throw new Error("Security updates are not yet available. This feature is coming soon.");
      }

      setSaveStatus("success");

      setTimeout(() => {
        setSaveStatus("");
      }, 3000);

    } catch (error) {
      console.error("Error saving changes:", error);
      setSaveStatus("error");
      setValidationErrors({
        submit: error.message || "Failed to save changes. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleCancel = () => {
    setFormData({
      societyName: "AI & Robotics Society",
      category: "Technology",
      description: "We host weekly workshops on ML, robotics, and hack nights.",
      adminName: "John",
      adminSurname: "Doe",
      email: "admin@airobotics.com",
      password: "",
      confirmPassword: ""
    });
    setValidationErrors({});
    setSaveStatus("");
  };

  // Loading state
  if (loading) {
    return (
      <Card
        title="Society Account Management"
        subtitle="Update society profile, security settings, and preferences"
      >
        <div className="space-y-4 animate-pulse">
          <div className="h-12 rounded-2xl" style={{ background: colors.paper }}></div>
          <div className="h-32 rounded-2xl" style={{ background: colors.paper }}></div>
          <div className="h-12 rounded-2xl" style={{ background: colors.paper }}></div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Society Account Management"
      subtitle="Update society profile, security settings, and preferences"
    >
      {/* Load Error */}
      {validationErrors.load && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm">{validationErrors.load}</span>
          </div>
        </div>
      )}

      {/* Authorization Error */}
      {validationErrors.authorization && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm">{validationErrors.authorization}</span>
          </div>
        </div>
      )}

      {/* Save Status */}
      {saveStatus === "success" && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm">Profile updated successfully! Changes are now visible to students.</span>
          </div>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm">{validationErrors.submit}</span>
          </div>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-gray-300 mb-6">
        <button
          className={`px-6 py-3 -mb-px font-medium text-sm transition-colors ${
            activeTab === "Profile"
              ? "border-b-2 border-plum text-plum"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("Profile")}
        >
          Society Profile
        </button>
        <button
          className={`px-6 py-3 -mb-px font-medium text-sm transition-colors ${
            activeTab === "Security"
              ? "border-b-2 border-plum text-plum"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("Security")}
        >
          Admin Security
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "Profile" && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Society Profile Settings</h3>
          <p className="text-sm text-gray-600 mb-6">Update your society's public profile information visible to students.</p>

          {/* Logo Upload Section */}
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-8 p-4 bg-gray-50 rounded-xl">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-white">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Society logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Society Logo
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-white text-sm hover:opacity-90 transition"
                      style={{ background: colors.plum }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload Logo
                    </span>
                  </label>
                  
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-sm hover:bg-gray-200 transition-colors"
                      style={{ background: colors.mist }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>
                {validationErrors.logo && (
                  <p className="text-red-500 text-sm mt-2">{validationErrors.logo}</p>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Recommended: Square image, 300x300px, PNG or JPG, max 2MB
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="block">
              <label className="block text-sm font-medium text-gray-700 mb-2">Society Name *</label>
              <input
                name="societyName"
                value={formData.societyName}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 outline-none transition-colors text-sm placeholder:text-gray-500 ${
                  validationErrors.societyName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-plum focus:ring-1 focus:ring-plum/20'
                }`}
                placeholder="AI & Robotics Society"
              />
              {validationErrors.societyName && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.societyName}</p>
              )}
            </div>
            
            <div className="block">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 outline-none transition-colors text-sm ${
                  validationErrors.category ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-plum focus:ring-1 focus:ring-plum/20'
                }`}
              >
                <option value="Technology">Technology</option>
                <option value="Sports">Sports</option>
                <option value="Arts">Arts</option>
                <option value="Academic">Academic</option>
                <option value="Cultural">Cultural</option>
                <option value="Other">Other</option>
              </select>
              {validationErrors.category && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.category}</p>
              )}
            </div>
            
            <div className="block md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">About Society *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full border rounded-lg px-3 py-2 outline-none transition-colors resize-none text-sm placeholder:text-gray-500 ${
                  validationErrors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-plum focus:ring-1 focus:ring-plum/20'
                }`}
                placeholder="We host weekly workshops on ML, robotics, and hack nights."
              />
              {validationErrors.description && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">Describe your society's mission, activities, and what students can expect.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => handleSaveChanges("Profile")}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity font-medium disabled:opacity-50 text-sm"
              style={{ background: colors.plum }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {activeTab === "Security" && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Security Settings</h3>
          <p className="text-sm text-gray-600 mb-6">Update your admin account information and security settings.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Name */}
            <div className="block">
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Name *</label>
              <input
                name="adminName"
                value={formData.adminName}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 outline-none transition-colors text-sm placeholder:text-gray-500 ${
                  validationErrors.adminName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-plum focus:ring-1 focus:ring-plum/20'
                }`}
                placeholder="Enter admin name"
              />
              {validationErrors.adminName && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.adminName}</p>
              )}
            </div>

            {/* Admin Surname */}
            <div className="block">
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Surname *</label>
              <input
                name="adminSurname"
                value={formData.adminSurname}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 outline-none transition-colors text-sm placeholder:text-gray-500 ${
                  validationErrors.adminSurname ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-plum focus:ring-1 focus:ring-plum/20'
                }`}
                placeholder="Enter admin surname"
              />
              {validationErrors.adminSurname && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.adminSurname}</p>
              )}
            </div>

            {/* Email */}
            <div className="block md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
                  </svg>
                </span>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 border rounded-lg px-3 py-2 outline-none transition-colors text-sm placeholder:text-gray-500 ${
                    validationErrors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-plum focus:ring-1 focus:ring-plum/20'
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="block">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                  </svg>
                </span>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 border rounded-lg px-3 py-2 outline-none transition-colors text-sm placeholder:text-gray-500 ${
                    validationErrors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-plum focus:ring-1 focus:ring-plum/20'
                  }`}
                  placeholder="Enter new password"
                />
              </div>
              {validationErrors.password && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.password}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">Leave blank to keep current password</p>
            </div>

            {/* Confirm Password */}
            <div className="block">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                  </svg>
                </span>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 border rounded-lg px-3 py-2 outline-none transition-colors text-sm placeholder:text-gray-500 ${
                    validationErrors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-plum focus:ring-1 focus:ring-plum/20'
                  }`}
                  placeholder="Confirm new password"
                />
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => handleSaveChanges("Security")}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity font-medium disabled:opacity-50 text-sm"
              style={{ background: colors.plum }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Update Security
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

//====== Messages Page ======//
// Notification Sender Component
const NotificationSender = () => {
  const [members] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", role: "Member", hasRSVP: true, status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Admin", hasRSVP: false, status: "active" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "Member", hasRSVP: true, status: "inactive" },
    { id: 4, name: "Sarah Wilson", email: "sarah@example.com", role: "Volunteer", hasRSVP: true, status: "active" },
  ]);

  const [formData, setFormData] = useState({
    audience: "all",
    subject: "",
    message: "",
    includeEmail: true,
    includeInApp: true
  });

  const [deliveryStatus, setDeliveryStatus] = useState({
    sent: 0,
    failed: 0,
    pending: 0,
    logs: []
  });

  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getEligibleRecipients = () => {
    let filtered = members.filter(member => member.status === "active");

    if (formData.audience === "rsvp") {
      filtered = filtered.filter(member => member.hasRSVP);
    }

    return filtered;
  };

  const eligibleRecipients = getEligibleRecipients();

  const handleAudienceChange = (value) => {
    setFormData(prev => ({
      ...prev,
      audience: value
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const simulateNotificationSend = async () => {
    setIsSending(true);
    const logs = [];
    let sent = 0;
    let failed = 0;

    for (const recipient of eligibleRecipients) {
      const success = Math.random() > 0.1;
      
      if (success) {
        sent++;
        logs.push({
          id: Date.now() + recipient.id,
          recipient: recipient.name,
          email: recipient.email,
          status: "sent",
          timestamp: new Date().toISOString(),
          method: formData.includeEmail ? "email" : "in-app"
        });
      } else {
        failed++;
        logs.push({
          id: Date.now() + recipient.id,
          recipient: recipient.name,
          email: recipient.email,
          status: "failed",
          timestamp: new Date().toISOString(),
          method: formData.includeEmail ? "email" : "in-app",
          error: "Delivery failed"
        });
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setDeliveryStatus({
      sent,
      failed,
      pending: 0,
      logs
    });

    setIsSending(false);
    setShowSuccess(true);
    
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (eligibleRecipients.length === 0) {
      alert("No eligible recipients found. Please adjust your audience selection.");
      return;
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      alert("Please provide both subject and message.");
      return;
    }

    simulateNotificationSend();
  };

  const resetForm = () => {
    setFormData({
      audience: "all",
      subject: "",
      message: "",
      includeEmail: true,
      includeInApp: true
    });
    setDeliveryStatus({
      sent: 0,
      failed: 0,
      pending: 0,
      logs: []
    });
  };

  return (
    <Card
      title="Send Messages"
      subtitle="Communicate with society members via email and in-app notifications"
    >
      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800 text-sm">Messages sent successfully!</p>
              <p className="text-xs text-green-600">
                {deliveryStatus.sent} delivered, {deliveryStatus.failed} failed
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Audience Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Audience</h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="audience"
                    value="all"
                    checked={formData.audience === "all"}
                    onChange={(e) => handleAudienceChange(e.target.value)}
                    className="text-mediumpur focus:ring-mediumpur"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">All Members</p>
                    <p className="text-gray-600 text-xs">Send to all active society members</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="audience"
                    value="rsvp"
                    checked={formData.audience === "rsvp"}
                    onChange={(e) => handleAudienceChange(e.target.value)}
                    className="text-mediumpur focus:ring-mediumpur"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">RSVP'd Attendees</p>
                    <p className="text-gray-600 text-xs">Only members who RSVP'd to events</p>
                  </div>
                </label>
              </div>

              {/* Recipient Count */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700">
                  {eligibleRecipients.length} eligible recipients
                </p>
                {eligibleRecipients.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">No recipients found with current selection</p>
                )}
              </div>
            </div>

            {/* Message Composition */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compose Message</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    placeholder="Enter message subject..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-mediumpur focus:border-mediumpur outline-none placeholder:text-sm text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="Type your message here..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-mediumpur focus:border-mediumpur outline-none placeholder:text-sm text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Methods */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Methods</h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.includeEmail}
                    onChange={(e) => handleInputChange("includeEmail", e.target.checked)}
                    className="rounded border-gray-300 text-mediumpur focus:ring-mediumpur"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Email</p>
                    <p className="text-gray-600 text-xs">Send as email notification</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.includeInApp}
                    onChange={(e) => handleInputChange("includeInApp", e.target.checked)}
                    className="rounded border-gray-300 text-mediumpur focus:ring-mediumpur"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">In-App Notification</p>
                    <p className="text-gray-600 text-xs">Show notification within the app</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Preview
              </button>
              <button
                type="submit"
                disabled={isSending || eligibleRecipients.length === 0}
                className="flex-1 px-4 py-2 bg-mediumpur text-white rounded-lg hover:bg-mediumpur/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isSending ? "Sending..." : "Send Messages"}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar - Stats & Actions */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Recipients</span>
                <span className="font-medium text-sm">{eligibleRecipients.length}</span>
              </div>
              
              {deliveryStatus.sent > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Successfully Sent</span>
                  <span className="font-medium text-green-600 text-sm">{deliveryStatus.sent}</span>
                </div>
              )}
              
              {deliveryStatus.failed > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Failed</span>
                  <span className="font-medium text-red-600 text-sm">{deliveryStatus.failed}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <button
                onClick={resetForm}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                Reset Form
              </button>
              <button
                onClick={() => setFormData(prev => ({ ...prev, audience: "rsvp" }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                Target RSVP'd Members
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Message Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Subject:</p>
                  <p className="text-gray-900 text-sm">{formData.subject || "(No subject)"}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                  <p className="text-gray-900 text-sm whitespace-pre-wrap">{formData.message || "(No message)"}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    This will be sent to {eligibleRecipients.length} recipients via:
                  </p>
                  <div className="flex gap-4 mt-2">
                    {formData.includeEmail && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Email
                      </span>
                    )}
                    {formData.includeInApp && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        In-App
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};


//====== Metrics Page =====//
function MetricsPage() {
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [activityType, setActivityType] = useState('all'); // 'all', 'events', 'posts', 'members'
  const [isLoading, setIsLoading] = useState(false);
  const [hasData, setHasData] = useState(true);

  // Mock data - in real app this would come from API
  const [metricsData, setMetricsData] = useState({
    eventAttendance: [
      { month: 'Jan', attendees: 45, rsvp: 52 },
      { month: 'Feb', attendees: 62, rsvp: 68 },
      { month: 'Mar', attendees: 38, rsvp: 45 },
      { month: 'Apr', attendees: 71, rsvp: 75 },
      { month: 'May', attendees: 55, rsvp: 60 },
      { month: 'Jun', attendees: 68, rsvp: 72 },
    ],
    membershipGrowth: [
      { month: 'Jan', members: 120, newMembers: 15 },
      { month: 'Feb', members: 135, newMembers: 12 },
      { month: 'Mar', members: 142, newMembers: 7 },
      { month: 'Apr', members: 156, newMembers: 14 },
      { month: 'May', members: 168, newMembers: 12 },
      { month: 'Jun', members: 175, newMembers: 7 },
    ],
    postEngagement: [
      { month: 'Jan', posts: 8, likes: 45, comments: 12 },
      { month: 'Feb', posts: 12, likes: 78, comments: 23 },
      { month: 'Mar', posts: 6, likes: 34, comments: 8 },
      { month: 'Apr', posts: 15, likes: 92, comments: 31 },
      { month: 'May', posts: 10, likes: 67, comments: 18 },
      { month: 'Jun', posts: 13, likes: 85, comments: 27 },
    ],
    topActivities: [
      { name: "Tech Workshop", type: "event", participants: 68, engagement: 92 },
      { name: "Annual Meetup", type: "event", participants: 75, engagement: 88 },
      { name: "Member Spotlight", type: "post", participants: 156, engagement: 85 },
      { name: "Volunteer Drive", type: "event", participants: 42, engagement: 78 },
      { name: "Study Group", type: "post", participants: 89, engagement: 76 },
    ]
  });

  // Main Flow 1 & 2: Load metrics data on component mount
  useEffect(() => {
    loadMetricsData();
  }, [timeRange, activityType]);

  const loadMetricsData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real app, this would fetch filtered data from backend
    // For demo, we're using static data but would filter based on timeRange and activityType
    
    // Alternative Flow 2a: Check if data exists
    const dataExists = metricsData.eventAttendance.length > 0;
    setHasData(dataExists);
    
    setIsLoading(false);
  };

  // Calculate summary statistics
  const summaryStats = {
    totalMembers: metricsData.membershipGrowth[metricsData.membershipGrowth.length - 1]?.members || 0,
    avgAttendance: Math.round(metricsData.eventAttendance.reduce((sum, item) => sum + item.attendees, 0) / metricsData.eventAttendance.length),
    totalPosts: metricsData.postEngagement.reduce((sum, item) => sum + item.posts, 0),
    engagementRate: Math.round((metricsData.postEngagement.reduce((sum, item) => sum + item.likes + item.comments, 0) / metricsData.postEngagement.reduce((sum, item) => sum + item.posts, 0)) * 10) / 10
  };

  // Main Flow 3: Filter handlers
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleActivityTypeChange = (type) => {
    setActivityType(type);
  };

  // Main Flow 4: Report generation helpers
  const generateAttendanceChart = () => (
    <div className="space-y-3">
      {metricsData.eventAttendance.map((item, index) => (
        <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
          <span className="text-sm font-medium text-gray-700 w-20">{item.month}</span>
          <div className="flex-1 mx-4">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <span>Attendance: {item.attendees}/{item.rsvp} ({Math.round((item.attendees / item.rsvp) * 100)}%)</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-mediumpur rounded-full" 
                style={{ width: `${(item.attendees / item.rsvp) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const generateMembershipChart = () => (
    <div className="space-y-3">
      {metricsData.membershipGrowth.map((item, index) => (
        <div key={index} className="p-3 rounded-xl bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{item.month}</span>
            <span className="text-sm text-green-600">+{item.newMembers} new</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{item.members} members</div>
          <div className="h-2 bg-gray-200 rounded-full mt-2">
            <div 
              className="h-2 bg-green-500 rounded-full" 
              style={{ width: `${(item.members / 200) * 100}%` }} // Assuming max 200 for scale
            />
          </div>
        </div>
      ))}
    </div>
  );

  const generateEngagementTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Month</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Posts</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Likes</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Comments</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Engagement Rate</th>
          </tr>
        </thead>
        <tbody>
          {metricsData.postEngagement.map((item, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.month}</td>
              <td className="py-3 px-4 text-sm text-gray-700">{item.posts}</td>
              <td className="py-3 px-4 text-sm text-gray-700">{item.likes}</td>
              <td className="py-3 px-4 text-sm text-gray-700">{item.comments}</td>
              <td className="py-3 px-4 text-sm text-gray-700">
                {Math.round(((item.likes + item.comments) / item.posts) * 10) / 10} per post
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const generateTopActivities = () => (
    <div className="space-y-3">
      {metricsData.topActivities.map((activity, index) => (
        <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              activity.type === 'event' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
            }`}>
              {activity.type === 'event' ? '📅' : '📝'}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{activity.name}</div>
              <div className="text-xs text-gray-500 capitalize">{activity.type}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">{activity.participants}</div>
            <div className="text-xs text-gray-500">{activity.engagement}% engaged</div>
          </div>
        </div>
      ))}
    </div>
  );

  // Alternative Flow 2a: No data available
  if (!hasData && !isLoading) {
    return (
      <Card title="Participation Metrics" subtitle="Engagement across members and content">
        <div className="text-center py-12">
          <div className="text-lg font-medium text-gray-900 mb-2">No activity recorded</div>
          <p className="text-gray-600 mb-6">There's no participation data available for the selected filters.</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => {
                setTimeRange('all');
                setActivityType('all');
                loadMetricsData();
              }}
              className="bg-mediumpur text-white px-4 py-2 rounded-lg hover:bg-mediumpur/90 transition-colors text-sm"
            >
              View All Data
            </button>
            <button className="border border-mediumpur text-mediumpur px-4 py-2 rounded-lg hover:bg-mediumpur/10 transition-colors text-sm">
              Set Up Tracking
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Participation Metrics" 
      subtitle="Track engagement across members and content to support decision-making"
    >
      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mediumpur mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading metrics data...</p>
        </div>
      )}

      {/* Main Flow 3: Filters */}
      {!isLoading && hasData && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {/* Time Range Filter */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {['week', 'month', 'quarter', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => handleTimeRangeChange(range)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                      timeRange === range
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              {/* Activity Type Filter */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {['all', 'events', 'posts', 'members'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleActivityTypeChange(type)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                      activityType === type
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-mediumpur rounded-full"></div>
                <span>Events</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Members</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Posts</span>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{summaryStats.totalMembers}</div>
              <div className="text-xs text-gray-600">Total Members</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{summaryStats.avgAttendance}</div>
              <div className="text-xs text-gray-600">Avg. Attendance</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{summaryStats.totalPosts}</div>
              <div className="text-xs text-gray-600">Total Posts</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{summaryStats.engagementRate}</div>
              <div className="text-xs text-gray-600">Engagement/Post</div>
            </div>
          </div>

          {/* Main Flow 4: Reports as Charts/Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Attendance Chart */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Attendance</h3>
              {generateAttendanceChart()}
            </div>

            {/* Membership Growth Chart */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Growth</h3>
              {generateMembershipChart()}
            </div>

            {/* Post Engagement Table */}
            <div className="lg:col-span-2 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Engagement</h3>
              {generateEngagementTable()}
            </div>

            {/* Top Activities */}
            <div className="lg:col-span-2 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Activities</h3>
              {generateTopActivities()}
            </div>
          </div>

          {/* Export Action */}
          <div className="mt-6 flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </>
      )}
    </Card>
  );
}

// App wrapper
export default function SocietyAdminDashboard() {
  const [page, setPage] = useState("overview");
  return (
    <Shell page={page} setPage={setPage}>
      {page === "overview" && <OverviewPage />}
      {page === "members" && <MembersPage />}
      {page === "events" && <EventsPage />}
      {page === "posts" && <PostsPage />}
      {page === "posts-detailed" && <PostsPageDetailed />}
      {page === "requests" && <RequestsPage />}
       {page === "messages" && <NotificationSender />}
      {page === "settings" && <SettingsPage />}
      {page === "metrics" && <MetricsPage />}
    </Shell>
  );
}
