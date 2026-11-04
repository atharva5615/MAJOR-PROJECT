
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  MapPin,
  CalendarDays,
  ClipboardList,
  Plus,
  Eye,
} from "lucide-react";

function MyComplaints() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Temporary demonstration data.
  // Later, this will come from the backend API.
  const complaints = [
    {
      id: "CIV-2026-001",
      title: "Large pothole near main road",
      category: "Road Damage",
      location: "Pune, Maharashtra",
      date: "04 Nov 2026",
      status: "In Progress",
      supporters: 12,
    },
    {
      id: "CIV-2026-002",
      title: "Garbage accumulation near residential area",
      category: "Garbage",
      location: "Pune, Maharashtra",
      date: "02 Nov 2026",
      status: "Pending",
      supporters: 5,
    },
    {
      id: "CIV-2026-003",
      title: "Streetlight not working",
      category: "Streetlight",
      location: "Pune, Maharashtra",
      date: "30 Oct 2026",
      status: "Resolved",
      supporters: 8,
    },
    {
      id: "CIV-2026-004",
      title: "Water leakage on roadside",
      category: "Water Leakage",
      location: "Pune, Maharashtra",
      date: "28 Oct 2026",
      status: "Pending",
      supporters: 3,
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

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft size={22} />
            </Link>

            <div>
              <h1 className="text-xl font-bold text-blue-700">
                CivicAI
              </h1>
              <p className="text-xs text-slate-500">
                Citizen Portal
              </p>
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

          <h2 className="text-3xl font-bold text-slate-900">
            My Complaints
          </h2>

          <p className="mt-2 text-slate-500">
            View your submitted complaints and track their progress.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total Complaints</p>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">
              {complaints.length}
            </h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Pending</p>
            <h3 className="mt-2 text-3xl font-bold text-yellow-600">
              {complaints.filter((c) => c.status === "Pending").length}
            </h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">In Progress</p>
            <h3 className="mt-2 text-3xl font-bold text-blue-600">
              {complaints.filter((c) => c.status === "In Progress").length}
            </h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Resolved</p>
            <h3 className="mt-2 text-3xl font-bold text-green-600">
              {complaints.filter((c) => c.status === "Resolved").length}
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

        {/* Complaints List */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="font-bold text-slate-900">
              Complaint History
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {filteredComplaints.length} complaints found
            </p>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <ClipboardList
                size={40}
                className="mx-auto text-slate-300"
              />
              <h3 className="mt-4 font-semibold text-slate-700">
                No complaints found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Try another search term or status filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="p-6 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row">

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-bold text-blue-700">
                          {complaint.id}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            complaint.status
                          )}`}
                        >
                          {complaint.status}
                        </span>
                      </div>

                      <h4 className="mt-3 text-lg font-bold text-slate-900">
                        {complaint.title}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Category: {complaint.category}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">

                        <span className="flex items-center gap-1">
                          <MapPin size={15} />
                          {complaint.location}
                        </span>

                        <span className="flex items-center gap-1">
                          <CalendarDays size={15} />
                          {complaint.date}
                        </span>

                        <span>
                          {complaint.supporters} supporters
                        </span>

                      </div>
                    </div>

                    <div className="flex items-center md:justify-end">
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
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Information */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm leading-6 text-blue-800">
            <strong>Note:</strong> Complaint information and statuses
            shown here are demonstration data. Live tracking will be
            enabled after backend integration.
          </p>
        </div>

      </main>
    </div>
  );
}

export default MyComplaints;
