import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Camera,
  BrainCircuit,
  ShieldCheck,
  AlertTriangle,
  Building2,
  CheckCircle,
  Users,
  Save,
  FileText,
} from "lucide-react";

function ComplaintReview() {
  const { id } = useParams();

  // Temporary demonstration complaint data.
  // Later, this will be retrieved from the backend API.
  const complaint = {
    id: id || "CIV-2026-001",
    title: "Large pothole near main road",
    category: "Road Damage",
    description:
      "A large pothole has developed near the main road, causing difficulty for vehicles and creating a safety risk.",
    location: "Pune, Maharashtra",
    latitude: "18.520430",
    longitude: "73.856744",
    date: "04 November 2026",
    aiDetectedCategory: "Pothole",
    aiConfidence: 94,
    aiRecommendedPriority: "High",
    severityScore: 85,
    supporters: 12,
    duplicate: {
      id: "CIV-2026-014",
      similarity: 91,
      distance: "18 metres",
      status: "In Progress",
    },
  };

  const [priority, setPriority] = useState(
    complaint.aiRecommendedPriority
  );

  const [status, setStatus] = useState("In Progress");

  const [department, setDepartment] = useState(
    "Road Maintenance Department"
  );

  const [authorityNote, setAuthorityNote] = useState("");

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();

    setSaved(true);

    // Demonstration only.
    // Later, these changes will be sent to the backend.
  };

  const getPriorityStyle = (value) => {
    switch (value) {
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

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link
            to="/admin/dashboard"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft size={22} />
          </Link>

          <div>
            <h1 className="text-xl font-bold text-blue-700">
              CivicAI
            </h1>
            <p className="text-xs text-slate-500">
              Authority Portal
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        {/* Heading */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-blue-600">
            <FileText size={23} />
            <span className="font-semibold">Authority Review</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900">
            Review Complaint
          </h2>

          <p className="mt-2 text-slate-500">
            Examine the reported issue and manage its resolution.
          </p>
        </div>

        {/* Complaint Summary */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Complaint Reference
              </p>

              <h3 className="mt-1 text-xl font-bold text-blue-700">
                {complaint.id}
              </h3>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              Under Authority Review
            </span>
          </div>

          <div className="my-5 border-t border-slate-100" />

          <h3 className="text-xl font-bold text-slate-900">
            {complaint.title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {complaint.description}
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <MapPin className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="font-medium text-slate-800">
                  {complaint.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-slate-500">Submitted On</p>
                <p className="font-medium text-slate-800">
                  {complaint.date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-slate-500">
                  Supporting Citizens
                </p>
                <p className="font-medium text-slate-800">
                  {complaint.supporters}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-slate-500">Coordinates</p>
                <p className="font-medium text-slate-800">
                  {complaint.latitude}, {complaint.longitude}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Image Evidence */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Camera className="text-blue-600" size={22} />
            <h3 className="text-lg font-bold text-slate-900">
              Submitted Image Evidence
            </h3>
          </div>

          <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <Camera size={40} className="text-slate-400" />

            <p className="mt-3 font-medium text-slate-700">
              Complaint photograph
            </p>

            <p className="mt-1 text-sm text-slate-500">
              The uploaded image will appear here after backend integration.
            </p>
          </div>
        </section>

        {/* AI Analysis */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <BrainCircuit className="text-blue-600" size={23} />
            <h3 className="text-lg font-bold text-slate-900">
              AI Analysis Results
            </h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-slate-500">
                Detected Category
              </p>
              <h4 className="mt-2 text-lg font-bold text-blue-700">
                {complaint.aiDetectedCategory}
              </h4>
            </div>

            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm text-slate-500">
                AI Confidence
              </p>
              <h4 className="mt-2 text-2xl font-bold text-green-700">
                {complaint.aiConfidence}%
              </h4>
            </div>

            <div className="rounded-xl bg-orange-50 p-4">
              <p className="text-sm text-slate-500">
                Severity Score
              </p>
              <h4 className="mt-2 text-2xl font-bold text-orange-700">
                {complaint.severityScore}/100
              </h4>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm leading-6 text-blue-800">
              AI recommends{" "}
              <strong>{complaint.aiRecommendedPriority}</strong>{" "}
              priority. The authority should review this recommendation
              before confirming the final priority.
            </p>
          </div>
        </section>

        {/* Duplicate Detection */}
        <section className="mb-6 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={23} />
            <h3 className="text-lg font-bold text-slate-900">
              Possible Duplicate Complaint
            </h3>
          </div>

          <div className="rounded-xl bg-orange-50 p-5">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">
                  Existing Complaint
                </p>
                <h4 className="mt-1 font-bold text-slate-900">
                  {complaint.duplicate.id}
                </h4>
              </div>

              <span className="h-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {complaint.duplicate.status}
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">
                  Image Similarity
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {complaint.duplicate.similarity}%
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  GPS Distance
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {complaint.duplicate.distance}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              This is a potential match. Verify whether both reports
              refer to the same physical issue before linking them.
            </p>

            {/* NEW: Navigate to Duplicate Review */}
            <Link
              to={`/admin/duplicates/${complaint.id}`}
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              Review Duplicate
            </Link>
          </div>
        </section>

        {/* Authority Decision Form */}
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" size={23} />
            <h3 className="text-lg font-bold text-slate-900">
              Authority Decision
            </h3>
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="mb-2 block font-semibold text-slate-800">
              Confirm Final Priority
            </label>

            <p className="mb-3 text-sm text-slate-500">
              AI recommended: {complaint.aiRecommendedPriority}
            </p>

            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setSaved(false);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <span
              className={`mt-3 inline-block rounded-full px-4 py-2 text-sm font-semibold ${getPriorityStyle(priority)}`}
            >
              Final selected priority: {priority}
            </span>
          </div>

          {/* Department */}
          <div className="mb-6">
            <label className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
              <Building2 size={18} className="text-blue-600" />
              Assign Department
            </label>

            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setSaved(false);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="Road Maintenance Department">
                Road Maintenance Department
              </option>
              <option value="Sanitation Department">
                Sanitation Department
              </option>
              <option value="Electrical Department">
                Electrical Department
              </option>
              <option value="Water Supply Department">
                Water Supply Department
              </option>
              <option value="General Civic Department">
                General Civic Department
              </option>
            </select>
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="mb-2 block font-semibold text-slate-800">
              Update Complaint Status
            </label>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setSaved(false);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Authority Notes */}
          <div className="mb-6">
            <label className="mb-2 block font-semibold text-slate-800">
              Authority Notes
            </label>

            <textarea
              value={authorityNote}
              onChange={(e) => {
                setAuthorityNote(e.target.value);
                setSaved(false);
              }}
              rows={4}
              placeholder="Enter your assessment, priority justification or instructions..."
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          {/* Save */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 sm:w-auto"
          >
            <Save size={18} />
            Save Authority Decision
          </button>

          {saved && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
              <CheckCircle size={19} />
              Decision saved locally for demonstration.
            </div>
          )}
        </form>

        {/* Information */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm leading-6 text-blue-800">
            <strong>Demonstration only:</strong> Priority changes,
            department assignments and status updates are currently
            stored only in the page's local state. They are not saved
            to the database yet.
          </p>
        </div>
      </main>
    </div>
  );
}

export default ComplaintReview;