
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        full_name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      setSuccess(true);
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(
          detail.map((item) => item.msg).join(", ")
        );
      } else {
        setError(
          err.response?.data?.message ||
          "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
            <ShieldCheck size={32} className="text-blue-700" />
          </div>

          <h1 className="mt-4 text-3xl font-bold text-blue-700">
            CivicAI
          </h1>

          <h2 className="mt-6 text-2xl font-bold text-slate-800">
            Create Account
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Join your community and report civic issues
          </p>
        </div>

        {success ? (
          <div className="mt-8 text-center">
            <CheckCircle
              size={48}
              className="mx-auto text-green-600"
            />

            <h3 className="mt-4 text-xl font-bold text-green-700">
              Registration Successful!
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Your citizen account has been created.
              You can now log in to CivicAI.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
            {/* Error Message */}
            {error && (
              <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">

              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>

                <div className="relative">
                  <User
                    className="absolute left-3 top-3.5 text-slate-400"
                    size={19}
                  />

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    className="absolute left-3 top-3.5 text-slate-400"
                    size={19}
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3.5 text-slate-400"
                    size={19}
                  />

                  <input
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={8}
                    required
                    className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>

                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3.5 text-slate-400"
                    size={19}
                  />

                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    minLength={8}
                    required
                    className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </>
        )}

        {/* Login Link */}
        {!success && (
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Login
            </Link>
          </p>
        )}

        {/* Home Link */}
        <Link
          to="/"
          className="mt-5 block text-center text-sm text-slate-500 hover:text-blue-600"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Register;
