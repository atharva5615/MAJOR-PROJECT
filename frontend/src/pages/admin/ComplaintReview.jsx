
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
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("reported");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(true);
  const [departmentError, setDepartmentError] = useState("");
  const [authorityNote, setAuthorityNote] = useState("");
  const [authorityNotes, setAuthorityNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");

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

    const fetchDepartments = async () => {
      setDepartmentLoading(true);
      setDepartmentError("");

      try {
        const response = await api.get("/departments/");
        const data = response.data;
        const departmentList = Array.isArray(data)
          ? data
          : data?.departments || [];

        if (active) {
          setDepartments(departmentList);
        }
      } catch (err) {
        if (active) {
          setDepartmentError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setDepartmentLoading(false);
        }
      }
    };

    fetchDepartments();

    return () => {
      active = false;
    };
  }, []);

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
        setDepartment(
          issue.department_id != null ? String(issue.department_id) : ""
        );
        // Fetch private authority notes for this complaint.
            setNotesLoading(true);
            setNotesError("");

            try {
              const notesResponse = await api.get(
                `/issues/${id}/authority-notes`
              );

              if (active) {
                setAuthorityNotes(notesResponse.data || []);
              }
            } catch (noteError) {
              console.error("Authority notes loading error:", noteError);

              if (active) {
                setNotesError(getErrorMessage(noteError));
                setAuthorityNotes([]);
              }
            } finally {
              if (active) {
                setNotesLoading(false);
              }
            }

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
    }

    return () => {
      active = false;
    };
  }, [id]);

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
          setAiError(getErrorMessage(err));
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

const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setSaved(false);
    setActionMessage("");

    const selectedPriority = priority.toLowerCase();
    const priorityChanged =
      selectedPriority !== complaint.priority?.toLowerCase();

    const statusChanged = status !== complaint.status;
    const currentDepartmentId =
      complaint.department_id != null
        ? String(complaint.department_id)
        : "";

    // The current API supports assigning a department, but not clearing one.
    const departmentChanged =
      department !== "" && department !== currentDepartmentId;

    const noteMessage = authorityNote.trim();
    const noteChanged = noteMessage.length > 0;

    if (
      !priorityChanged &&
      !statusChanged &&
      !departmentChanged &&
      !noteChanged
    ) {
      setActionMessage("No changes to save.");
      setSaving(false);
      return;
    }

    let priorityUpdated = false;
    let statusUpdated = false;
    let departmentUpdated = false;
    let noteAdded = false;

    try {
      if (priorityChanged) {
        await api.put(`/issues/${id}/priority`, {
          priority: selectedPriority,
        });
        priorityUpdated = true;
      }

      if (statusChanged) {
        await api.put(`/issues/${id}/status`, { status });
        statusUpdated = true;
      }

      if (departmentChanged) {
        await api.put(`/issues/${id}/assign-department`, {
          department_id: Number(department),
        });
        departmentUpdated = true;
      }

      // Save a new private authority note, if one was entered.
      if (noteChanged) {
        const noteResponse = await api.post(
          `/issues/${id}/authority-notes`,
          { message: noteMessage }
        );

        noteAdded = true;
        setAuthorityNote("");
        setAuthorityNotes((previousNotes) => [
          ...previousNotes,
          noteResponse.data,
        ]);
      }

      // Refresh the complaint to reflect the latest backend values.
      const response = await api.get(`/issues/${id}`);

      setComplaint(response.data);
      setPriority(
        response.data.priority
          ? response.data.priority.charAt(0).toUpperCase() +
              response.data.priority.slice(1)
          : "Medium"
      );
      setStatus(response.data.status || "reported");
      setDepartment(
        response.data.department_id != null
          ? String(response.data.department_id)
          : ""
      );

      const updatedItems = [];
      if (priorityUpdated) updatedItems.push("priority");
      if (statusUpdated) updatedItems.push("status");
      if (departmentUpdated) updatedItems.push("department");
      if (noteAdded) updatedItems.push("authority note");

      setSaved(true);
      setActionMessage(
        `Complaint ${updatedItems.join(", ")} successfully updated.`
      );

      // Refresh note history separately. A history-refresh failure should
      // not make a successfully saved note appear unsuccessful.
      if (noteAdded) {
        try {
          const notesResponse = await api.get(
            `/issues/${id}/authority-notes`
          );
          setAuthorityNotes(notesResponse.data || []);
          setNotesError("");
        } catch (noteRefreshError) {
          console.error(
            "Authority note history refresh error:",
            noteRefreshError
          );
        }
      }
    } catch (err) {
      // Refresh complaint data even if a later update failed.
      try {
        const response = await api.get(`/issues/${id}`);

        setComplaint(response.data);
        setPriority(
          response.data.priority
            ? response.data.priority.charAt(0).toUpperCase() +
                response.data.priority.slice(1)
            : "Medium"
        );
        setStatus(response.data.status || "reported");
        setDepartment(
          response.data.department_id != null
            ? String(response.data.department_id)
            : ""
        );
      } catch {
        // Keep the original update error.
      }

      // If the note was saved before a later request failed, reload its history.
      if (noteAdded) {
        try {
          const notesResponse = await api.get(
            `/issues/${id}/authority-notes`
          );
          setAuthorityNotes(notesResponse.data || []);
          setAuthorityNote("");
        } catch (noteRefreshError) {
          console.error(
            "Authority note history refresh error:",
            noteRefreshError
          );
        }
      }

      if (
        priorityUpdated ||
        statusUpdated ||
        departmentUpdated ||
        noteAdded
      ) {
        setSaved(false);
        setActionMessage(
          `Some changes were saved, but another update failed: ${getErrorMessage(err)}`
        );
      } else {
        setActionMessage(getErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };


  if (loading && id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-blue-600" size={36} />
          <p className="mt-3 text-slate-600">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (!id || error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-white p-6">
          <h2 className="text-xl font-bold text-red-700">
            Unable to load complaint
          </h2>
          <p className="mt-2 text-slate-600">
            {!id ? "Complaint ID is missing." : error || "Complaint not found."}
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

          {aiLoading ? (
            <div className="flex items-center gap-2 py-6 text-slate-500">
              <Loader2 size={20} className="animate-spin" />
              Loading saved AI analysis...
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
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                  <h4 className="mt-2 text-2xl font-bold text-orange-700 capitalize">
                    {aiAnalysis.severity || "N/A"}
                  </h4>
                </div>

                <div className="rounded-xl bg-purple-50 p-4">
                  <p className="text-sm text-slate-500">AI Device</p>
                  <h4 className="mt-2 text-lg font-bold text-purple-700">
                    {aiAnalysis.device?.toUpperCase() || "N/A"}
                  </h4>
                </div>
              </div>

              {/* Object Detection */}
              <div className="mt-6">
                <h4 className="mb-3 font-semibold text-slate-800">
                  Object Detection (YOLO11)
                </h4>

                {aiAnalysis.detections?.length > 0 ? (
                  <div className="space-y-3">
                    {aiAnalysis.detections.map((detection, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex flex-wrap justify-between gap-2">
                          <span className="font-semibold text-slate-800">
                            {detection.label}
                          </span>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                            {(detection.confidence * 100).toFixed(2)}% confidence
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          Model: {detection.model || "Unknown"}
                        </p>

                        {detection.bbox && (
                          <p className="mt-1 text-xs text-slate-500">
                            Bounding box: {detection.bbox.map((value) => value.toFixed(1)).join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    No object detections were returned.
                  </p>
                )}
              </div>

              {/* Image Classification */}
              {aiAnalysis.classification && (
                <div className="mt-6 rounded-xl border border-purple-100 bg-purple-50 p-4">
                  <h4 className="font-semibold text-purple-900">
                    Image Classification (ResNet18)
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
                    Model: {aiAnalysis.classification.model || "Unknown"}
                  </p>
                </div>
              )}

              {/* Severity Details */}
              {aiAnalysis.severity_details && (
                <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <h4 className="font-semibold text-orange-900">
                    Severity Assessment Details
                  </h4>

                  <p className="mt-2 text-sm text-orange-800">
                    {aiAnalysis.severity_details.basis}
                  </p>

                  {aiAnalysis.severity_details.warning && (
                    <div className="mt-3 flex gap-2 rounded-lg bg-white/70 p-3 text-sm text-orange-800">
                      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                      <p>{aiAnalysis.severity_details.warning}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm leading-6 text-blue-800">
                  <strong>Citizen-reported category:</strong>{" "}
                  {complaint.category || "N/A"}
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  <strong>Current authority priority:</strong>{" "}
                  {complaint.priority || "Not assigned"}
                </p>

                <p className="mt-2 text-xs text-blue-700">
                  AI results are decision-support information. Authorities should
                  independently verify the reported issue before making decisions.
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="font-semibold text-slate-700">
                No saved AI analysis available
              </p>
              <p className="mt-1 text-sm text-slate-500">
                AI analysis has not been completed for this complaint yet.
              </p>
            </div>
          )}
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
            <p className="mt-2 text-xs text-green-700">
              Priority changes are saved to the backend.
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
                setActionMessage("");
              }}
              disabled={departmentLoading || departments.length === 0}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 disabled:bg-slate-100"
            >
              <option value="" disabled>
                {departmentLoading
                  ? "Loading departments..."
                  : "Select department"}
              </option>

              {departments.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
            </select>

            {departmentError ? (
              <p className="mt-2 text-xs text-red-600">
                Unable to load departments: {departmentError}
              </p>
            ) : (
              <p className="mt-2 text-xs text-green-700">
                Department assignments are connected to the backend.
              </p>
            )}
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
    maxLength={2000}
    placeholder="Enter your assessment, priority justification or instructions..."
    className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
  />

  <p className="mt-2 text-xs text-slate-500">
    Notes are private to authorized officers and administrators.
    Maximum 2000 characters.
  </p>

  <div className="mt-5">
    <h3 className="mb-3 font-semibold text-slate-800">
      Previous Authority Notes
    </h3>

    {notesLoading ? (
      <p className="text-sm text-slate-500">Loading notes...</p>
    ) : notesError ? (
      <p className="text-sm text-red-600">{notesError}</p>
    ) : authorityNotes.length === 0 ? (
      <p className="text-sm text-slate-500">
        No authority notes have been added yet.
      </p>
    ) : (
      <div className="space-y-3">
        {authorityNotes.map((note) => (
          <div
            key={note.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <p className="whitespace-pre-wrap text-sm text-slate-800">
              {note.message}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Officer ID: {note.officer_id} ·{" "}
              {new Date(note.created_at).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

          <button
            type="submit"
            disabled={
              saving ||
              (
                priority.toLowerCase() === complaint.priority?.toLowerCase() &&
                status === complaint.status &&
                (department === "" ||
                  department === (
                    complaint.department_id != null
                      ? String(complaint.department_id)
                      : ""
                  )) &&
                authorityNote.trim() === ""
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save Changes"}
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
            duplicate detection, priority updates, status updates,
            department assignments and private authority notes are
            connected to the CivicAI backend.
          </p>
        </div>
      </main>
    </div>
  );
}

export default ComplaintReview;
