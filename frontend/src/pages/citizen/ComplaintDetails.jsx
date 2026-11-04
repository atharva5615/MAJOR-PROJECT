
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Clock,
  CheckCircle,
  Circle,
  ClipboardList,
  Users,
  Building2,
  FileText,
  ShieldCheck,
} from "lucide-react";

function ComplaintDetails() {
  const { id } = useParams();

  // Temporary demonstration data.
  // Later, this information will come from the backend API.
  const complaint = {
    id: id || "CIV-2026-001",
    title: "Large pothole near main road",
    category: "Road Damage",
    description:
      "A large pothole has developed near the main road. It is causing difficulty for vehicles and could lead to accidents.",
    location: "Pune, Maharashtra",
    latitude: "18.520430",
    longitude: "73.856744",
    date: "04 November 2026",
    status: "In Progress",
    priority: "High",
    supporters: 12,
    department: "Road Maintenance Department",
    assignedTo: "Municipal Road Maintenance Team",
    updates: [
      {
        title: "Complaint Submitted",
        description: "Your complaint was successfully registered.",
        date: "04 Nov 2026, 10:30 AM",
        completed: true,
      },
      {
        title: "Under Review",
        description: "The complaint was reviewed by the authorities.",
        date: "04 Nov 2026, 02:15 PM",
        completed: true,
      },
      {
        title: "Department Assigned",
        description:
          "The complaint was assigned to the Road Maintenance Department.",
        date: "05 Nov 2026, 09:00 AM",
        completed: true,
      },
      {
        title: "Work In Progress",
        description:
          "The maintenance team is working on resolving the issue.",
        date: "05 Nov 2026, 11:30 AM",
        completed: true,
      },
      {
        title: "Issue Resolved",
        description: "The complaint will be marked resolved after verification.",
        date: "Awaiting completion",
        completed: false,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-5xl items-center gap-4">

          <Link
            to="/my-complaints"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft size={22} />
          </Link>

          <div>
            <h1 className="text-xl font-bold text-blue-700">
              CivicAI
            </h1>
            <p className="text-xs text-slate-500">
              Complaint Tracking
            </p>
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 md:px-8">

        {/* Page Heading */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-blue-600">
            <ClipboardList size={23} />
            <span className="font-semibold">Complaint Details</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900">
            Track Your Complaint
          </h2>

          <p className="mt-2 text-slate-500">
            Follow the progress of your reported civic issue.
          </p>
        </div>

        {/* Complaint Summary */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="text-sm text-slate-500">
                Complaint Reference ID
              </p>
              <h3 className="mt-1 text-xl font-bold text-blue-700">
                {complaint.id}
              </h3>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {complaint.status}
            </span>

          </div>

          <div className="my-5 border-t border-slate-100" />

          <h3 className="text-xl font-bold text-slate-900">
            {complaint.title}
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            {complaint.description}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <div className="flex items-center gap-3">
              <FileText className="text-blue-600" size={19} />
              <div>
                <p className="text-xs text-slate-500">Category</p>
                <p className="font-medium text-slate-800">
                  {complaint.category}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays className="text-blue-600" size={19} />
              <div>
                <p className="text-xs text-slate-500">Submitted On</p>
                <p className="font-medium text-slate-800">
                  {complaint.date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="text-blue-600" size={19} />
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="font-medium text-slate-800">
                  {complaint.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={19} />
              <div>
                <p className="text-xs text-slate-500">Supporting Citizens</p>
                <p className="font-medium text-slate-800">
                  {complaint.supporters}
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* Priority and Department */}
        <section className="mb-6 grid gap-5 md:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-orange-500" size={22} />
              <h3 className="font-semibold text-slate-900">
                Priority Assessment
              </h3>
            </div>

            <span className="mt-4 inline-block rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              {complaint.priority} Priority
            </span>

            <p className="mt-3 text-sm text-slate-500">
              This is the illustrative AI-recommended priority. The
              authority will confirm the final priority.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Building2 className="text-blue-600" size={22} />
              <h3 className="font-semibold text-slate-900">
                Assigned Department
              </h3>
            </div>

            <p className="mt-4 font-semibold text-slate-900">
              {complaint.department}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Assigned Team: {complaint.assignedTo}
            </p>
          </div>

        </section>

        {/* Complaint Timeline */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-7">
            <h3 className="text-xl font-bold text-slate-900">
              Complaint Progress
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Follow the steps taken by the authorities.
            </p>
          </div>

          <div className="space-y-7">

            {complaint.updates.map((update, index) => (
              <div key={index} className="flex gap-4">

                <div className="flex flex-col items-center">

                  {update.completed ? (
                    <CheckCircle
                      size={24}
                      className="shrink-0 text-green-600"
                    />
                  ) : (
                    <Circle
                      size={24}
                      className="shrink-0 text-slate-300"
                    />
                  )}

                  {index !== complaint.updates.length - 1 && (
                    <div
                      className={`mt-2 min-h-12 w-0.5 ${
                        update.completed
                          ? "bg-green-300"
                          : "bg-slate-200"
                      }`}
                    />
                  )}

                </div>

                <div className="pb-2">
                  <h4
                    className={`font-semibold ${
                      update.completed
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {update.title}
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    {update.description}
                  </p>

                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={13} />
                    {update.date}
                  </p>
                </div>

              </div>
            ))}

          </div>

        </section>

        {/* Location Coordinates */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h3 className="font-semibold text-slate-900">
            Reported Coordinates
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Latitude</p>
              <p className="mt-1 font-semibold text-slate-800">
                {complaint.latitude}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Longitude</p>
              <p className="mt-1 font-semibold text-slate-800">
                {complaint.longitude}
              </p>
            </div>

          </div>

        </section>

        {/* Footer Note */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm leading-6 text-blue-800">
            <strong>Note:</strong> All complaint details and progress
            updates on this page are demonstration data. Live updates
            will be available after backend integration.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/my-complaints"
            className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={18} />
            Back to My Complaints
          </Link>
        </div>

      </main>
    </div>
  );
}

export default ComplaintDetails;
