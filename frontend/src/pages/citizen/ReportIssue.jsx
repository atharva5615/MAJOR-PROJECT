
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  MapPin,
  Camera,
  AlertCircle,
  FileText,
  X,
  LoaderCircle,
} from "lucide-react";

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

  // Handle text and select inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Remove uploaded image
  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview(null);
  };

  // Detect current GPS location
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

        setLocationLoading(false);
      },
      (error) => {
        let message = "Unable to detect your location.";

        if (error.code === 1) {
          message = "Location permission denied. Please allow location access.";
        } else if (error.code === 2) {
          message = "Your current location is unavailable.";
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

  // Submit complaint (frontend demonstration)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please upload an image of the civic issue.");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      alert("Please provide the issue location.");
      return;
    }

    console.log("Complaint details:", {
      ...formData,
      image,
    });

    alert("Complaint form validated! Backend submission will be added later.");
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
            <h1 className="text-xl font-bold text-blue-700">
              CivicAI
            </h1>

            <p className="text-xs text-slate-500">
              Citizen Portal
            </p>
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
                  JPG, PNG or WEBP (Maximum 5 MB)
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />

              </label>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-slate-200">

                <img
                  src={preview}
                  alt="Uploaded civic issue"
                  className="max-h-80 w-full object-contain bg-slate-100"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-3 top-3 rounded-full bg-white p-2 text-red-600 shadow hover:bg-red-50"
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
              disabled={locationLoading}
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
                  placeholder="e.g. 73.856744"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

            </div>

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
                  After submission, the AI engine will analyze your
                  photograph to identify the issue and assist with
                  priority assessment. This feature will be connected
                  when the AI backend is ready.
                </p>
              </div>
            </div>

          </div>

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
              className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Submit Complaint
            </button>

          </div>

        </form>

      </main>
    </div>
  );
}

export default ReportIssue;
