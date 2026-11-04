
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Clock,
  CheckCircle,
  Activity,
  MapPin,
  LogOut,
  Bell,
  ArrowUpRight,
} from "lucide-react";

function Dashboard() {
  // Sample dashboard statistics
  const stats = [
    {
      title: "Total Reports",
      value: 12,
      icon: FileText,
      color: "blue",
    },
    {
      title: "Pending",
      value: 5,
      icon: Clock,
      color: "amber",
    },
    {
      title: "In Progress",
      value: 1,
      icon: Activity,
      color: "purple",
    },
    {
      title: "Resolved",
      value: 6,
      icon: CheckCircle,
      color: "green",
    },
  ];

  // Sample complaints
  const complaints = [
    {
      id: "CIV-2026-001",
      title: "Road pothole",
      category: "Road Damage",
      location: "Pune, Maharashtra",
      date: "04 Nov 2026",
      status: "In Progress",
    },
    {
      id: "CIV-2026-002",
      title: "Garbage accumulation",
      category: "Garbage",
      location: "Pune, Maharashtra",
      date: "02 Nov 2026",
      status: "Pending",
    },
    {
      id: "CIV-2026-003",
      title: "Broken streetlight",
      category: "Streetlight",
      location: "Pune, Maharashtra",
      date: "30 Oct 2026",
      status: "Resolved",
    },
  ];

  const colorStyles = {
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
  };

  const statusStyles = {
    Pending: "bg-amber-100 text-amber-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white p-6 md:block">

        <h1 className="text-2xl font-bold text-blue-700">
          CivicAI
        </h1>

        <p className="mt-1 text-xs text-slate-400">
          Citizen Portal
        </p>

        <nav className="mt-10 space-y-2">

          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 font-semibold text-blue-700"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <Link
  to="/my-complaints"
  className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
>
  My Complaints
</Link>

          <Link
            to="/report-issue"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-600 hover:bg-slate-100"
          >
            <PlusCircle size={19} />
            Report an Issue
          </Link>

        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={19} />
            Back to Home
          </Link>
        </div>

      </aside>

      {/* Main Content */}
      <main className="md:ml-64">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5 md:px-8">

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Citizen Dashboard
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage and track your civic complaints.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
              <Bell size={21} />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              C
            </div>
          </div>

        </header>

        <div className="p-5 md:p-8">

          {/* Welcome Section */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Welcome, Citizen!
              </h2>

              <p className="mt-2 text-slate-500">
                Here's an overview of your reported civic issues.
              </p>
            </div>

            <Link
              to="/report-issue"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <PlusCircle size={19} />
              Report an Issue
            </Link>

          </div>

          {/* Statistics Cards */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">

                    <div className={`rounded-lg p-3 ${colorStyles[stat.color]}`}>
                      <Icon size={23} />
                    </div>

                    <span className="text-3xl font-bold text-slate-800">
                      {stat.value}
                    </span>

                  </div>

                  <h3 className="mt-4 font-semibold text-slate-700">
                    {stat.title}
                  </h3>

                </div>
              );
            })}

          </div>

          {/* Recent Complaints */}
          <section
            id="complaints"
            className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">

              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Recent Complaints
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Track the progress of your recent reports.
                </p>
              </div>

              <button className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                View All <ArrowUpRight size={17} />
              </button>

            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">

                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Complaint ID</th>
                    <th className="px-5 py-4">Issue</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-slate-50">

                      <td className="px-5 py-4 font-medium text-blue-700">
                        {complaint.id}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-700">
                          {complaint.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {complaint.category}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {complaint.location}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {complaint.date}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[complaint.status]}`}>
                          {complaint.status}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </section>

          {/* Information Section */}
          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-6">

            <div className="flex items-start gap-4">

              <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
                <Activity size={24} />
              </div>

              <div>
                <h3 className="font-bold text-slate-800">
                  Your Reports Make a Difference!
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Every civic issue you report helps authorities identify
                  problems and improve your community. Keep contributing
                  towards a cleaner and safer city.
                </p>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
