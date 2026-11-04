
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  Users,
  Brain,
} from "lucide-react";

function AIResults() {
    const location = useLocation();

const complaintData = location.state || {
  category: "Not provided",
  description: "No description provided",
  latitude: "",
  longitude: "",
};
  const [isSupporting, setIsSupporting] = useState(false);

  // Temporary demonstration data.
  // Later, this information will come from the backend AI API.
  const aiResult = {
  category: complaintData.category,
  issue: complaintData.description,
  confidence: 94,
  priority: "High",
  severityScore: 85,
  location:
    complaintData.latitude && complaintData.longitude
      ? `${complaintData.latitude}, ${complaintData.longitude}`
      : "Location not provided",
};

  const existingComplaint = {
    id: "CIV-2026-014",
    category: "Road Damage",
    distance: "18 metres away",
    matchScore: 91,
    supporters: 12,
    status: "In Progress",
  };

  const handleSupport = () => {
    setIsSupporting(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-blue-600">
            <Brain size={24} />
            <span className="font-semibold">CivicAI Analysis</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            AI Analysis Results
          </h1>

          <p className="mt-2 text-slate-500">
            Your uploaded image has been analysed.
          </p>
        </div>

        {/* AI Detection Result */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={22} />
            <h2 className="text-lg font-semibold text-slate-900">
              Issue Detected
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Detected Category</p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">
                {aiResult.category}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {aiResult.issue}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">AI Confidence</p>
              <h3 className="mt-1 text-2xl font-bold text-green-600">
                {aiResult.confidence}%
              </h3>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${aiResult.confidence}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <MapPin size={18} />
            {aiResult.location}
          </div>
        </div>

        {/* Priority Information */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Initial Priority Assessment
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                AI Recommended Priority
              </p>
              <span className="mt-2 inline-block rounded-full bg-orange-100 px-4 py-2 font-semibold text-orange-700">
                {aiResult.priority}
              </span>
            </div>

            <div>
              <p className="text-sm text-slate-500">Severity Score</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {aiResult.severityScore}/100
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            This is an initial AI recommendation. The municipal authority
            will review and confirm the final priority.
          </p>
        </div>

        {/* Duplicate Complaint */}
        <div className="mb-6 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={22} />
            <h2 className="text-lg font-semibold text-slate-900">
              Possible Existing Complaint
            </h2>
          </div>

          <p className="mb-5 text-sm text-slate-600">
            We found a potentially similar complaint near your reported
            location. Please check whether it is the same issue.
          </p>

          <div className="rounded-xl bg-orange-50 p-4">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">Complaint ID</p>
                <h3 className="font-bold text-slate-900">
                  {existingComplaint.id}
                </h3>
              </div>

              <span className="h-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {existingComplaint.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Similarity</p>
                <p className="font-semibold text-slate-900">
                  {existingComplaint.matchScore}%
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Distance</p>
                <p className="font-semibold text-slate-900">
                  {existingComplaint.distance}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <Users size={17} />
              {existingComplaint.supporters + (isSupporting ? 1 : 0)} citizens
              support this complaint
            </div>
          </div>

          <button
            onClick={handleSupport}
            disabled={isSupporting}
            className="mt-5 w-full rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-green-600"
          >
            {isSupporting
              ? "Supporting Complaint"
              : "Support Existing Complaint"}
          </button>

          {isSupporting && (
            <p className="mt-3 text-center text-sm text-green-700">
              You are supporting {existingComplaint.id} (demo only).
            </p>
          )}
        </div>

        {/* Submit as New Complaint */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 text-blue-600" size={22} />

            <div>
              <h2 className="font-semibold text-slate-900">
                Is this a different issue?
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                If this is a separate pothole or road damage, you can
                submit it as a new complaint.
              </p>
            </div>
          </div>

          <Link
            to="/report-issue"
            className="mt-5 block w-full rounded-lg border border-blue-600 px-5 py-3 text-center font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Submit as New Complaint
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Demonstration data only. Real AI detection and duplicate matching
          will be connected through the backend.
        </p>

      </div>
    </div>
  );
}

export default AIResults;
