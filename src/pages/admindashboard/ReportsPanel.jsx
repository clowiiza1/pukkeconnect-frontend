import React, { useEffect, useState } from "react";
import { Download, Filter, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "@/services/apis.jsx";

const colors = {
  paper: "#e7e7e7",
  mist: "#d2d3de",
  lilac: "#ac98cd",
  plum: "#6a509b",
};

const reportTypes = [
  { value: "societies", label: "Societies Report", description: "Overview of all societies, members, and activity" },
  { value: "events", label: "Events Report", description: "Event statistics, RSVPs, and attendance" },
  { value: "users", label: "Users Report", description: "User registrations, roles, and campus distribution" },
  { value: "posts", label: "Posts Report", description: "Post activity and engagement across societies" },
  { value: "memberships", label: "Memberships Report", description: "Membership statistics and status breakdown" },
  { value: "engagement", label: "Engagement Report", description: "Platform-wide engagement metrics" },
];

const campusOptions = ["All", "Mafikeng", "Potchefstroom", "Vanderbijlpark"];

function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function ReportsPanel() {
  const [selectedReport, setSelectedReport] = useState("societies");
  const [campusFilter, setCampusFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReportData();
  }, [selectedReport, campusFilter, dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (campusFilter !== "All") params.campus = campusFilter;
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      let data = {};

      switch (selectedReport) {
        case "societies":
          const societies = await api.get("/admin/societies", { params: { limit: 100, ...params } });
          // Calculate stats from filtered societies data
          data = {
            societies: societies.data.data,
            total: societies.data.total,
            stats: {
              societies: societies.data.total,
              memberships: societies.data.data.reduce((sum, s) => sum + (s.memberCount || 0), 0),
            },
          };
          break;

        case "events":
          const events = await api.get("/events", { params: { limit: 100, ...params } });
          // Calculate stats from events data
          const totalRsvps = events.data.data.reduce((sum, e) => sum + (e.rsvps || 0), 0);
          data = {
            events: events.data.data,
            total: events.data.total,
            stats: {
              events: events.data.total,
              rsvps: totalRsvps,
            },
          };
          break;

        case "users":
          const users = await api.get("/admin/users", { params: { limit: 100, ...params } });
          // Calculate stats from filtered users data
          data = {
            users: users.data.data,
            total: users.data.total,
            stats: {
              users: users.data.total,
            },
          };
          break;

        case "posts":
          const posts = await api.get("/admin/posts", { params: { limit: 100, ...params } });
          data = {
            posts: posts.data.data,
            total: posts.data.total,
            stats: {
              posts: posts.data.total,
            },
          };
          break;

        case "memberships":
          const memberships = await api.get("/admin/stats");
          data = {
            stats: memberships.data,
          };
          break;

        case "engagement":
          const engagement = await api.get("/admin/stats");
          data = {
            stats: engagement.data,
          };
          break;
      }

      setReportData(data);
    } catch (err) {
      console.error("Failed to load report data:", err);
      setError("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(106, 80, 155); // plum color
    doc.text("PukkeConnect", 14, 20);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    const reportLabel = reportTypes.find(r => r.value === selectedReport)?.label || "Report";
    doc.text(reportLabel, 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${formatDate(new Date())}`, 14, 38);
    doc.text(`Campus Filter: ${campusFilter}`, 14, 44);
    if (dateRange.start || dateRange.end) {
      doc.text(`Date Range: ${dateRange.start || 'N/A'} to ${dateRange.end || 'N/A'}`, 14, 50);
    }

    let yPos = dateRange.start || dateRange.end ? 58 : 52;

    // Generate different content based on report type
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    switch (selectedReport) {
      case "societies":
        if (reportData?.societies) {
          doc.text("Societies Overview", 14, yPos);
          yPos += 8;

          const societyData = reportData.societies.map(s => [
            s.name,
            s.category || "N/A",
            s.campus || "N/A",
            s.status || "N/A",
            formatDate(s.createdAt),
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [["Society Name", "Category", "Campus", "Status", "Created"]],
            body: societyData,
            theme: "striped",
            headStyles: { fillColor: [106, 80, 155] },
            styles: { fontSize: 9 },
          });
        }
        break;

      case "events":
        if (reportData?.events) {
          doc.text("Events Overview", 14, yPos);
          yPos += 8;

          const eventData = reportData.events.map(e => [
            e.title,
            e.society?.name || "N/A",
            e.rsvps || 0,
            formatDate(e.startsAt),
            e.location || "N/A",
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [["Event Title", "Society", "RSVPs", "Date", "Location"]],
            body: eventData,
            theme: "striped",
            headStyles: { fillColor: [106, 80, 155] },
            styles: { fontSize: 9 },
          });
        }
        break;

      case "users":
        if (reportData?.users) {
          doc.text("Users Overview", 14, yPos);
          yPos += 8;

          const userData = reportData.users.map(u => [
            `${u.firstName} ${u.lastName}`,
            u.universityNumber,
            u.role,
            u.campus || "N/A",
            formatDate(u.createdAt),
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [["Name", "Student #", "Role", "Campus", "Registered"]],
            body: userData,
            theme: "striped",
            headStyles: { fillColor: [106, 80, 155] },
            styles: { fontSize: 9 },
          });
        }
        break;

      case "posts":
        if (reportData?.posts) {
          doc.text("Posts Overview", 14, yPos);
          yPos += 8;

          const postData = reportData.posts.map(p => [
            p.society?.name || "N/A",
            p.author ? `${p.author.firstName} ${p.author.lastName}` : "Unknown",
            p.content.substring(0, 50) + (p.content.length > 50 ? "..." : ""),
            formatDate(p.createdAt),
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [["Society", "Author", "Content", "Posted"]],
            body: postData,
            theme: "striped",
            headStyles: { fillColor: [106, 80, 155] },
            styles: { fontSize: 9 },
          });
        }
        break;

      case "memberships":
        doc.text("Membership Statistics", 14, yPos);
        yPos += 10;
        doc.setFontSize(10);
        doc.text(`Total Active Memberships: ${reportData?.stats?.memberships || 0}`, 14, yPos);
        yPos += 6;
        doc.text(`Total Societies: ${reportData?.stats?.societies || 0}`, 14, yPos);
        yPos += 6;
        doc.text(`Total Users: ${reportData?.stats?.users || 0}`, 14, yPos);
        break;

      case "engagement":
        doc.text("Platform Engagement Metrics", 14, yPos);
        yPos += 10;
        doc.setFontSize(10);
        doc.text(`Total Users: ${reportData?.stats?.users || 0}`, 14, yPos);
        yPos += 6;
        doc.text(`Total Events: ${reportData?.stats?.events || 0}`, 14, yPos);
        yPos += 6;
        doc.text(`Total RSVPs: ${reportData?.stats?.rsvps || 0}`, 14, yPos);
        yPos += 6;
        doc.text(`Total Posts: ${reportData?.stats?.posts || 0}`, 14, yPos);
        yPos += 6;
        doc.text(`Total Societies: ${reportData?.stats?.societies || 0}`, 14, yPos);
        break;
    }

    // Save PDF
    const fileName = `pukkeconnect-${selectedReport}-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const selectedReportInfo = reportTypes.find(r => r.value === selectedReport);

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <button
            key={report.value}
            onClick={() => setSelectedReport(report.value)}
            className={`p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
              selectedReport === report.value
                ? "border-opacity-100"
                : "border-opacity-0 hover:border-opacity-50"
            }`}
            style={{
              borderColor: selectedReport === report.value ? colors.plum : colors.mist,
              background: selectedReport === report.value ? `${colors.lilac}15` : "white",
            }}
          >
            <div className="font-semibold text-gray-900">{report.label}</div>
            <div className="text-xs text-gray-600 mt-1">{report.description}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div
        className="rounded-3xl p-5"
        style={{ background: "white", border: `1px solid ${colors.mist}` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} style={{ color: colors.plum }} />
          <h3 className="font-semibold" style={{ color: colors.plum }}>Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Campus</label>
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: colors.mist }}
            >
              {campusOptions.map((campus) => (
                <option key={campus} value={campus}>{campus}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: colors.mist }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: colors.mist }}
            />
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div
        className="rounded-3xl p-5"
        style={{ background: "white", border: `1px solid ${colors.mist}` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg" style={{ color: colors.plum }}>
              {selectedReportInfo?.label}
            </h3>
            <p className="text-sm text-gray-600">{selectedReportInfo?.description}</p>
          </div>
          <button
            onClick={generatePDF}
            disabled={loading || !reportData}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
            style={{ background: colors.plum }}
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm opacity-70">Loading report data...</div>
        ) : error ? (
          <div className="text-center py-12 text-sm text-red-600">{error}</div>
        ) : reportData ? (
          <div className="space-y-4">
            {/* Summary Stats */}
            {reportData.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedReport === "societies" && (
                  <>
                    <div className="rounded-2xl p-3" style={{ background: colors.paper }}>
                      <div className="text-2xl font-bold" style={{ color: colors.plum }}>{reportData.stats.societies || 0}</div>
                      <div className="text-xs text-gray-600">Total Societies</div>
                    </div>
                    <div className="rounded-2xl p-3" style={{ background: colors.paper }}>
                      <div className="text-2xl font-bold" style={{ color: colors.plum }}>{reportData.stats.memberships || 0}</div>
                      <div className="text-xs text-gray-600">Total Members</div>
                    </div>
                  </>
                )}
                {selectedReport === "events" && (
                  <>
                    <div className="rounded-2xl p-3" style={{ background: colors.paper }}>
                      <div className="text-2xl font-bold" style={{ color: colors.plum }}>{reportData.stats?.events || reportData.total || 0}</div>
                      <div className="text-xs text-gray-600">Total Events</div>
                    </div>
                    <div className="rounded-2xl p-3" style={{ background: colors.paper }}>
                      <div className="text-2xl font-bold" style={{ color: colors.plum }}>{reportData.stats?.rsvps || 0}</div>
                      <div className="text-xs text-gray-600">Total RSVPs</div>
                    </div>
                  </>
                )}
                {selectedReport === "users" && (
                  <>
                    <div className="rounded-2xl p-3" style={{ background: colors.paper }}>
                      <div className="text-2xl font-bold" style={{ color: colors.plum }}>{reportData.stats.users || 0}</div>
                      <div className="text-xs text-gray-600">Total Users</div>
                    </div>
                  </>
                )}
                {selectedReport === "posts" && (
                  <>
                    <div className="rounded-2xl p-3" style={{ background: colors.paper }}>
                      <div className="text-2xl font-bold" style={{ color: colors.plum }}>{reportData.stats?.posts || reportData.total || 0}</div>
                      <div className="text-xs text-gray-600">Total Posts</div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Data Preview */}
            <div className="text-sm text-gray-600">
              {reportData.societies && `Showing ${reportData.societies.length} of ${reportData.total} societies`}
              {reportData.events && `Showing ${reportData.events.length} of ${reportData.total} events`}
              {reportData.users && `Showing ${reportData.users.length} of ${reportData.total} users`}
              {reportData.posts && `Showing ${reportData.posts.length} of ${reportData.total} posts`}
              {(selectedReport === "memberships" || selectedReport === "engagement") && "Summary statistics ready for export"}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-sm opacity-70">No data available</div>
        )}
      </div>
    </div>
  );
}
