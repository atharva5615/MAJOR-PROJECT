import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Camera,
  BrainCircuit,
  FileText,
} from "lucide-react";

function DuplicateReview() {
  const { id } = useParams();

  const [decision, setDecision] = useState("");
  const [authorityNote, setAuthorityNote] = useState("");

  // Temporary demonstration data.
  // Later, this will come from the backend API.
  const originalComplaint = {
    id: id || "CIV-2026-001",
    title: "Large pothole near main road",
    category: "Road Damage",
    location: "Pune, Maharashtra",
    description:
      "A large pothole has developed near the main road, causing difficulty for vehicles.",
  };

  const reportedComplaint = {
    id: "CIV-2026-014",
    title: "Pothole reported near main road",
    category: "Road Damage",
    location: "Pune, Maharashtra",
    description:
      "A citizen reported a pothole causing problems for nearby vehicles.",
  };

  const handleDecision = (value) => {
    setDecision(value);

    // Demonstration only.
    // Later, send this decision and authorityNote to the backend.
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link
            to={`/admin/complaints/${originalComplaint.id}`}
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
        {/* Page Heading */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-orange-600">
            <AlertTriangle size={23} />
            <span className="font-semibold">
              Duplicate Verification
            </span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900">
            Review Possible Duplicate
          </h2>

          <p className="mt-2 text-slate-500">
            Compare both complaints and decide whether they report
            the same physical civic issue.
          </p>
        </div>

        {/* AI Match Information */}
        <section className="mb-6 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <BrainCircuit className="text-orange-600" size={23} />
            <h3 className="text-lg font-bold text-slate-900">
              AI Duplicate Detection
            </h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-slate-500">
                Image Similarity
              </p>
              <h4 className="mt-2 text-2xl font-bold text-blue-700">
                91%
              </h4>
            </div>

            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm text-slate-500">
                GPS Distance
              </p>
              <h4 className="mt-2 text-2xl font-bold text-green-700">
                18 metres
              </h4>
            </div>

            <div className="rounded-xl bg-purple-50 p-4">
              <p className="text-sm text-slate-500">
                Category Match
              </p>
              <h4 className="mt-2 text-2xl font-bold text-purple-700">
                Yes
              </h4>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-600">
            AI has identified similarities between these complaints.
            These scores are suggestions, not proof that both reports
            describe the same physical issue.
          </p>
        </section>

        {/* Complaint Comparison */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          {/* Original Complaint */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="text-blue-600" size={21} />
              <h3 className="text-lg font-bold text-slate-900">
                Original Complaint
              </h3>
            </div>

            <p className="text-sm font-semibold text-blue-700">
              {originalComplaint.id}
            </p>

            <div className="my-4 flex min-h-36 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
              <Camera size={35} className="text-slate-400" />
              <p className="mt-2 text-sm text-slate-500">
                Original complaint image
              </p>
            </div>

            <h4 className="font-bold text-slate-900">
              {originalComplaint.title}
            </h4>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {originalComplaint.description}
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <MapPin size={17} className="text-blue-600" />
              {originalComplaint.location}
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Category: {originalComplaint.category}
            </p>
          </section>

          {/* Reported Complaint */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="text-orange-600" size={21} />
              <h3 className="text-lg font-bold text-slate-900">
                New Complaint
              </h3>
            </div>

            <p className="text-sm font-semibold text-orange-700">
              {reportedComplaint.id}
            </p>

            <div className="my-4 flex min-h-36 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
              <Camera size={35} className="text-slate-400" />
              <p className="mt-2 text-sm text-slate-500">
                New complaint image
              </p>
            </div>

            <h4 className="font-bold text-slate-900">
              {reportedComplaint.title}
            </h4>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {reportedComplaint.description}
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <MapPin size={17} className="text-orange-600" />
              {reportedComplaint.location}
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Category: {reportedComplaint.category}
            </p>
          </section>
        </div>

        {/* Authority Decision */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <AlertTriangle className="text-blue-600" size={23} />
            <h3 className="text-lg font-bold text-slate-900">
              Authority Decision
            </h3>
          </div>

          <label className="mb-2 block font-semibold text-slate-800">
            Verification Notes
          </label>

          <textarea
            value={authorityNote}
            onChange={(e) => {
              setAuthorityNote(e.target.value);
              setDecision("");
            }}
            rows={4}
            placeholder="Explain why these complaints are or are not duplicates..."
            className="mb-6 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => handleDecision("confirmed")}
              disabled={!!decision}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle size={19} />
              Confirm Duplicate
            </button>

            <button
              onClick={() => handleDecision("rejected")}
              disabled={!!decision}
              className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle size={19} />
              Reject Duplicate
            </button>
          </div>

          {/* Decision Feedback */}
          {decision === "confirmed" && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle size={22} />
                <h4 className="font-bold">
                  Duplicate Confirmed
                </h4>
              </div>

              <p className="mt-2 text-sm leading-6 text-green-800">
                Complaint {reportedComplaint.id} has been marked as
                a duplicate of {originalComplaint.id} in this
                demonstration. The authority should link both records
                in the backend workflow.
              </p>
            </div>
          )}

          {decision === "rejected" && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle size={22} />
                <h4 className="font-bold">
                  Duplicate Match Rejected
                </h4>
              </div>

              <p className="mt-2 text-sm leading-6 text-red-800">
                Complaint {reportedComplaint.id} is considered a
                separate issue in this demonstration and should
                continue through the normal complaint workflow.
              </p>
            </div>
          )}

          {decision && (
            <Link
              to={`/admin/complaints/${originalComplaint.id}`}
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Return to Complaint Review
            </Link>
          )}
        </section>

        {/* Information */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm leading-6 text-blue-800">
            <strong>Demonstration only:</strong> Duplicate decisions
            are currently stored in local page state. They are not
            saved to the database. Backend integration will be
            required to permanently link or separate complaints.
          </p>
        </div>
      </main>
    </div>
  );
}

export default DuplicateReview;