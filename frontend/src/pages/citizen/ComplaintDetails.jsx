import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Clock,
  CheckCircle,
  Circle,
  ClipboardList,
  Building2,
  FileText,
  ShieldCheck,
  LoaderCircle,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import api from "../../services/api";

function ComplaintDetails() {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [departmentName, setDepartmentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [departmentError, setDepartmentError] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const apiOrigin = useMemo(() => {
    const baseURL =
      api.defaults.baseURL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:8001/api/v1";

    try {
      return new URL(baseURL, window.location.origin).origin;
    } catch {
      return "http://localhost:8001";
    }
  }, []);

  useEffect(() => {
    let active = true;

    const fetchComplaint = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/issues/${id}`);

        if (active) {
          setComplaint(response.data);
        }
      } catch (err) {
        console.error("Complaint details loading error:", err);

        if (active) {
          const detail = err.response?.data?.detail;
          setError(
            typeof detail === "string"
              ? detail
              : "Unable to load this complaint. It may not exist, or you may not have permission to view it."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (id) {
      fetchComplaint();
    }

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;

    const fetchDepartment = async () => {
      if (!complaint?.department_id) {
        setDepartmentName("");
        return;
      }

      setDepartmentError("");

      try {
        const response = await api.get("/departments/");
        const departments = Array.isArray(response.data)
          ? response.data
          : response.data?.items || [];

        const department = departments.find(
          (item) => String(item.id) === String(complaint.department_id)
        );

        if (active) {
          setDepartmentName(department?.name || "");
          if (!department) {
            setDepartmentError("Assigned department details are unavailable.");
          }
        }
      } catch (err) {
        console.error("Department loading error:", err);
        if (active) {
          setDepartmentName("");
          setDepartmentError("Could not load the assigned department name.");
        }
      }
    };

    fetchDepartment();

    return () => {
      active = false;
    };
  }, [complaint?.department_id]);

  useEffect(() => {
    let active = true;

    const fetchAIAnalysis = async () => {
      setAiLoading(true);
      setAiError("");
      setAiAnalysis(null);

      try {
        const response = await api.get(`/ai/analysis/${id}`);

        if (active) {
          setAiAnalysis(response.data);
        }
      } catch (err) {
        if (active) {
          const detail = err.response?.data?.detail;

          setAiError(
            typeof detail === "string"
              ? detail
              : "Unable to load AI analysis."
          );
        }
      } finally {
        if (active) {
          setAiLoading(false);
        }
      }
    };

    if (id) {
      fetchAIAnalysis();
    }

    return () => {
      active = false;
    };
  }, [id]);

  const formatReference = (issue) => {
    if (!issue?.id) return "Reference unavailable";
    const date = issue.created_at ? new Date(issue.created_at) : new Date();
    const year = Number.isNaN(date.getTime())
      ? new Date().getFullYear()
      : date.getFullYear();

    return `CIV-${year}-${String(issue.id).padStart(3, "0")}`;
  };

  const formatDate = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const imagePath = complaint?.image_url;

  const imageUrl = !imagePath
    ? ""
    : /^https?:\/\//i.test(imagePath)
      ? imagePath
      : `${apiOrigin}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;

  const status = (complaint?.status || "reported").toLowerCase();
  const statusLabel = {
    reported: "Pending",
    in_progress: "In Progress",
    resolved: "Resolved",
  }[status] || complaint?.status || "Unknown";

  const priority = complaint?.priority
    ? complaint.priority.charAt(0).toUpperCase() +
      complaint.priority.slice(1).toLowerCase()
    : "Not assigned";

  const hasCoordinates =
    complaint?.latitude != null && complaint?.longitude != null;

  const progressSteps = [
    {
      key: "reported",
      title: "Complaint Submitted",
      description: "Your complaint was registered in CivicAI.",
      completed: true,
    },
    {
      key: "in_progress",
      title: "Work In Progress",
      description: "The complaint is being handled by the authorities.",
      completed: status === "in_progress" || status === "resolved",
    },
    {
      key: "resolved",
      title: "Issue Resolved",
      description: "The complaint has been marked as resolved.",
      completed: status === "resolved",
    },
  ];

  if (id && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="flex items-center gap-3 text-slate-600">
          <LoaderCircle size={22} className="animate-spin text-blue-600" />
          Loading complaint details...
        </div>
      </div>
    );
  }

  if (!id || error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-50 px-5 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3 text-red-700">
            <AlertCircle size={22} className="mt-0.5 shrink-0" />
            <div>
              <h2 className="font-semibold">Unable to open complaint</h2>
              <p className="mt-2 text-sm">{!id
                                            ? "No complaint ID was provided."
                                            : error || "Complaint not found."}</p>
            </div>
          </div>
          <Link
            to="/my-complaints"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={18} />
            Back to My Complaints
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link
            to="/my-complaints"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Back to My Complaints"
          >
            <ArrowLeft size={22} />
          </Link>

          <div>
            <h1 className="text-xl font-bold text-blue-700">CivicAI</h1>
            <p className="text-xs text-slate-500">Complaint Tracking</p>
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
              <p className="text-sm text-slate-500">Complaint Reference ID</p>
              <h3 className="mt-1 text-xl font-bold text-blue-700">
                {formatReference(complaint)}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Database complaint ID: {complaint.id}
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {statusLabel}
            </span>
          </div>

          <div className="my-5 border-t border-slate-100" />

          <h3 className="text-xl font-bold text-slate-900">
            {complaint.title || "Untitled complaint"}
          </h3>

          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
            {complaint.description || "No description provided."}
          </p>

          {imageUrl && (
            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <ImageIcon size={17} className="text-blue-600" />
                Uploaded photograph
              </div>
              <img
                src={imageUrl}
                alt="Photograph attached to this civic complaint"
                className="max-h-96 w-full rounded-lg bg-slate-100 object-contain"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-600" size={19} />
              <div>
                <p className="text-xs text-slate-500">Category</p>
                <p className="font-medium text-slate-800">
                  {complaint.category || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays className="text-blue-600" size={19} />
              <div>
                <p className="text-xs text-slate-500">Submitted On</p>
                <p className="font-medium text-slate-800">
                  {formatDate(complaint.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="text-blue-600" size={19} />
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="font-medium text-slate-800">
                  {complaint.address ||
                    (hasCoordinates
                      ? "Coordinates recorded"
                      : "Location not provided")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="text-blue-600" size={19} />
              <div>
                <p className="text-xs text-slate-500">Last Updated</p>
                <p className="font-medium text-slate-800">
                  {formatDateTime(complaint.updated_at) || "Not available"}
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
              {priority} Priority
            </span>

            <p className="mt-3 text-sm text-slate-500">
              This is the priority currently saved in the complaint record.
              The authority may update it after review.
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
              {complaint.department_id
                ? departmentName || "Department assigned"
                : "Not assigned yet"}
            </p>

            {departmentError && (
              <p className="mt-2 text-sm text-amber-700">
                {departmentError}
              </p>
            )}

            {complaint.department_id && (
              <p className="mt-2 text-xs text-slate-500">
                Department ID: {complaint.department_id}
              </p>
            )}
          </div>
        </section>

        {/* AI Analysis Results */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" size={22} />
            <h3 className="text-xl font-bold text-slate-900">
              AI Analysis Results
            </h3>
          </div>

          {aiLoading ? (
            <div className="flex items-center gap-2 py-6 text-slate-500">
              <LoaderCircle size={20} className="animate-spin" />
              Loading AI analysis...
            </div>
          ) : aiError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">
                AI analysis unavailable
              </p>
              <p className="mt-1 text-sm text-amber-700">{aiError}</p>
            </div>
          ) : aiAnalysis?.available ? (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-sm text-slate-500">AI Detected Category</p>
                  <h4 className="mt-2 text-lg font-bold text-blue-700">
                    {aiAnalysis.detected_category || "N/A"}
                  </h4>
                </div>

                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-sm text-slate-500">Detection Confidence</p>
                  <h4 className="mt-2 text-2xl font-bold text-green-700">
                    {aiAnalysis.confidence != null
                      ? `${(aiAnalysis.confidence * 100).toFixed(2)}%`
                      : "N/A"}
                  </h4>
                </div>

                <div className="rounded-xl bg-orange-50 p-4">
                  <p className="text-sm text-slate-500">Preliminary Severity</p>
                  <h4 className="mt-2 text-2xl font-bold capitalize text-orange-700">
                    {aiAnalysis.severity || "N/A"}
                  </h4>
                </div>

                <div className="rounded-xl bg-purple-50 p-4">
                  <p className="text-sm text-slate-500">Analysis Status</p>
                  <h4 className="mt-2 text-lg font-bold text-purple-700">
                    {aiAnalysis.model_status === "ready"
                      ? "Completed"
                      : aiAnalysis.model_status || "Unknown"}
                  </h4>
                </div>
              </div>

              {/* Image Classification */}
              {aiAnalysis.classification && (
                <div className="mt-5 rounded-xl border border-purple-100 bg-purple-50 p-4">
                  <h4 className="font-semibold text-purple-900">
                    Image Classification
                  </h4>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-lg font-bold capitalize text-purple-700">
                      {aiAnalysis.classification.label}
                    </p>

                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-purple-700">
                      {(aiAnalysis.classification.confidence * 100).toFixed(2)}% confidence
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-purple-600">
                    Model: {aiAnalysis.classification.model || "AI classifier"}
                  </p>
                </div>
              )}

              {/* Severity explanation */}
              {aiAnalysis.severity_details && (
                <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <h4 className="font-semibold text-orange-900">
                    Severity Assessment
                  </h4>

                  <p className="mt-2 text-sm text-orange-800">
                    {aiAnalysis.severity_details.basis}
                  </p>

                  {aiAnalysis.severity_details.warning && (
                    <div className="mt-3 rounded-lg bg-white/70 p-3 text-sm leading-5 text-orange-800">
                      {aiAnalysis.severity_details.warning}
                    </div>
                  )}
                </div>
              )}

              {/* Citizen vs AI information */}
              <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Your reported category:</strong>{" "}
                  {complaint.category || "Not provided"}
                </p>

                <p className="mt-2 text-sm text-blue-800">
                  <strong>Authority-assigned priority:</strong>{" "}
                  {priority}
                </p>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                AI analysis is an automated assessment and may not be fully accurate.
                The authorities review the information before taking action.
              </p>
            </>
          ) : (
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="font-semibold text-slate-700">
                AI analysis is not available yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                An AI assessment has not been saved for this complaint.
              </p>
            </div>
          )}
        </section>

        {/* Status Progress */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-7">
            <h3 className="text-xl font-bold text-slate-900">
              Complaint Progress
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Current progress based on the status saved by the authorities.
            </p>
          </div>

          <div className="space-y-7">
            {progressSteps.map((step, index) => (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {step.completed ? (
                    <CheckCircle
                      size={24}
                      className="shrink-0 text-green-600"
                    />
                  ) : (
                    <Circle size={24} className="shrink-0 text-slate-300" />
                  )}

                  {index !== progressSteps.length - 1 && (
                    <div
                      className={`mt-2 min-h-12 w-0.5 ${
                        step.completed ? "bg-green-300" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>

                <div className="pb-2">
                  <h4
                    className={`font-semibold ${
                      step.completed ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    {step.description}
                  </p>
                  {index === 0 && complaint.created_at && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={13} />
                      {formatDateTime(complaint.created_at)}
                    </p>
                  )}
                  {index === 1 && status === "in_progress" && complaint.updated_at && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={13} />
                      Last updated: {formatDateTime(complaint.updated_at)}
                    </p>
                  )}
                  {index === 2 && status === "resolved" && complaint.updated_at && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={13} />
                      Last updated: {formatDateTime(complaint.updated_at)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-5 rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-800">
            This progress indicator reflects the complaint's current status.
            A detailed, timestamped action history is not yet available from
            the backend.
          </p>
        </section>

        {/* Location Coordinates */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Reported Coordinates
          </h3>

          {hasCoordinates ? (
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
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No GPS coordinates were saved for this complaint.
            </p>
          )}
        </section>

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
