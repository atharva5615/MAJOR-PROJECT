
import { useEffect, useState } from "react";
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
  LoaderCircle,
} from "lucide-react";
import api from "../../services/api";

function DuplicateReview() {
  const { id } = useParams();

  const [originalComplaint, setOriginalComplaint] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidateDetails, setCandidateDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState({});
  const [authorityNote, setAuthorityNote] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchDuplicateData = async () => {
      try {
        setLoading(true);
        setError("");

        const [complaintResponse, duplicateResponse] =
          await Promise.all([
            api.get(`/issues/${id}`),
            api.get(`/issues/${id}/duplicates`),
          ]);

        if (cancelled) return;

        const complaint = complaintResponse.data;
        const duplicateData = duplicateResponse.data;
        const matches = duplicateData.duplicate_candidates || [];

        setOriginalComplaint(complaint);
        setCandidates(matches);

        const details = await Promise.all(
          matches.map(async (candidate) => {
            try {
              const response = await api.get(
                `/issues/${candidate.issue_id}`
              );

              return {
                ...candidate,
                complaint: response.data,
              };
            } catch {
              return {
                ...candidate,
                complaint: null,
              };
            }
          })
        );

        if (!cancelled) {
          setCandidateDetails(details);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              "Unable to load duplicate complaint information."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchDuplicateData();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDecision = (candidateId, value) => {
    setDecision((previous) => ({
      ...previous,
      [candidateId]: value,
    }));
  };

  const imageUrl = (path) => {
    if (!path) return null;

    const baseURL = api.defaults.baseURL.replace(/\/api\/v1\/?$/, "");
    return `${baseURL}${path.startsWith("/") ? path : `/${path}`}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="animate-spin text-blue-600" size={36} />
        <span className="ml-3 text-slate-600">
          Loading duplicate information...
        </span>
      </div>
    );
  }

  if (error || !originalComplaint) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <p className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || "Complaint not found."}
        </p>
        <Link
          to="/admin/dashboard"
          className="mt-4 inline-block text-blue-600"
        >
          Return to dashboard
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
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
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-orange-600">
            <AlertTriangle size={23} />
            <span className="font-semibold">
              Duplicate Verification
            </span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900">
            Review Possible Duplicates
          </h2>

          <p className="mt-2 text-slate-500">
            Review AI-detected matches and determine whether
            complaints describe the same physical civic issue.
          </p>
        </div>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="text-blue-600" size={22} />
            <h3 className="text-lg font-bold text-slate-900">
              Original Complaint
            </h3>
          </div>

          <p className="text-sm font-semibold text-blue-700">
            Complaint #{originalComplaint.id}
          </p>

          <h4 className="mt-2 text-xl font-bold text-slate-900">
            {originalComplaint.title}
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {originalComplaint.description}
          </p>

          {originalComplaint.image_url && (
            <img
              src={imageUrl(originalComplaint.image_url)}
              alt="Original complaint"
              className="mt-5 max-h-64 rounded-xl object-contain"
            />
          )}

          <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-600">
            <span>Category: {originalComplaint.category}</span>
            <span>Status: {originalComplaint.status}</span>
            <span>Priority: {originalComplaint.priority}</span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={17} className="text-blue-600" />
            {originalComplaint.address ||
              `${originalComplaint.latitude ?? "N/A"}, ${originalComplaint.longitude ?? "N/A"}`}
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <BrainCircuit className="text-orange-600" size={23} />
            <h3 className="text-lg font-bold text-slate-900">
              AI Duplicate Detection
            </h3>
          </div>

          {candidates.length === 0 ? (
            <div className="rounded-xl bg-green-50 p-5 text-green-800">
              <CheckCircle className="mb-2" size={24} />
              No potential duplicate complaints were found.
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              AI identified {candidates.length} potential duplicate
              {candidates.length !== 1 ? "s" : ""}.
              Review each candidate below.
            </p>
          )}
        </section>

        {candidateDetails.map((candidate) => {
          const reportedComplaint = candidate.complaint;
          const candidateId = candidate.issue_id;

          return (
            <section
              key={candidateId}
              className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900">
                  Suspected Duplicate #{candidateId}
                </h3>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                  Requires verification
                </span>
              </div>

              <div className="mb-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-sm text-slate-500">
                    Image Similarity
                  </p>
                  <h4 className="mt-2 text-2xl font-bold text-blue-700">
                    {candidate.image_similarity_percentage}%
                  </h4>
                </div>

                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-sm text-slate-500">
                    GPS Distance
                  </p>
                  <h4 className="mt-2 text-2xl font-bold text-green-700">
                    {Number(candidate.gps_distance_metres).toFixed(1)} m
                  </h4>
                </div>

                <div className="rounded-xl bg-purple-50 p-4">
                  <p className="text-sm text-slate-500">
                    Hamming Distance
                  </p>
                  <h4 className="mt-2 text-2xl font-bold text-purple-700">
                    {candidate.hamming_distance}
                  </h4>
                </div>
              </div>

              {reportedComplaint ? (
                <>
                  <h4 className="font-bold text-slate-900">
                    {reportedComplaint.title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {reportedComplaint.description}
                  </p>

                  {reportedComplaint.image_url && (
                    <img
                      src={imageUrl(reportedComplaint.image_url)}
                      alt="Suspected duplicate complaint"
                      className="mt-4 max-h-64 rounded-xl object-contain"
                    />
                  )}

                  <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-600">
                    <span>Category: {reportedComplaint.category}</span>
                    <span>Status: {reportedComplaint.status}</span>
                    <span>Priority: {reportedComplaint.priority}</span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={17} />
                    {reportedComplaint.address ||
                      `${reportedComplaint.latitude ?? "N/A"}, ${reportedComplaint.longitude ?? "N/A"}`}
                  </div>
                </>
              ) : (
                <p className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
                  Candidate details could not be loaded. You may not
                  have permission to access this complaint.
                </p>
              )}

              <div className="mt-6 border-t border-slate-100 pt-5">
                <label className="mb-2 block font-semibold text-slate-800">
                  Verification Notes
                </label>

                <textarea
                  value={authorityNote}
                  onChange={(event) => setAuthorityNote(event.target.value)}
                  rows={3}
                  placeholder="Explain your assessment..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleDecision(candidateId, "confirmed")}
                    disabled={!!decision[candidateId]}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    Confirm Duplicate
                  </button>

                  <button
                    onClick={() => handleDecision(candidateId, "rejected")}
                    disabled={!!decision[candidateId]}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    Reject Duplicate
                  </button>
                </div>

                {decision[candidateId] && (
                  <p className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
                    Demonstration decision: {decision[candidateId]}.
                    This has not been saved to the backend.
                  </p>
                )}
              </div>
            </section>
          );
        })}

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm leading-6 text-blue-800">
            <strong>Important:</strong> AI similarity and GPS distance
            are supporting evidence, not proof of duplication.
            Authority decisions are currently demonstration-only
            and are not persisted.
          </p>
        </div>
      </main>
    </div>
  );
}

export default DuplicateReview;
