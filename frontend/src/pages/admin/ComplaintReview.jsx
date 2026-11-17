
import { useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";
import api from "../../services/api";

function ComplaintReview() {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("reported");
  const [department, setDepartment] = useState("");
  const [authorityNote, setAuthorityNote] = useState("");

  const [actionMessage, setActionMessage] = useState("");

  const getErrorMessage = (err) => {
    const detail = err.response?.data?.detail;

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item.msg || JSON.stringify(item))
        .join(", ");
    }

    return err.message || "Something went wrong. Please try again.";
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    try {
      return new URL(imagePath, api.defaults.baseURL).href;
    } catch {
      return null;
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getReference = (issue) => {
    if (!issue) return "";

    const year = issue.created_at
      ? new Date(issue.created_at).getFullYear()
      : new Date().getFullYear();

    return `CIV-${year}-${String(issue.id).padStart(3, "0")}`;
  };

  const getDisplayStatus = (value) => {
    const statuses = {
      reported: "Pending",
      in_progress: "In Progress",
      resolved: "Resolved",
    };

    return statuses[value] || value || "Unknown";
  };

  const getPriorityStyle = (value) => {
    switch (value?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  useEffect(() => {
    let active = true;

    const fetchComplaint = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/issues/${id}`);
        const issue = response.data;

        if (!active) return;

        setComplaint(issue);
        setPriority(
          issue.priority
            ? issue.priority.charAt(0).toUpperCase() +
                issue.priority.slice(1).toLowerCase()
            : "Medium"
        );
        setStatus(issue.status || "reported");

        // Fetch duplicate candidates for this complaint.
        try {
          const duplicateResponse = await api.get(
            `/issues/${id}/duplicates`
          );

          const candidates =
            duplicateResponse.data?.duplicate_candidates || [];

          const candidateDetails = await Promise.all(
            candidates.map(async (candidate) => {
              try {
                const detailResponse = await api.get(
                  `/issues/${candidate.issue_id}`
                );

                return {
                  ...candidate,
                  complaint: detailResponse.data,
                };
              } catch {
                return {
                  ...candidate,
                  complaint: null,
                };
              }
            })
          );

          if (active) {
            setDuplicates(candidateDetails);
          }
        } catch (duplicateError) {
          console.error("Duplicate detection error:", duplicateError);

          if (active) {
            setDuplicates([]);
          }
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchComplaint();
    } else {
      setError("Complaint ID is missing.");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setSaved(false);
    setActionMessage("");

    try {
      await api.put(`/issues/${id}/status`, {
        status,
      });

      // Refresh complaint data after the successful update.
      const response = await api.get(`/issues/${id}`);

      setComplaint(response.data);
      setStatus(response.data.status);

      setSaved(true);
      setActionMessage("Complaint status successfully updated.");
    } catch (err) {
      setActionMessage(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-blue-600" size={36} />
          <p className="mt-3 text-slate-600">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-white p-6">
          <h2 className="text-xl font-bold text-red-700">
            Unable to load complaint
          </h2>
          <p className="mt-2 text-slate-600">
            {error || "Complaint not found."}
          </p>
          <Link
            to="/admin/dashboard"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(complaint.image_url);

  const location =
    complaint.address ||
    (complaint.latitude != null && complaint.longitude != null
      ? `${complaint.latitude}, ${complaint.longitude}`
      : "Location not available");

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
            <h1 className="text-xl font-bold text-blue-700">CivicAI</h1>
            <p className="text-xs text-slate-500">Authority Portal</p>
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
              <p className="text-sm text-slate-500">Complaint Reference</p>
              <h3 className="mt-1 text-xl font-bold text-blue-700">
                {getReference(complaint)}
              </h3>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {getDisplayStatus(complaint.status)}
            </span>
          </div>

          <div className="my-5 border-t border-slate-100" />

          <h3 className="text-xl font-bold text-slate-900">
            {complaint.title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {complaint.description || "No description provided."}
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <MapPin className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="font-medium text-slate-800">{location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-slate-500">Submitted On</p>
                <p className="font-medium text-slate-800">
                  {formatDate(complaint.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-slate-500">
                  Supporting Citizens
                </p>
                <p className="font-medium text-slate-800">Not provided by API</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-slate-500">Coordinates</p>
                <p className="font-medium text-slate-800">
                  {complaint.latitude ?? "N/A"},{" "}
                  {complaint.longitude ?? "N/A"}
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

          {imageUrl ? (
            <div className="flex justify-center rounded-xl border border-slate-200 bg-slate-50 p-4">
              <img
                src={imageUrl}
                alt="Submitted complaint evidence"
                className="max-h-[450px] max-w-full rounded-lg object-contain"
              />
            </div>
          ) : (
            <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Camera size={40} className="text-slate-400" />
              <p className="mt-3 font-medium text-slate-700">
                No complaint photograph available
              </p>
              <p className="mt-1 text-sm text-slate-500">
                No image URL was returned by the backend.
              </p>
            </div>
          )}
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
              <p className="text-sm text-slate-500">Reported Category</p>
              <h4 className="mt-2 text-lg font-bold text-blue-700">
                {complaint.category || "N/A"}
              </h4>
            </div>

            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm text-slate-500">AI Confidence</p>
              <h4 className="mt-2 text-2xl font-bold text-green-700">N/A</h4>
              <p className="mt-1 text-xs text-slate-500">
                Not provided by current API
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 p-4">
              <p className="text-sm text-slate-500">Severity Score</p>
              <h4 className="mt-2 text-2xl font-bold text-orange-700">N/A</h4>
              <p className="mt-1 text-xs text-slate-500">
                Not provided by current API
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm leading-6 text-blue-800">
              Current recorded priority:{" "}
              <strong>{complaint.priority || "Not assigned"}</strong>.
              AI confidence and severity information are not currently
              available through the backend API.
            </p>
          </div>
        </section>

        {/* Duplicate Detection */}
        <section className="mb-6 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={23} />
            <h3 className="text-lg font-bold text-slate-900">
              Possible Duplicate Complaints
            </h3>
          </div>

          {duplicates.length > 0 ? (
            <div className="space-y-4">
              {duplicates.map((duplicate) => (
                <div
                  key={duplicate.issue_id}
                  className="rounded-xl bg-orange-50 p-5"
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        Existing Complaint
                      </p>
                      <h4 className="mt-1 font-bold text-slate-900">
                        {duplicate.complaint
                          ? getReference(duplicate.complaint)
                          : `Complaint #${duplicate.issue_id}`}
                      </h4>
                      {duplicate.complaint && (
                        <p className="mt-1 text-sm text-slate-600">
                          {duplicate.complaint.title}
                        </p>
                      )}
                    </div>

                    {duplicate.complaint && (
                      <span className="h-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {getDisplayStatus(duplicate.complaint.status)}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500">
                        Image Similarity
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {duplicate.image_similarity_percentage ?? "N/A"}%
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">GPS Distance</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {duplicate.gps_distance_metres != null
                          ? `${duplicate.gps_distance_metres} metres`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">
                    Image hash distance:{" "}
                    {duplicate.hamming_distance ?? "N/A"}
                  </p>

                  <Link
                    to={`/admin/duplicates/${complaint.id}`}
                    className="mt-5 inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                  >
                    Review Duplicate
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
              No duplicate candidates were returned by the backend.
            </div>
          )}
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
              Review Priority
            </label>

            <p className="mb-3 text-sm text-slate-500">
              Current backend priority: {complaint.priority || "Not assigned"}
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
              Selected priority: {priority}
            </span>
            <p className="mt-2 text-xs text-amber-700">
              Priority selection is not persisted by the current backend
              integration.
            </p>
          </div>

          {/* Department */}
          <div className="mb-6">
            <label className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
              <Building2 size={18} className="text-blue-600" />
              Department
            </label>

            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setSaved(false);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="">Select department</option>
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

            <p className="mt-2 text-xs text-amber-700">
              Department assignment is not persisted yet.
            </p>
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
                setActionMessage("");
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="reported">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
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

            <p className="mt-2 text-xs text-amber-700">
              Authority notes are not saved by the current backend API.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || status === complaint.status}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Updating..." : "Save Status Update"}
          </button>

          {actionMessage && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-lg p-4 text-sm font-medium ${
                saved
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {saved && <CheckCircle size={19} />}
              {actionMessage}
            </div>
          )}
        </form>

        {/* Information */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm leading-6 text-blue-800">
            <strong>Backend integration:</strong> Complaint details,
            duplicate candidates and status updates are connected to the
            CivicAI backend. Priority changes, department assignments and
            authority notes still require backend integration.
          </p>
        </div>
      </main>
    </div>
  );
}

export default ComplaintReview;
