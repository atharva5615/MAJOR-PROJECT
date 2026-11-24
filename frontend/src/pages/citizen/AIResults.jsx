import { useEffect, useRef, useState } from "react";
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

  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisRetry, setAnalysisRetry] = useState(0);

  // Prevent duplicate inference requests during React Strict Mode effect replay.
  const analysisRequestRef = useRef({
    issueId: null,
    promise: null,
  });

  const [duplicates, setDuplicates] = useState([]);
  const [duplicatesLoading, setDuplicatesLoading] = useState(false);
  const [duplicatesError, setDuplicatesError] = useState("");

  const category = complaintData.category || "Not provided";
  const description =
    complaintData.description || "No description provided";

  const locationText =
    complaintData.latitude != null && complaintData.longitude != null
      ? `${complaintData.latitude}, ${complaintData.longitude}`
      : "Location not provided";

  const visibleAnalysisError = !issueId
  ? "Complaint ID was not provided. Open this page by submitting a complaint."
  : analysisError;

  // Retrieve an existing analysis first.
  // Run inference only if the backend confirms that no analysis exists.
  useEffect(() => {
    let active = true;

    if (!issueId) {
      return () => {
        active = false;
      };
    }

    const loadAnalysis = async () => {
      await Promise.resolve();

      if (!active) return;

      setAnalysis(null);
      setAnalysisError("");
      setAnalysisLoading(true);

      try {
        let requestEntry = analysisRequestRef.current;

        if (
          !requestEntry.promise ||
          requestEntry.issueId !== issueId
        ) {
          const requestPromise = (async () => {
            try {
              const savedResponse = await api.get(
                `/ai/analysis/${issueId}`
              );

              return savedResponse.data;
            } catch (error) {
              const detail = error.response?.data?.detail;

              const analysisNotPerformed =
                error.response?.status === 404 &&
                detail ===
                  "AI analysis has not been performed for this issue";

              // Do not run inference for unrelated 404, permission,
              // missing-image, or connectivity errors.
              if (!analysisNotPerformed) {
                throw error;
              }

              const newResponse = await api.post(
                `/ai/analyze/${issueId}`
              );

              return newResponse.data;
            }
          })();

          requestEntry = {
            issueId,
            promise: requestPromise,
          };

          analysisRequestRef.current = requestEntry;
        }

        const result = await requestEntry.promise;

        if (active) {
          setAnalysis(result);
        }
      } catch (error) {
        console.error("AI analysis request failed:", error);

        if (active) {
          const detail = error.response?.data?.detail;

          setAnalysisError(
            typeof detail === "string"
              ? detail
              : "AI analysis could not be completed. Your complaint has still been submitted."
          );
        }
      } finally {
        if (active) {
          setAnalysisLoading(false);
        }
      }
    };

    loadAnalysis();

    return () => {
      active = false;
    };
  }, [issueId, analysisRetry]);

  // Fetch possible duplicate complaints independently of AI analysis.
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
            : response.data?.duplicate_candidates ||
              response.data?.duplicates ||
              response.data?.candidates ||
              [];

          setDuplicates(candidates);
        }
      } catch (err) {
        console.error(
          "Duplicate detection request failed:",
          err
        );

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
        if (active) {
          setDuplicatesLoading(false);
        }
      }
    };

    fetchDuplicates();

    return () => {
      active = false;
    };
  }, [issueId]);

  const retryAIAnalysis = () => {
    // Clear the cached failed request so a new attempt can be made.
    analysisRequestRef.current = {
      issueId: null,
      promise: null,
    };

    setAnalysisRetry((previous) => previous + 1);
  };

  const formatComplaintReference = (candidateId) => {
    const year = new Date().getFullYear();

    return `CIV-${year}-${String(candidateId).padStart(3, "0")}`;
  };

  const formatDistance = (distance) => {
    if (distance == null) return "Distance unavailable";

    const metres = Number(distance);

    if (!Number.isFinite(metres)) {
      return "Distance unavailable";
    }

    return metres < 1000
      ? `${metres.toFixed(0)} metres away`
      : `${(metres / 1000).toFixed(2)} km away`;
  };

  const formatSimilarity = (similarity) => {
    if (similarity == null) return "Unavailable";

    const value = Number(similarity);

    return Number.isFinite(value)
      ? `${Math.round(value)}%`
      : "Unavailable";
  };

  const formatConfidence = (confidence) => {
    if (confidence == null) return "Unavailable";

    const value = Number(confidence);

    return Number.isFinite(value)
      ? `${(value * 100).toFixed(1)}%`
      : "Unavailable";
  };

  const formatModelLabel = (label) => {
    if (!label) return "Not available";

    return String(label)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
      );
  };

  const normalizeCategoryLabel = (label) => {
  if (!label) return "";

  const normalized = String(label)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const aliases = {
    "pothole": "potholes",
    "pothole issue": "potholes",
    "pothole issues": "potholes",
    "potholes": "potholes",
  };

  return aliases[normalized] || normalized;
};

  const yoloCategory =
    analysis?.detected_category ||
    analysis?.detections?.[0]?.label ||
    null;

  const classification = analysis?.classification || null;

  const severity =
    analysis?.severity ||
    analysis?.severity_details?.severity ||
    null;

  const modelLabelsDiffer =
    Boolean(yoloCategory && classification?.label) &&
    normalizeCategoryLabel(yoloCategory) !==
      normalizeCategoryLabel(classification.label);

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
            <span className="font-semibold">
              CivicAI Analysis
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Complaint Submission Results
          </h1>

          <p className="mt-2 text-slate-500">
            Your complaint and photograph have been submitted.
            AI-based image analysis is shown below.
          </p>
        </div>

        {/* Complaint information */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={22} />
            <h2 className="text-lg font-semibold text-slate-900">
              Complaint Submitted
            </h2>
          </div>

          <div className="mb-5 rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-800">
              Your complaint reference
            </p>

            <p className="mt-1 text-xl font-bold text-green-900">
              {issueId
                ? `CIV-${new Date().getFullYear()}-${String(issueId).padStart(3, "0")}`
                : "Reference unavailable"}
            </p>

            {issueId && (
              <p className="mt-1 text-xs text-green-800">
                Database complaint ID: {issueId}
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">
                Submitted Category
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-900">
                {category}
              </h3>

              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                {description}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                AI Detection
              </p>

              {analysisLoading ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Analyzing your photograph...
                </div>
              ) : visibleAnalysisError ? (
                <div className="mt-2">
                  <p className="text-sm text-red-600">
                    {visibleAnalysisError}
                  </p>

                  <button
                    type="button"
                    onClick={retryAIAnalysis}
                    className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Retry AI Analysis
                  </button>
                </div>
              ) : analysis?.available ? (
                <div className="mt-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {formatModelLabel(yoloCategory)}
                  </h3>

                  {yoloCategory && (
                    <p className="mt-1 text-sm text-slate-600">
                      YOLO11 detection confidence:{" "}
                      {formatConfidence(
                        analysis.confidence ??
                          analysis.detections?.[0]?.confidence
                      )}
                    </p>
                  )}

                  {!yoloCategory && (
                    <p className="text-sm text-slate-600">
                      No supported object detection was returned
                      by YOLO11.
                    </p>
                  )}
                </div>
              ) : analysis ? (
                <p className="mt-2 text-sm text-slate-600">
                  {analysis.message ||
                    "AI analysis is currently unavailable."}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  AI analysis has not been completed.
                </p>
              )}
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

        {/* AI model results */}
        <div className="mb-6 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Brain className="text-blue-600" size={22} />
            <h2 className="text-lg font-semibold text-slate-900">
              AI Image Analysis
            </h2>
          </div>

          {analysisLoading ? (
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-5">
              <LoaderCircle
                size={22}
                className="animate-spin text-blue-600"
              />

              <div>
                <p className="font-medium text-blue-900">
                  Processing your photograph
                </p>
                <p className="text-sm text-blue-700">
                  YOLO11 and ResNet18 are analyzing the submitted image.
                </p>
              </div>
            </div>
          ) : analysisError ? (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="font-medium text-red-800">
                AI analysis could not be completed
              </p>

              <p className="mt-1 text-sm text-red-700">
                {analysisError}
              </p>

              <button
                type="button"
                onClick={retryAIAnalysis}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Retry AI Analysis
              </button>
            </div>
          ) : analysis?.available ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* YOLO results */}
                <div className="rounded-xl bg-blue-50 p-5">
                  <p className="text-sm font-semibold text-blue-800">
                    YOLO11 Object Detection
                  </p>

                  <h3 className="mt-3 text-lg font-bold text-slate-900">
                    {yoloCategory
                      ? formatModelLabel(yoloCategory)
                      : "No detection"}
                  </h3>

                  {analysis.detections?.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {analysis.detections.map(
                        (detection, index) => (
                          <div
                            key={`${detection.label}-${index}`}
                            className="border-t border-blue-200 pt-3"
                          >
                            <p className="text-sm font-medium text-slate-800">
                              {formatModelLabel(detection.label)}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              Confidence:{" "}
                              {formatConfidence(
                                detection.confidence
                              )}
                            </p>

                            {detection.bbox && (
                              <p className="mt-1 text-xs text-slate-500">
                                Bounding box:{" "}
                                {detection.bbox
                                  .map((coordinate) =>
                                    Number(coordinate).toFixed(1)
                                  )
                                  .join(", ")}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">
                      YOLO11 did not return any supported object
                      detections for this image.
                    </p>
                  )}
                </div>

                {/* ResNet results */}
                <div className="rounded-xl bg-purple-50 p-5">
                  <p className="text-sm font-semibold text-purple-800">
                    ResNet18 Image Classification
                  </p>

                  {classification ? (
                    <>
                      <h3 className="mt-3 text-lg font-bold text-slate-900">
                        {formatModelLabel(classification.label)}
                      </h3>

                      <p className="mt-2 text-sm text-slate-600">
                        Classification confidence:{" "}
                        {formatConfidence(
                          classification.confidence
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">
                      No image classification result was returned.
                    </p>
                  )}
                </div>
              </div>

              {modelLabelsDiffer && (
                <div className="mt-5 flex items-start gap-3 rounded-lg bg-amber-50 p-4">
                  <AlertTriangle
                    size={20}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <div>
                    <p className="font-semibold text-amber-900">
                      Different model labels returned
                    </p>

                    <p className="mt-1 text-sm text-amber-800">
                      YOLO11 returned "
                      {formatModelLabel(yoloCategory)}", while
                      ResNet18 returned "
                      {formatModelLabel(classification.label)}".
                      These models use separate prediction methods
                      and label sets. The difference should be
                      reviewed rather than treated as a confirmed
                      category.
                    </p>
                  </div>
                </div>
              )}

              {/* Severity */}
              <div className="mt-5 rounded-xl border border-slate-200 p-5">
                <p className="text-sm font-semibold text-slate-600">
                  Preliminary AI Severity Assessment
                </p>

                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {severity
                    ? formatModelLabel(severity)
                    : "Not assessed"}
                </h3>

                {analysis.severity_details?.basis && (
                  <p className="mt-2 text-sm text-slate-600">
                    Basis: {analysis.severity_details.basis}
                  </p>
                )}

                <p className="mt-3 text-sm text-amber-700">
                  {analysis.severity_details?.warning ||
                    "This is preliminary AI triage only. Human inspection is required to determine actual damage severity."}
                </p>
              </div>

              <div className="mt-4 text-xs text-slate-500">
                Model status: {analysis.model_status || "Unknown"}
                {analysis.device && (
                  <> · Inference device: {analysis.device}</>
                )}
              </div>

              {analysis.message && (
                <p className="mt-2 text-sm text-slate-600">
                  {analysis.message}
                </p>
              )}
            </>
          ) : analysis ? (
            <div className="rounded-lg bg-amber-50 p-4">
              <p className="font-medium text-amber-900">
                AI analysis is not currently available
              </p>

              <p className="mt-1 text-sm text-amber-800">
                {analysis.message ||
                  "The complaint was submitted, but AI analysis is unavailable."}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              AI analysis has not been completed.
            </p>
          )}
        </div>

        {/* Duplicate detection */}
        <div className="mb-6 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle
              className="text-orange-500"
              size={22}
            />

            <h2 className="text-lg font-semibold text-slate-900">
              Possible Existing Complaints
            </h2>
          </div>

          {duplicatesLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
              Checking for nearby similar complaints...
            </div>
          ) : duplicatesError ? (
            <p className="text-sm text-slate-600">
              {duplicatesError}
            </p>
          ) : duplicates.length === 0 ? (
            <p className="text-sm text-slate-600">
              No similar complaints were returned by the duplicate
              detection service.
            </p>
          ) : (
            <>
              <p className="mb-5 text-sm text-slate-600">
                The backend found {duplicates.length} potentially
                similar complaint
                {duplicates.length === 1 ? "" : "s"}. Please review
                these matches with the municipal authority if needed.
              </p>

              <div className="space-y-3">
                {duplicates.map((candidate) => {
                  const candidateId =
                    candidate.issue_id ?? candidate.id;

                  const similarity =
                    candidate.image_similarity_percentage;

                  const distance =
                    candidate.gps_distance_metres;

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
                          Image hash difference:{" "}
                          {candidate.hamming_distance}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <p className="mt-4 text-xs text-slate-500">
            Similarity and distance are backend duplicate-detection
            signals, not a final decision that two complaints are
            identical.
          </p>
        </div>

        {/* Next steps */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-1 text-blue-600"
              size={22}
            />

            <div>
              <h2 className="font-semibold text-slate-900">
                What happens next?
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your complaint is saved and can be tracked from your
                citizen dashboard. The municipal authority can review
                the AI results and decide whether a possible match is
                a duplicate.
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
      </div>
    </div>
  );
}

export default AIResults;