
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  MapPin,
  LogOut,
  Menu,
  X,
  Filter,
  Eye,
  TrendingUp,
} from "lucide-react";
import api from "../../services/api";
import AdminComplaintMap from "./AdminComplaintMap";

function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch complaints from FastAPI
  useEffect(() => {
    let cancelled = false;

    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/issues/", {
          params: { limit: 100 },
        });

        if (!cancelled) {
          setComplaints(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          const detail = err.response?.data?.detail;

          setError(
            typeof detail === "string"
              ? detail
              : "Unable to load complaints. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchComplaints();

    return () => {
      cancelled = true;
    };
  }, []);

  // Convert backend status into dashboard labels
  const getDisplayStatus = (status) => {
    const normalized = status?.toLowerCase();

    if (normalized === "reported") return "Pending";
    if (normalized === "in_progress") return "In Progress";
    if (normalized === "resolved") return "Resolved";

    return status || "Unknown";
  };

  // Format priority
  const getDisplayPriority = (priority) => {
    return priority
      ? priority.charAt(0).toUpperCase() +
          priority.slice(1).toLowerCase()
      : "Unknown";
  };

  // Generate readable complaint reference
  // Database ID remains the actual API identifier
  const getComplaintReference = (complaint) => {
    const year = complaint.created_at
      ? new Date(complaint.created_at).getFullYear()
      : new Date().getFullYear();

    return `CIV-${year}-${String(complaint.id).padStart(3, "0")}`;
  };

  // Format complaint location
  const getComplaintLocation = (complaint) => {
    if (complaint.address) {
      return complaint.address;
    }

    if (
      complaint.latitude != null &&
      complaint.longitude != null
    ) {
      return `${complaint.latitude}, ${complaint.longitude}`;
    }

    return "Location unavailable";
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((complaint) => {
    const reference = getComplaintReference(complaint);

    const matchesSearch =
      reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (complaint.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (complaint.category || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" ||
      getDisplayStatus(complaint.status) === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Priority styling
  const getPriorityStyle = (priority) => {
    switch (getDisplayPriority(priority)) {
      case "Critical":
        return "bg-red-100 text-red-700";
      case "High":
        return "bg-orange-100 text-orange-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Status styling
  const getStatusStyle = (status) => {
    switch (status) {
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

  // Calculate statistics from actual complaints
  const stats = [
    {
      title: "Total Complaints",
      value: complaints.length,
      icon: ClipboardList,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Pending",
      value: complaints.filter(
        (c) => getDisplayStatus(c.status) === "Pending"
      ).length,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "In Progress",
      value: complaints.filter(
        (c) => getDisplayStatus(c.status) === "In Progress"
      ).length,
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Resolved",
      value: complaints.filter(
        (c) => getDisplayStatus(c.status) === "Resolved"
      ).length,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  const criticalCount = complaints.filter(
    (c) => getDisplayPriority(c.priority) === "Critical"
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 md:flex">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 text-white transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">
              CivicAI
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Authority Portal
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 md:hidden"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">

          <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Main Menu
          </div>

          <a
            href="#overview"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </a>

          <a
            href="#complaints"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-800"
          >
            <ClipboardList size={19} />
            All Complaints
          </a>

          <a
            href="#complaints"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-800"
          >
            <AlertTriangle size={19} />
            High Priority
          </a>

          <div className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Account
          </div>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-800"
          >
            <LogOut size={19} />
            Logout
          </button>

        </nav>

        <div className="border-t border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-semibold">
                Administrator
              </p>
              <p className="text-xs text-slate-400">
                Authority Account
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-w-0 flex-1">

        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-8">

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Authority Dashboard
              </h2>
              <p className="hidden text-sm text-slate-500 sm:block">
                Manage and monitor civic complaints
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-600 sm:block">
              Municipal Administrator
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              A
            </div>
          </div>

        </header>

        <main className="p-5 md:p-8">

          {/* Overview */}
          <section id="overview" className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900">
              Overview
            </h3>
            <p className="mt-2 text-slate-500">
              Monitor reported civic issues and their resolution status.
            </p>
          </section>

          {/* Statistics */}
          <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                        {stat.title}
                      </p>
                      <h3 className="mt-2 text-3xl font-bold text-slate-900">
                        {loading ? "—" : stat.value}
                      </h3>
                    </div>

                    <div className={`rounded-xl p-3 ${stat.bg}`}>
                      <Icon size={25} className={stat.color} />
                    </div>
                  </div>
                </div>
              );
            })}

          </section>

          {/* Priority Summary */}
          <section className="mb-8 grid gap-5 md:grid-cols-2">

            <div className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-50 p-3">
                  <AlertTriangle className="text-red-600" size={23} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">
                    Critical Complaints
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {loading ? "—" : criticalCount}
                  </h3>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-3">
                  <Users className="text-blue-600" size={23} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">
                    Supporting Citizens
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    N/A
                  </h3>
                  <p className="text-xs text-slate-400">
                    Not provided by current API
                  </p>
                </div>
              </div>
            </div>

          </section>

          <AdminComplaintMap />

          {/* Complaint Management */}
          <section
            id="complaints"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >

            <div className="border-b border-slate-200 p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Complaint Management
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Review and monitor submitted complaints.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">

                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search complaints..."
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-600 sm:w-64"
                    />
                  </div>

                  <div className="relative">
                    <Filter
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-blue-600 sm:w-44"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <p className="p-8 text-center text-slate-500">
                Loading complaints...
              </p>
            )}

            {/* Error State */}
            {error && (
              <div className="m-6 rounded-lg bg-red-50 p-4 text-red-700">
                {error}
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="ml-3 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Complaints Table */}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">

                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Complaint</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">AI Score</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Duplicate Review</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredComplaints.map((complaint) => (
                      <tr key={complaint.id} className="hover:bg-slate-50">

                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">
                            {getComplaintReference(complaint)}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {complaint.title}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                            <MapPin size={13} />
                            {getComplaintLocation(complaint)}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {complaint.category}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityStyle(complaint.priority)}`}
                          >
                            {getDisplayPriority(complaint.priority)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-500">
                            N/A
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(getDisplayStatus(complaint.status))}`}
                          >
                            {getDisplayStatus(complaint.status)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {complaint.duplicate_reviews?.length > 0 ? (
                            <div className="space-y-2">
                              {complaint.duplicate_reviews.map((review) => (
                                <div
                                  key={review.related_issue_id}
                                  className="flex flex-col items-start gap-2"
                                >
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                      review.decision === "confirmed"
                                        ? "bg-green-100 text-green-700"
                                        : review.decision === "rejected"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    {review.decision === "confirmed"
                                      ? "Confirmed Duplicate"
                                      : review.decision === "rejected"
                                      ? "Rejected Match"
                                      : "Unknown Decision"}
                                  </span>

                                  <Link
                                    to={`/admin/complaints/${review.related_issue_id}`}
                                    className="text-xs font-medium text-blue-600 hover:underline"
                                  >
                                    Related Complaint #{review.related_issue_id}
                                  </Link>

                                  {review.reviewed_at && (
                                    <span className="text-xs text-slate-400">
                                      Reviewed:{" "}
                                      {new Date(review.reviewed_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No review recorded
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <Link
                            to={`/admin/complaints/${complaint.id}`}
                            className="flex items-center gap-2 rounded-lg border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                          >
                            <Eye size={16} />
                            Review
                          </Link>
                        </td>

                      </tr>
                    ))}

                    {filteredComplaints.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          No complaints found.
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              </div>
            )}

          </section>

          {/* Information */}
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm leading-6 text-blue-800">
              <strong>Live data:</strong> Complaint information,
              priorities and statistics are retrieved from the CivicAI
              backend. AI scores and supporting citizen counts are
              not yet provided by the current API.
            </p>
          </div>

        </main>

      </div>
    </div>
  );
}

export default AdminDashboard;
