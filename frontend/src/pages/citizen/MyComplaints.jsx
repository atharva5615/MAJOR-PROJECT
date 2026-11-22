import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  MapPin,
  CalendarDays,
  ClipboardList,
  Plus,
  Eye,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

function MyComplaints() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchMyComplaints = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/issues/my-issues");

        const records = Array.isArray(response.data)
          ? response.data
          : response.data?.items || response.data?.issues || [];

        if (active) {
          setComplaints(records);
        }
      } catch (err) {
        console.error("My complaints loading error:", err);

        if (active) {
          const detail = err.response?.data?.detail;

          if (err.response?.status === 401) {
            setError("Your session has expired. Please log in again.");
          } else if (err.response?.status === 403) {
            setError("You do not have permission to view these complaints.");
          } else {
            setError(
              typeof detail === "string"
                ? detail
                : "Unable to load your complaints. Please try again."
            );
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMyComplaints();

    return () => {
      active = false;
    };
  }, []);

  const getStatusLabel = (status) => {
    const normalized = (status || "").toLowerCase();

    if (normalized === "reported" || normalized === "pending") return "Pending";
    if (normalized === "in_progress" || normalized === "in progress") {
      return "In Progress";
    }
    if (normalized === "resolved") return "Resolved";

    return status || "Unknown";
  };

  const getStatusStyle = (status) => {
    switch (getStatusLabel(status)) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatReference = (complaint) => {
    const date = complaint.created_at
      ? new Date(complaint.created_at)
      : new Date();
    const year = Number.isNaN(date.getTime())
      ? new Date().getFullYear()
      : date.getFullYear();

    return `CIV-${year}-${String(complaint.id).padStart(3, "0")}`;
  };

  const formatDate = (value) => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredComplaints = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const reference = formatReference(complaint).toLowerCase();
      const title = (complaint.title || "").toLowerCase();
      const category = (complaint.category || "").toLowerCase();
      const status = getStatusLabel(complaint.status);

      const matchesSearch =
        !query ||
        reference.includes(query) ||
        String(complaint.id).includes(query) ||
        title.includes(query) ||
        category.includes(query);

      const matchesStatus =
        selectedStatus === "All" || status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchTerm, selectedStatus]);

  const counts = useMemo(() => {
    const statuses = complaints.map((complaint) =>
      getStatusLabel(complaint.status)
    );

    return {
      total: complaints.length,
      pending: statuses.filter((status) => status === "Pending").length,
      inProgress: statuses.filter((status) => status === "In Progress").length,
      resolved: statuses.filter((status) => status === "Resolved").length,
    };
  }, [complaints]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={22} />
            </Link>

            <div>
              <h1 className="text-xl font-bold text-blue-700">CivicAI</h1>
              <p className="text-xs text-slate-500">Citizen Portal</p>
            </div>
          </div>

          <Link
            to="/report-issue"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Report Issue</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        {/* Page Heading */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-blue-600">
            <ClipboardList size={24} />
            <span className="font-semibold">Complaint Management</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900">My Complaints</h2>

          <p className="mt-2 text-slate-500">
            View your submitted complaints and track their progress.
          </p>
        </div>

        {/* Summary Cards: counts come from fetched backend records */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total Complaints</p>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "—" : counts.total}
            </h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Pending</p>
            <h3 className="mt-2 text-3xl font-bold text-yellow-600">
              {loading ? "—" : counts.pending}
            </h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">In Progress</p>
            <h3 className="mt-2 text-3xl font-bold text-blue-600">
              {loading ? "—" : counts.inProgress}
            </h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Resolved</p>
            <h3 className="mt-2 text-3xl font-bold text-green-600">
              {loading ? "—" : counts.resolved}
            </h3>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by complaint ID, title or category..."
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Complaint List */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="font-bold text-slate-900">Complaint History</h3>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? "Loading complaints..." : `${filteredComplaints.length} complaints found`}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-14 text-slate-500">
              <LoaderCircle size={22} className="animate-spin text-blue-600" />
              Loading your complaints...
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <AlertCircle size={38} className="mx-auto text-red-500" />
              <h3 className="mt-4 font-semibold text-slate-800">
                Could not load complaints
              </h3>
              <p className="mt-2 text-sm text-slate-600">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <ClipboardList size={40} className="mx-auto text-slate-300" />
              <h3 className="mt-4 font-semibold text-slate-700">
                {complaints.length === 0
                  ? "You haven't submitted any complaints yet"
                  : "No complaints found"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {complaints.length === 0
                  ? "Report a civic issue to see it listed here."
                  : "Try another search term or status filter."}
              </p>
              {complaints.length === 0 && (
                <Link
                  to="/report-issue"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={17} />
                  Report an Issue
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredComplaints.map((complaint) => {
                const statusLabel = getStatusLabel(complaint.status);

                return (
                  <div
                    key={complaint.id}
                    className="p-6 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm font-bold text-blue-700">
                            {formatReference(complaint)}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              complaint.status
                            )}`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <h4 className="mt-3 text-lg font-bold text-slate-900">
                          {complaint.title || "Untitled complaint"}
                        </h4>

                        <p className="mt-1 text-sm text-slate-500">
                          Category: {complaint.category || "Not specified"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={15} />
                            {complaint.address ||
                              (complaint.latitude != null && complaint.longitude != null
                                ? `${complaint.latitude}, ${complaint.longitude}`
                                : "Location not provided")}
                          </span>

                          <span className="flex items-center gap-1">
                            <CalendarDays size={15} />
                            {formatDate(complaint.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center md:justify-end">
                        <Link
                          to={`/complaint/${complaint.id}`}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 md:w-auto"
                        >
                          <Eye size={17} />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MyComplaints;
