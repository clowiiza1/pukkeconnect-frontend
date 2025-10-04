import React, { useEffect, useState } from "react";
import { Users, Building2, Calendar, MessageSquare, TrendingUp, Activity } from "lucide-react";
import { fetchAdminStats } from "@/services/admin.js";

const colors = {
  paper: "#e7e7e7",
  mist: "#d2d3de",
  lilac: "#ac98cd",
  plum: "#6a509b",
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      setError(err?.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-3xl" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadStats}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Users",
      value: stats?.users || 0,
      icon: <Users size={24} />,
      color: colors.plum,
      description: "Registered platform users",
    },
    {
      label: "Active Societies",
      value: stats?.societies || 0,
      icon: <Building2 size={24} />,
      color: colors.lilac,
      description: "Societies on the platform",
    },
    {
      label: "Total Events",
      value: stats?.events || 0,
      icon: <Calendar size={24} />,
      color: "#8b7ba8",
      description: "Events created across all societies",
    },
    {
      label: "Total Posts",
      value: stats?.posts || 0,
      icon: <MessageSquare size={24} />,
      color: "#7a6393",
      description: "Posts across all societies",
    },
    {
      label: "Event RSVPs",
      value: stats?.rsvps || 0,
      icon: <TrendingUp size={24} />,
      color: "#9b8bb5",
      description: "Total event registrations",
    },
    {
      label: "Active Memberships",
      value: stats?.memberships || 0,
      icon: <Users size={24} />,
      color: "#6a509b",
      description: "Active society memberships",
    },
  ];

  const engagementRate = stats?.users > 0 ? ((stats?.rsvps / stats?.users) * 100).toFixed(1) : 0;
  const avgEventsPerSociety = stats?.societies > 0 ? (stats?.events / stats?.societies).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border p-6" style={{ borderColor: colors.mist, background: "white" }}>
        <div className="flex items-center gap-3 mb-2">
          <Activity size={28} style={{ color: colors.plum }} />
          <h2 className="text-2xl font-bold" style={{ color: colors.plum }}>
            Platform Analytics
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          Comprehensive overview of platform performance and user engagement
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="rounded-3xl p-6 text-white"
            style={{ background: metric.color }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-full bg-white/20 p-3">{metric.icon}</div>
              <div className="text-right">
                <div className="text-3xl font-bold">{metric.value.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-white/90 font-semibold">{metric.label}</div>
            <div className="text-xs text-white/70 mt-1">{metric.description}</div>
          </div>
        ))}
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Overview */}
        <div
          className="rounded-3xl p-6"
          style={{ borderColor: colors.mist, background: "white", border: `1px solid ${colors.mist}` }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.plum }}>
            Engagement Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: colors.paper }}>
              <div>
                <div className="text-sm text-gray-600">User Engagement Rate</div>
                <div className="text-xs text-gray-500 mt-1">RSVPs per user</div>
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.plum }}>
                {engagementRate}%
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: colors.paper }}>
              <div>
                <div className="text-sm text-gray-600">Avg Events per Society</div>
                <div className="text-xs text-gray-500 mt-1">Events created</div>
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.plum }}>
                {avgEventsPerSociety}
              </div>
            </div>
          </div>
        </div>

        {/* Platform Health */}
        <div
          className="rounded-3xl p-6"
          style={{ borderColor: colors.mist, background: "white", border: `1px solid ${colors.mist}` }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.plum }}>
            Platform Health
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Societies</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 rounded-full overflow-hidden" style={{ background: colors.mist }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((stats?.societies / 150) * 100, 100)}%`,
                      background: colors.lilac
                    }}
                  />
                </div>
                <span className="text-sm font-semibold">{stats?.societies || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Events</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 rounded-full overflow-hidden" style={{ background: colors.mist }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((stats?.events / 100) * 100, 100)}%`,
                      background: "#8b7ba8"
                    }}
                  />
                </div>
                <span className="text-sm font-semibold">{stats?.events || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">User Base</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 rounded-full overflow-hidden" style={{ background: colors.mist }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((stats?.users / 5000) * 100, 100)}%`,
                      background: colors.plum
                    }}
                  />
                </div>
                <span className="text-sm font-semibold">{stats?.users || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div
        className="rounded-3xl p-6"
        style={{ borderColor: colors.mist, background: "white", border: `1px solid ${colors.mist}` }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.plum }}>
          Platform Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl" style={{ background: colors.paper }}>
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={20} style={{ color: colors.plum }} />
              <span className="text-sm font-semibold text-gray-700">Events</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Total Events:</span>
                <span className="font-semibold">{stats?.events || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Event RSVPs:</span>
                <span className="font-semibold">{stats?.rsvps || 0}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: colors.paper }}>
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare size={20} style={{ color: colors.plum }} />
              <span className="text-sm font-semibold text-gray-700">Posts</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Total Posts:</span>
                <span className="font-semibold">{stats?.posts || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Posts/Society:</span>
                <span className="font-semibold">{stats?.societies > 0 ? (stats.posts / stats.societies).toFixed(1) : 0}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: colors.paper }}>
            <div className="flex items-center gap-3 mb-2">
              <Building2 size={20} style={{ color: colors.plum }} />
              <span className="text-sm font-semibold text-gray-700">Communities</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Active Societies:</span>
                <span className="font-semibold">{stats?.societies || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Members:</span>
                <span className="font-semibold">{stats?.memberships || 0}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: colors.paper }}>
            <div className="flex items-center gap-3 mb-2">
              <Users size={20} style={{ color: colors.plum }} />
              <span className="text-sm font-semibold text-gray-700">Users</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Total Users:</span>
                <span className="font-semibold">{stats?.users || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Engagement Rate:</span>
                <span className="font-semibold">{engagementRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
