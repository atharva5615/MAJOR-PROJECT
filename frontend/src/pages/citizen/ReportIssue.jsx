import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  MapPin,
  Camera,
  AlertCircle,
  FileText,
  X,
  LoaderCircle,
  CheckCircle,
} from "lucide-react";
import api from "../../services/api";
import LocationPickerMap from "./LocationPickerMap";

function ReportIssue() {
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdIssueId, setCreatedIssueId] = useState(null);

  const navigate = useNavigate();

  const getErrorMessage = (err) => {
    const detail = err.response?.data?.detail;

    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join(", ");
    }

    return err.response?.data?.message || err.message ||
      "Something went wrong. Please try again.";
  };

  // Handle text and select inputs.
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "latitude" || name === "longitude") {
      setLocationAccuracy(null);
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Backend currently accepts JPG and PNG only.
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      setSubmitError("Please upload a JPG or PNG image. WEBP is not supported by the current backend.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Image size must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setSubmitError("");
  };

  // Remove uploaded image.
  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview(null);
  };

  // Detect current GPS location.
  const getCurrentLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((previous) => ({
          ...previous,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));

        setLocationAccuracy(
          Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null
        );

        setLocationLoading(false);
      },
      (error) => {
        let message = "Unable to detect your location.";

        if (error.code === 1) {
          message = "Location permission denied. Allow location access or enter coordinates manually.";
        } else if (error.code === 2) {
          message = "Your current location is unavailable. Enter coordinates manually.";
        } else if (error.code === 3) {
          message = "Location request timed out. Please try again.";
        }

        setLocationError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };


  // Update coordinates when the citizen selects a location on the map.
  const handleMapLocationChange = (latitude, longitude) => {
    setFormData((previous) => ({
      ...previous,
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
    }));

    // A manually selected map position is not a fresh GPS reading.
    setLocationAccuracy(null);
    setLocationError("");
  };

  const uploadIssueImage = async (issueId) => {
    const uploadData = new FormData();
    uploadData.append("file", image);

    // Let Axios/browser set the multipart boundary automatically.
    await api.post(`/issues/${issueId}/image`, uploadData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!image && !createdIssueId) {
      setSubmitError("Please upload an issue image.");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setSubmitError("Please provide the issue location.");
      return;
    }

    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setSubmitError("Please enter valid latitude and longitude values.");
      return;
    }

    setSubmitting(true);

    try {
      let issueId = createdIssueId;

      // Create the complaint only once. If image upload previously failed,
      // a subsequent submit retries the image upload for the same complaint.
      if (!issueId) {
        const title = `${formData.category} issue`;

        const issueResponse = await api.post("/issues/", {
          title,
          description: formData.description.trim(),
          category: formData.category,
          latitude,
          longitude,
        });

        issueId = issueResponse.data.id;

        if (!issueId) {
          throw new Error("The complaint was created, but the server did not return its ID.");
        }

        setCreatedIssueId(issueId);
      }

      await uploadIssueImage(issueId);

      navigate("/ai-results", {
        state: {
          issueId,
          category: formData.category,
          description: formData.description,
          latitude: formData.latitude,
          longitude: formData.longitude,
          imageUrl: preview,
        },
      });
    } catch (err) {
      console.error("Complaint submission error:", err);

      if (createdIssueId) {
        setSubmitError(
          `Complaint #${createdIssueId} was created, but image upload failed. Your next attempt will retry the image upload without creating another complaint. ${getErrorMessage(err)}`
        );
      } else {
        setSubmitError(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <Link
            to="/dashboard"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft size={22} />
          </Link>

          <div>
            <h1 className="text-xl font-bold text-blue-700">CivicAI</h1>
            <p className="text-xs text-slate-500">Citizen Portal</p>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            Report a Civic Issue
          </h2>
          <p className="mt-2 text-slate-500">
            Help improve your community by reporting civic problems.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          {/* Category */}
          <section>
            <label className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
              <FileText size={19} className="text-blue-600" />
              Issue Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={submitting || Boolean(createdIssueId)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select an issue category</option>
              <option value="Pothole">Pothole</option>
              <option value="Garbage">Garbage Accumulation</option>
              <option value="Streetlight">Broken Streetlight</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Other">Other</option>
            </select>
          </section>

          {/* Description */}
          <section>
            <label className="mb-3 block font-semibold text-slate-800">
              Issue Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              maxLength={1000}
              disabled={submitting || Boolean(createdIssueId)}
              placeholder="Describe the civic issue, its location and how it affects the community..."
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {formData.description.length}/1000 characters
            </p>
          </section>

          {/* Image Upload */}
          <section>
            <label className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
              <Camera size={19} className="text-blue-600" />
              Upload Issue Photograph
            </label>

            {!preview ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-blue-500 hover:bg-blue-50">
                <Upload size={35} className="text-blue-600" />
                <p className="mt-4 font-semibold text-slate-700">
                  Click to upload an image
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  JPG or PNG (Maximum 5 MB)
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageChange}
                  disabled={submitting}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={preview}
                  alt="Uploaded civic issue"
                  className="max-h-80 w-full bg-slate-100 object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={submitting || Boolean(createdIssueId)}
                  className="absolute right-3 top-3 rounded-full bg-white p-2 text-red-600 shadow hover:bg-red-50 disabled:opacity-50"
                  aria-label="Remove uploaded image"
                >
                  <X size={20} />
                </button>
                <p className="bg-white p-3 text-sm text-slate-600">
                  {image?.name}
                </p>
              </div>
            )}
          </section>

          {/* Location */}
          <section>
            <label className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
              <MapPin size={19} className="text-blue-600" />
              Issue Location
            </label>

            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading || submitting || Boolean(createdIssueId)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
            >
              {locationLoading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Detecting Location...
                </>
              ) : (
                <>
                  <MapPin size={19} />
                  Detect My Current Location
                </>
              )}
            </button>

                        {locationAccuracy !== null && (
              <div
                className={`mt-3 rounded-lg border p-4 ${
                  locationAccuracy <= 10
                    ? "border-green-200 bg-green-50"
                    : locationAccuracy <= 30
                    ? "border-emerald-200 bg-emerald-50"
                    : locationAccuracy <= 100
                    ? "border-amber-200 bg-amber-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    Estimated GPS accuracy
                  </span>

                  <span className="font-bold text-slate-900">
                    ± {locationAccuracy.toFixed(1)} metres
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold">
                  {locationAccuracy <= 10
                    ? "High accuracy"
                    : locationAccuracy <= 30
                    ? "Good accuracy"
                    : locationAccuracy <= 100
                    ? "Approximate location"
                    : "Poor location accuracy"}
                </p>

                {locationAccuracy > 30 && (
                  <p className="mt-1 text-xs text-slate-600">
                    Your location may be imprecise. Try detecting your
                    location outdoors or adjust the coordinates manually.
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-500">
                  This is the device's estimated horizontal accuracy,
                  not a guarantee of the exact issue location.
                </p>
              </div>
            )}

            {locationError && (
              <p className="mt-3 flex items-start gap-2 text-sm text-red-600">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                {locationError}
              </p>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="any"
                  min="-90"
                  max="90"
                  required
                  disabled={submitting || Boolean(createdIssueId)}
                  placeholder="e.g. 18.520430"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="any"
                  min="-180"
                  max="180"
                  required
                  disabled={submitting || Boolean(createdIssueId)}
                  placeholder="e.g. 73.856744"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <LocationPickerMap
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={handleMapLocationChange}
              disabled={submitting || Boolean(createdIssueId)}
            />

            <p className="mt-3 text-xs text-slate-500">
              You can detect your GPS coordinates or enter them manually.
            </p>
          </section>

          {/* AI Notice */}
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-slate-800">
                  AI-Powered Analysis
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Your complaint and photograph will be saved. AI-based
                  photograph analysis and priority assistance will be
                  connected when the AI backend is ready.
                </p>
              </div>
            </div>
          </div>

          {/* Submission feedback */}
          {submitError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <p>{submitError}</p>
            </div>
          )}

          {createdIssueId && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <CheckCircle size={19} className="mt-0.5 shrink-0" />
              <p>
                Complaint #{createdIssueId} has been created. Complete the
                image upload by submitting again; another complaint will not
                be created.
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/dashboard"
              className="rounded-lg border border-slate-300 px-6 py-3 text-center font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting || locationLoading}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <LoaderCircle size={19} className="animate-spin" />
              )}
              {submitting
                ? createdIssueId
                  ? "Uploading Image..."
                  : "Submitting Complaint..."
                : createdIssueId
                  ? "Retry Image Upload"
                  : "Submit Complaint"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ReportIssue;
