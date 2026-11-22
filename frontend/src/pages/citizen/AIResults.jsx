import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  Brain,
  LoaderCircle,
  FileText,
} from "lucide-react";
import api from "../../services/api";

function AIResults() {
  const location = useLocation();

  const complaintData = location.state || {};
  const issueId = complaintData.issueId;

  const [duplicates, setDuplicates] = useState([]);
  const [duplicatesLoading, setDuplicatesLoading] = useState(false);
  const [duplicatesError, setDuplicatesError] = useState("");

  const category = complaintData.category || "Not provided";
  const description = complaintData.description || "No description provided";
  const locationText =
    complaintData.latitude && complaintData.longitude
      ? `${complaintData.latitude}, ${complaintData.longitude}`
      : "Location not provided";

  useEffect(() => {
    let active = true;

    const fetchDuplicates = async () => {
      if (!issueId) {
        setDuplicates([]);
        setDuplicatesError(
          "Complaint ID was not provided. Open this page by submitting a complaint."
        );
        return;
      }

      setDuplicatesLoading(true);
      setDuplicatesError("");

      try {
        const response = await api.get(
          `/issues/${issueId}/duplicates`
        );

        if (active) {
          const candidates = Array.isArray(response.data)
            ? response.data
            : response.data?.duplicates || response.data?.candidates || [];

          setDuplicates(candidates);
        }
      } catch (err) {
        console.error("Duplicate detection request failed:", err);

        if (active) {
          setDuplicates([]);
          const detail = err.response?.data?.detail;
          setDuplicatesError(
            typeof detail === "string"
              ? detail
              : "Duplicate matching is currently unavailable. Your complaint has still been submitted."
          );
        }
      } finally {
        if (active) setDuplicatesLoading(false);
      }
    };

    fetchDuplicates();

    return () => {
      active = false;
    };
  }, [issueId]);

  const formatComplaintReference = (candidateId) => {
    const year = new Date().getFullYear();
    return `CIV-${year}-${String(candidateId).padStart(3, "0")}`;
  };

  const formatDistance = (distance) => {
    if (distance == null) return "Distance unavailable";
    const metres = Number(distance);
    if (!Number.isFinite(metres)) return "Distance unavailable";
    return metres < 1000
      ? `${metres.toFixed(0)} metres away`
      : `${(metres / 1000).toFixed(2)} km away`;
  };

  const formatSimilarity = (similarity) => {
    if (similarity == null) return "Unavailable";
    const value = Number(similarity);
    return Number.isFinite(value) ? `${Math.round(value)}%` : "Unavailable";
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
            Complaint Submission Results
          </h1>

          <p className="mt-2 text-slate-500">
            Your complaint and photograph have been submitted.
          </p>
        </div>

        {/* Actual complaint information */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={22} />
            <h2 className="text-lg font-semibold text-slate-900">
              Complaint Submitted
            </h2>
          </div>

          <div className="mb-5 rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-800">Your complaint reference</p>
            <p className="mt-1 text-xl font-bold text-green-900">
              {issueId ? `CIV-${new Date().getFullYear()}-${String(issueId).padStart(3, "0")}` : "Reference unavailable"}
            </p>
            {issueId && (
              <p className="mt-1 text-xs text-green-800">
                Database complaint ID: {issueId}
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Submitted Category</p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">
                {category}
              </h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                {description}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">AI Detection</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-700">
                Not connected yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                The YOLO model is still being developed. No AI category,
                confidence score or severity score is being claimed here.
              </p>
            </div>
          </div>

          {complaintData.imageUrl && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-slate-600">
                Submitted photograph
              </p>
              <img
                src={complaintData.imageUrl}
                alt="Submitted civic issue"
                className="max-h-72 w-full rounded-lg bg-slate-100 object-contain"
              />
            </div>
          )}

          <div className="mt-5 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <MapPin size={18} />
            {locationText}
          </div>
        </div>

        {/* Backend duplicate detection */}
        <div className="mb-6 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={22} />
            <h2 className="text-lg font-semibold text-slate-900">
              Possible Existing Complaints
            </h2>
          </div>

          {duplicatesLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
              <LoaderCircle size={18} className="animate-spin" />
              Checking for nearby similar complaints...
            </div>
          ) : duplicatesError ? (
            <p className="text-sm text-slate-600">{duplicatesError}</p>
          ) : duplicates.length === 0 ? (
            <p className="text-sm text-slate-600">
              No similar complaints were returned by the duplicate detection
              service.
            </p>
          ) : (
            <>
              <p className="mb-5 text-sm text-slate-600">
                The backend found {duplicates.length} potentially similar
                complaint{duplicates.length === 1 ? "" : "s"}. Please review
                these matches with the municipal authority if needed.
              </p>

              <div className="space-y-3">
                {duplicates.map((candidate) => {
                  const candidateId =
                    candidate.issue_id ?? candidate.id;
                  const similarity =
                    candidate.image_similarity_percentage;
                  const distance = candidate.gps_distance_metres;

                  return (
                    <div
                      key={candidateId}
                      className="rounded-xl bg-orange-50 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-500">
                            Possible matching complaint
                          </p>
                          <h3 className="font-bold text-slate-900">
                            {candidateId != null
                              ? formatComplaintReference(candidateId)
                              : "Complaint reference unavailable"}
                          </h3>
                        </div>
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                          Potential match
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">
                            Image similarity
                          </p>
                          <p className="font-semibold text-slate-900">
                            {formatSimilarity(similarity)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">
                            GPS distance
                          </p>
                          <p className="font-semibold text-slate-900">
                            {formatDistance(distance)}
                          </p>
                        </div>
                      </div>

                      {candidate.hamming_distance != null && (
                        <p className="mt-3 text-xs text-slate-500">
                          Image hash difference: {candidate.hamming_distance}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <p className="mt-4 text-xs text-slate-500">
            Similarity and distance are backend duplicate-detection signals,
            not a final decision that two complaints are identical.
          </p>
        </div>

        {/* Next steps */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 text-blue-600" size={22} />
            <div>
              <h2 className="font-semibold text-slate-900">
                What happens next?
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your complaint is saved and can be tracked from your citizen
                dashboard. The municipal authority can review it and decide
                whether a possible match is a duplicate.
              </p>
            </div>
          </div>

          <Link
            to="/my-complaints"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
          >
            <FileText size={18} />
            View My Complaints
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          AI detection and severity assessment will be displayed when the
          trained AI model is integrated.
        </p>
      </div>
    </div>
  );
}

export default AIResults;
