import React, { useEffect, useMemo, useState } from "react";
import { Download, RotateCw } from "lucide-react";
import jsPDF from "jspdf";
import { fetchAdminReports, updateAdminReport } from "@/services/admin.js";

const statusLabels = {
  open: "Open",
  in_review: "In Review",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const statusOptions = ["all", "open", "in_review", "resolved", "dismissed"];

function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ value }) {
  const tone = {
    open: "bg-orange-100 text-orange-700",
    in_review: "bg-amber-100 text-amber-700",
    resolved: "bg-emerald-100 text-emerald-700",
    dismissed: "bg-gray-200 text-gray-700",
  }[value] || "bg-gray-200 text-gray-700";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {statusLabels[value] || value}
    </span>
  );
}

export default function ReportsPanel() {
  const [statusFilter, setStatusFilter] = useState("open");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAdminReports(statusFilter === "all" ? {} : { status: statusFilter })
      .then((data) => {
        if (!cancelled) setReports(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load reports");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [statusFilter, refreshKey]);

  const counts = useMemo(() => {
    return reports.reduce(
      (acc, report) => {
        acc.total += 1;
        const key = report.status;
        if (acc[key] == null) acc[key] = 0;
        acc[key] += 1;
        return acc;
      },
      { total: 0 }
    );
  }, [reports]);

  const handleStatusUpdate = async (reportId, nextStatus) => {
    try {
      setUpdatingId(reportId);
      await updateAdminReport(reportId, { status: nextStatus });
      setReports((prev) =>
        prev.map((report) =>
          report.reportId === reportId ? { ...report, status: nextStatus, updatedAt: new Date().toISOString() } : report
        )
      );
    } catch (err) {
      setError(err?.message || "Unable to update report status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePdfDownload = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt" });
    const marginLeft = 40;
    let y = 60;

    doc.setFontSize(16);
    doc.text("PukkeConnect Reports", marginLeft, y);
    doc.setFontSize(10);
    doc.text(`Generated: ${formatDate(new Date().toISOString())}`, marginLeft, (y += 18));
    doc.text(`Filter: ${statusFilter === "all" ? "All statuses" : statusLabels[statusFilter] || statusFilter}`, marginLeft, (y += 14));

    y += 16;
    doc.setFontSize(9.5);
    doc.text("ID", marginLeft, y);
    doc.text("Status", marginLeft + 70, y);
    doc.text("Target", marginLeft + 140, y);
    doc.text("Reason", marginLeft + 220, y);
    doc.text("Submitted", marginLeft + 460, y);

    y += 12;
    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, marginLeft + 520, y);

    doc.setFontSize(9);
    reports.forEach((report) => {
      y += 16;
      if (y > 760) {
        doc.addPage();
        y = 60;
      }
      const reason = (report.reason || "").slice(0, 70);
      doc.text(String(report.reportId || report.report_id || "?"), marginLeft, y);
      doc.text(statusLabels[report.status] || report.status, marginLeft + 70, y);
      doc.text(`${report.targetType || ""} #${report.targetId || ""}`.trim(), marginLeft + 140, y);
      doc.text(reason, marginLeft + 220, y, { maxWidth: 220 });
      doc.text(formatDate(report.createdAt), marginLeft + 460, y);
    });

    doc.save("pukkeconnect-reports.pdf");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {statusOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatusFilter(option)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === option
                  ? "border-[#6a509b] bg-[#6a509b] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {option === "all" ? "All" : statusLabels[option] || option}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
            disabled={loading}
          >
            <RotateCw size={16} className={loading ? "animate-spin" : undefined} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handlePdfDownload}
            className="flex items-center gap-2 rounded-xl bg-[#6a509b] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5b4586]"
            disabled={!reports.length}
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 text-center">
          <div className="text-2xl font-semibold text-gray-900">{counts.total ?? 0}</div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Total Reports</div>
        </div>
        {(["open", "in_review", "resolved", "dismissed"]).map((key) => (
          <div key={key} className="rounded-2xl border border-gray-200 bg-white p-3 text-center">
            <div className="text-2xl font-semibold text-gray-900">{counts[key] ?? 0}</div>
            <div className="text-xs uppercase tracking-wide text-gray-500">{statusLabels[key]}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Report</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Reporter</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse border-b last:border-0">
                  {Array.from({ length: 6 }).map((__, cell) => (
                    <td key={cell} className="px-4 py-3">
                      <div className="h-3 rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No reports for the selected filter.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.reportId} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">#{report.reportId}</div>
                    <div className="text-xs text-gray-500">Updated {formatDate(report.updatedAt)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={report.status} />
                    <div className="mt-2">
                      <select
                        value={report.status}
                        onChange={(event) => handleStatusUpdate(report.reportId, event.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-2 py-1 text-xs text-gray-600 focus:border-[#6a509b] focus:outline-none"
                        disabled={updatingId === report.reportId}
                      >
                        {Object.keys(statusLabels).map((key) => (
                          <option key={key} value={key}>
                            {statusLabels[key]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {report.targetType || "Unknown"}
                    <div className="text-xs text-gray-500">ID: {report.targetId || "?"}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="max-w-xs truncate" title={report.reason || ""}>
                      {report.reason || "No description"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {report.reporterId || "Anonymous"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(report.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}