import React, { useState, useEffect } from "react";
import { Bell, Send, Users, Building2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { fetchAdminSocieties } from "@/services/admin.js";
import { api, asApiError } from "@/services/apis.jsx";

const colors = {
  paper: "#e7e7e7",
  mist: "#d2d3de",
  lilac: "#ac98cd",
  plum: "#6a509b",
};

export default function AnnouncementsPage() {
  const [societies, setSocieties] = useState([]);
  const [selectedAudience, setSelectedAudience] = useState("all");
  const [selectedSociety, setSelectedSociety] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSocieties, setLoadingSocieties] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadSocieties();
  }, []);

  const loadSocieties = async () => {
    try {
      setLoadingSocieties(true);
      // Fetch all societies with a high limit
      const data = await fetchAdminSocieties({ limit: 100 });
      setSocieties(data?.data || []);
    } catch (err) {
      console.error("Failed to load societies:", err);
    } finally {
      setLoadingSocieties(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      setResult({ type: "error", message: "Please enter a message" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let recipientIds = [];

      // Fetch all users by paginating
      const fetchAllUsers = async () => {
        let allUsers = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await api.get("/admin/users", { params: { page, limit: 100 } });
          allUsers = [...allUsers, ...response.data.data];
          hasMore = response.data.data.length === 100 && allUsers.length < response.data.total;
          page++;
        }

        return allUsers;
      };

      if (selectedAudience === "all") {
        // Send to all users
        const allUsers = await fetchAllUsers();
        recipientIds = allUsers.map(u => u.id);
      } else if (selectedAudience === "society" && selectedSociety) {
        // Find the selected society's name
        const selectedSocietyData = societies.find(s =>
          (s.societyId || s.id) === selectedSociety
        );

        if (!selectedSocietyData) {
          setResult({ type: "error", message: "Selected society not found" });
          setLoading(false);
          return;
        }

        // Get all users and filter by society NAME
        const allUsers = await fetchAllUsers();

        // Filter users who are members of the selected society by NAME
        recipientIds = allUsers
          .filter(user =>
            user.societies?.some(s => s.name === selectedSocietyData.name)
          )
          .map(user => user.id);
      }

      if (recipientIds.length === 0) {
        setResult({ type: "error", message: "No recipients found" });
        setLoading(false);
        return;
      }

      // Send notification
      await api.post("/notifications/send", {
        recipientIds,
        type: "announcement",
        message: message.trim(),
      });

      setResult({
        type: "success",
        message: `Successfully sent announcement to ${recipientIds.length} ${recipientIds.length === 1 ? 'user' : 'users'}`,
      });
      setMessage("");
    } catch (err) {
      setResult({
        type: "error",
        message: asApiError(err)?.message || "Failed to send announcement",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border p-6" style={{ borderColor: colors.mist, background: "white" }}>
        <div className="flex items-center gap-3 mb-2">
          <Bell size={28} style={{ color: colors.plum }} />
          <h2 className="text-2xl font-bold" style={{ color: colors.plum }}>
            Send Announcements
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          Send notifications and announcements to all users or specific society members
        </p>
      </div>

      {/* Send Announcement Form */}
      <div
        className="rounded-3xl p-6"
        style={{ borderColor: colors.mist, background: "white", border: `1px solid ${colors.mist}` }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.plum }}>
          Create Announcement
        </h3>

        <div className="space-y-4">
          {/* Audience Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Select Audience
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedAudience("all");
                  setSelectedSociety("");
                }}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  selectedAudience === "all"
                    ? "border-opacity-100"
                    : "border-opacity-0 hover:border-opacity-50"
                }`}
                style={{
                  borderColor: selectedAudience === "all" ? colors.plum : colors.mist,
                  background: selectedAudience === "all" ? `${colors.lilac}15` : colors.paper,
                }}
              >
                <div className="flex items-center gap-3">
                  <Users size={24} style={{ color: colors.plum }} />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">All Users</div>
                    <div className="text-xs text-gray-600">Send to entire platform</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedAudience("society")}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  selectedAudience === "society"
                    ? "border-opacity-100"
                    : "border-opacity-0 hover:border-opacity-50"
                }`}
                style={{
                  borderColor: selectedAudience === "society" ? colors.plum : colors.mist,
                  background: selectedAudience === "society" ? `${colors.lilac}15` : colors.paper,
                }}
              >
                <div className="flex items-center gap-3">
                  <Building2 size={24} style={{ color: colors.plum }} />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Specific Society</div>
                    <div className="text-xs text-gray-600">Send to society members</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Society Selection */}
          {selectedAudience === "society" && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Choose Society
              </label>
              <select
                value={selectedSociety}
                onChange={(e) => setSelectedSociety(e.target.value)}
                className="w-full rounded-2xl border px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2"
                style={{ borderColor: colors.mist, focusRing: colors.lilac }}
                disabled={loadingSocieties}
              >
                <option value="">Select a society</option>
                {societies.map((society) => (
                  <option key={society.societyId || society.id} value={society.societyId || society.id}>
                    {society.name} ({society.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Message Input */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Announcement Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your announcement message here..."
              rows={6}
              maxLength={2000}
              className="w-full rounded-2xl border px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: colors.mist }}
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {message.length} / 2000 characters
            </div>
          </div>

          {/* Result Message */}
          {result && (
            <div
              className={`rounded-2xl p-4 flex items-center gap-3 ${
                result.type === "success"
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              } border`}
            >
              {result.type === "success" ? (
                <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              )}
              <span
                className={`text-sm font-medium ${
                  result.type === "success" ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {result.message}
              </span>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={
              loading ||
              !message.trim() ||
              (selectedAudience === "society" && !selectedSociety)
            }
            className="w-full rounded-2xl px-6 py-3 font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: colors.plum }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={20} />
                Send Announcement
              </>
            )}
          </button>
        </div>
      </div>

      {/* Usage Tips */}
      <div
        className="rounded-3xl p-6"
        style={{ borderColor: colors.mist, background: "white", border: `1px solid ${colors.mist}` }}
      >
        <h3 className="text-lg font-semibold mb-3" style={{ color: colors.plum }}>
          Usage Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-lg" style={{ color: colors.plum }}>•</span>
            <span>
              <strong>All Users:</strong> Sends announcement to every registered user on the platform
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg" style={{ color: colors.plum }}>•</span>
            <span>
              <strong>Specific Society:</strong> Sends announcement only to members of the selected society
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg" style={{ color: colors.plum }}>•</span>
            <span>
              Keep messages clear and concise for better engagement (max 2000 characters)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg" style={{ color: colors.plum }}>•</span>
            <span>
              Users will receive notifications in their notification feed
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
