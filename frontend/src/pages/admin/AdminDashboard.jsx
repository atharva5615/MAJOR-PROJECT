
import { useState } from "react";
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
  Building2,
  TrendingUp,
} from "lucide-react";

function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Temporary demonstration data.
  // Later, this will come from the FastAPI backend.
  const complaints = [
    {
      id: "CIV-2026-001",
      title: "Large pothole near main road",
      category: "Road Damage",
      location: "Pune, Maharashtra",
      date: "04 Nov 2026",
      priority: "High",
      aiScore: 85,
      status: "In Progress",
    },
    {
      id: "CIV-2026-002",
      title: "Garbage accumulation near residential area",
      category: "Garbage",
      location: "Pune, Maharashtra",
      date: "02 Nov 2026",
      priority: "Medium",
      aiScore: 52,
      status: "Pending",
    },
    {
      id: "CIV-2026-003",
      title: "Streetlight not working",
      category: "Streetlight",
      location: "Pune, Maharashtra",
      date: "30 Oct 2026",
      priority: "Low",
      aiScore: 28,
      status: "Resolved",
    },
    {
      id: "CIV-2026-004",
      title: "Water leakage on roadside",
      category: "Water Leakage",
      location: "Pune, Maharashtra",
      date: "28 Oct 2026",
      priority: "Critical",
      aiScore: 91,
      status: "Pending",
    },
  ];

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" ||
      complaint.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getPriorityStyle = (priority) => {
    switch (priority) {
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
      value: complaints.filter((c) => c.status === "Pending").length,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "In Progress",
      value: complaints.filter((c) => c.status === "In Progress").length,
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Resolved",
      value: complaints.filter((c) => c.status === "Resolved").length,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

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
            <h1 className="text-2xl font-bold text-blue-400">CivicAI</h1>
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

          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-800"
          >
            <LogOut size={19} />
            Back to Home
          </Link>

        </nav>

        <div className="border-t border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-semibold">Administrator</p>
              <p className="text-xs text-slate-400">Authority Account</p>
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
                        {stat.value}
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
                    {complaints.filter((c) => c.priority === "Critical").length}
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
                    Total Supporting Citizens
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    28
                  </h3>
                </div>
              </div>
            </div>

          </section>

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

            {/* Complaints Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">

                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Complaint</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">AI Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-slate-50">

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {complaint.id}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {complaint.title}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={13} />
                          {complaint.location}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {complaint.category}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityStyle(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {complaint.aiScore}/100
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(complaint.status)}`}>
                          {complaint.status}
                        </span>
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
                        colSpan="6"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        No complaints found.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>

          </section>

          {/* Information */}
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm leading-6 text-blue-800">
              <strong>Demonstration:</strong> Complaint information,
              AI scores and statistics shown here are sample data.
              Real complaint management will be connected through
              the FastAPI backend.
            </p>
          </div>

        </main>

      </div>
    </div>
  );
}

export default AdminDashboard;
