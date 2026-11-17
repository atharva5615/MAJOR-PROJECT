
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock } from "lucide-react";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // 1. Authenticate with the backend
      const loginResponse = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const token = loginResponse.data.access_token;

      if (!token) {
        throw new Error("Authentication token was not received.");
      }

      // 2. Save token for subsequent API requests
      localStorage.setItem("access_token", token);

      // 3. Fetch the authenticated user's profile
      const profileResponse = await api.get("/auth/me");
      const user = profileResponse.data;

      // 4. Save user profile
      localStorage.setItem("user", JSON.stringify(user));

      // 5. Redirect according to role
      if (user.role === "admin" || user.role === "officer") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "citizen") {
        navigate("/dashboard", { replace: true });
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setError("Your account has an unsupported role.");
      }
    } catch (err) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
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
            Welcome Back
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Login to your CivicAI account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

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
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Registration Link */}
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>

        <Link
          to="/"
          className="mt-5 block text-center text-sm text-slate-500 hover:text-blue-600"
        >
          Back to Home
        </Link>

      </div>
    </div>
  );
}

export default Login;
