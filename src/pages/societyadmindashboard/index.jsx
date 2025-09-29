import React, { useState,useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
//=====MOCK IMAGES FOR MEMBERS ======//
import photo1 from "@/assets/photo1.jpg";
import photo2 from "@/assets/photo2.jpg";
import photo3 from "@/assets/photo3.jpg";
import aws from "@/assets/aws.jpeg";

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
  const nav = [
    { key: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { key: "members", label: "Members", icon: <Users size={18} /> },
    { key: "events", label: "Events", icon: <CalendarDays size={18} /> },
    { key: "posts", label: "Posts", icon: <FileText size={18} /> },
    { key: "requests", label: "Requests", icon: <ShieldCheck size={18} /> },
    { key: "settings", label: "Settings", icon: <Settings size={18} /> },
    { key: "metrics", label: "Metrics", icon: <BarChart3 size={18} /> },
  ];

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: `linear-gradient(to bottom, ${colors.plum} 0%, white 100%)` }}
    >
      

      <div className="mx-auto max-w-7xl py-6 grid grid-cols-12 gap-6 px-4 md:px-6 lg:px-8">


        {/* Sidebar */}
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
      <div className="text-xs opacity-70 mb-1">Managing</div>
      <div className="text-sm font-semibold">AI & Robotics Society</div>
      <div className="text-xs opacity-70">Role: Admin</div>
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

// Pages
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
  const [members, setMembers] = useState(mockMembers);
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

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

  const handleBulkDelete = () => {
    if (selectedMembers.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedMembers.length} selected member(s)?`)) {
      setMembers(members.filter(m => !selectedMembers.includes(m.id)));
      setSelectedMembers([]);
      setSelectAll(false);
      console.log(`${selectedMembers.length} members deleted - Audit log recorded`);
    }
  };

  const handleBulkStatusUpdate = (newStatus) => {
    if (selectedMembers.length === 0) return;

    setMembers(members.map(member =>
      selectedMembers.includes(member.id)
        ? { ...member, status: newStatus }
        : member
    ));
    
    console.log(`${selectedMembers.length} members status updated to ${newStatus} - Audit log recorded`);
    setSelectedMembers([]);
    setSelectAll(false);
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

  const handleDeleteMember = (memberId) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      setMembers(members.filter(m => m.id !== memberId));
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
      console.log(`Member ${memberId} deleted - Audit log recorded`);
    }
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
            <img
              src={selectedMember.image}
              alt={selectedMember.name}
              className="w-20 h-20 rounded-full object-cover"
            />
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
              <div className="space-y-2">
                <div>
                  <strong>Email:</strong> {selectedMember.email}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedMember.phone}
                </div>
                <div>
                  <strong>Join Date:</strong> {selectedMember.joinDate}
                </div>
              </div>
            </div>

            {/* Activity Information */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• Last login: {selectedMember.lastLogin || '2 days ago'}</div>
                <div>• Events attended: {selectedMember.eventsAttended || '5'}</div>
                <div>• Society meetings: {selectedMember.meetingsAttended || '3'}</div>
                <div>• Member since: {selectedMember.joinDate}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => handleDeleteMember(selectedMember.id)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Delete Member
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // Main Member List View
  return (
    <Card
      title="Members"
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
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-1.5 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                <Trash2 size={14} />
                Delete Selected
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
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
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
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete member"
                      >
                        <Trash2 size={14} />
                      </button>
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
    </Card>
  );
}


//====== Events Page =====//
//====== Events Page =====//
function EventsPage() {
  const [events, setEvents] = useState(mockEvents);
  const [filteredEvents, setFilteredEvents] = useState(mockEvents);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpList, setRsvpList] = useState({});
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    poster: null,
    posterPreview: null,
    maxAttendees: "",
    category: "Workshop"
  });

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
  const handleCreateEvent = () => {
    const errors = validateEvent(newEvent);
    if (Object.keys(errors).length > 0) {
      // Show validation errors (Alternative Flow 2a)
      alert("Please fix the following errors:\n" + Object.values(errors).join('\n'));
      return;
    }

    const event = {
      id: Date.now().toString(),
      ...newEvent,
      rsvp: 0,
      rsvpList: [],
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      createdBy: "Society Admin"
    };
    
    setEvents(prev => [...prev, event]);
    setIsCreating(false);
    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      poster: null,
      posterPreview: null,
      maxAttendees: "",
      category: "Workshop"
    });

    // Postconditions: Event is published to platform calendar
    console.log("Event published to platform calendar:", event.title);
  };

  // Start editing an event
  const handleEdit = (event) => {
    setEditingEvent({
      ...event,
      posterPreview: event.posterPreview || event.poster
    });
  };

  // Save edited event
  const handleSaveEdit = () => {
    const errors = validateEvent(editingEvent);
    if (Object.keys(errors).length > 0) {
      alert("Please fix the following errors:\n" + Object.values(errors).join('\n'));
      return;
    }

    setEvents(prev => prev.map(e => e.id === editingEvent.id ? editingEvent : e));
    setEditingEvent(null);
  };

  // Delete event
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  // Cancel event (Alternative Flow 4a)
  const handleCancelEvent = (eventId) => {
    if (window.confirm("Cancel this event? All RSVPs will be notified.")) {
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, status: 'cancelled', cancelledAt: new Date().toISOString() }
          : e
      ));

      // Notify students who RSVP'd (Alternative Flow 4a)
      const event = events.find(e => e.id === eventId);
      if (event && event.rsvpList && event.rsvpList.length > 0) {
        console.log(`Notifying ${event.rsvpList.length} students about event cancellation:`, event.title);
        // In real implementation, send notifications to each student
      }
    }
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

  // Cancel creation or editing
  const handleCancel = () => {
    setIsCreating(false);
    setEditingEvent(null);
    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      poster: null,
      posterPreview: null,
      maxAttendees: "",
      category: "Workshop"
    });
  };

  // Get event status badge
  const getEventStatusBadge = (event) => {
    const statusConfig = {
      upcoming: { color: 'bg-green-100 text-green-800', label: 'Upcoming' },
      ongoing: { color: 'bg-blue-100 text-blue-800', label: 'Ongoing' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[event.status] || statusConfig.upcoming;
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
            {events.filter(e => e.status === 'upcoming').length}
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
            {events.filter(e => e.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
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
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div
                    className="w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-6 hover:bg-mist/50 transition"
                    style={{ borderColor: colors.mist }}
                  >
                    {newEvent.posterPreview ? (
                      <img
                        src={newEvent.posterPreview}
                        alt="Event poster preview"
                        className="w-full h-48 object-cover rounded-xl mb-2"
                      />
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-gray-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                          />
                        </svg>
                        <span className="text-gray-500 text-sm">Click to upload poster</span>
                        <span className="text-gray-400 text-xs mt-1">PNG, JPG up to 5MB</span>
                      </>
                    )}
                  </div>
                </label>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="text-sm font-medium mb-1">Time *</div>
                    <input
                      type="time"
                      name="time"
                      value={newEvent.time}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
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
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div
                    className="w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-6 hover:bg-mist/50 transition"
                    style={{ borderColor: colors.mist }}
                  >
                    {editingEvent.posterPreview ? (
                      <img
                        src={editingEvent.posterPreview}
                        alt="Event poster preview"
                        className="w-full h-48 object-cover rounded-xl mb-2"
                      />
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-gray-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                          />
                        </svg>
                        <span className="text-gray-500 text-sm">Click to upload poster</span>
                      </>
                    )}
                  </div>
                </label>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="text-sm font-medium mb-1">Time *</div>
                    <input
                      type="time"
                      name="time"
                      value={editingEvent.time}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-plum focus:ring-1 focus:ring-plum text-sm"
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
                className="px-6 py-2 rounded-lg text-white hover:opacity-90 transition text-sm"
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
            {/* Event Header */}
            <div className="flex justify-between items-start">
              {getEventStatusBadge(event)}
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {event.category}
              </span>
            </div>

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
              <div className="font-semibold text-lg">{event.title}</div>
              <div className="text-sm text-gray-600 line-clamp-2">{event.description}</div>
              <div className="text-xs opacity-70">
                {event.time} • {event.location}
              </div>
              {event.maxAttendees && (
                <div className="text-xs text-gray-500">
                  Max attendees: {event.maxAttendees}
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
                <button
                  onClick={() => handleEdit(event)}
                  className="rounded-lg px-3 py-1 text-sm hover:bg-blue-100 transition-colors flex items-center gap-1 text-blue-600"
                >
                  <Edit3 size={14} />
                </button>
                {event.status === 'upcoming' && (
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
                >
                  <Trash2 size={14} />
                </button>
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
    </Card>
  );
}

//====== Posts Page ======//
function PostsPage() {
  
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

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [societyLogo, setSocietyLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [formData, setFormData] = useState({
    societyName: "AI & Robotics Society",
    category: "Technology",
    description: "We host weekly workshops on ML, robotics, and hack nights.",
    adminName: "John",
    adminSurname: "Doe",
    email: "admin@airobotics.com",
    password: "",
    confirmPassword: ""
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

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

    const errors = validateForm(tab);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSaveStatus("saving");

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updateData = {
        ...formData,
        logo: societyLogo,
        lastUpdated: new Date().toISOString(),
        updatedBy: "Society Admin"
      };

      console.log("Saving society profile:", updateData);
      
      setSaveStatus("success");
      
      setTimeout(() => {
        setSaveStatus("");
      }, 3000);

    } catch (error) {
      setSaveStatus("error");
      setValidationErrors({ submit: "Failed to save changes. Please try again." });
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

  return (
    <Card 
      title="Society Account Management" 
      subtitle="Update society profile, security settings, and preferences"
    >
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



function MetricsPage() {
  return (
    <Card title="Participation Metrics" subtitle="Engagement across members and content">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {mockParticipation.map((m) => (
            <div key={m.label} className="p-3 rounded-2xl" style={{ background: colors.paper }}>
              <div className="text-sm mb-2">{m.label} <span className="opacity-60">— {m.value}%</span></div>
              <div className="h-2 rounded-full" style={{ background: colors.mist }}>
                <div className="h-2 rounded-full" style={{ width: `${m.value}%`, background: colors.plum }} />
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-2xl" style={{ background: colors.paper }}>
          <div className="font-medium mb-2">Top active members</div>
          <ul className="text-sm space-y-2">
            <li>• Ayesha — 12 comments, 3 posts</li>
            <li>• Liam — 9 comments, 1 post</li>
            <li>• Zinhle — 7 comments, 2 posts</li>
            <li>• Carlos — 5 comments, 1 post</li>
          </ul>
        </div>
      </div>
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
      {page === "requests" && <RequestsPage />}
      {page === "settings" && <SettingsPage />}
      {page === "metrics" && <MetricsPage />}
    </Shell>
  );
}

