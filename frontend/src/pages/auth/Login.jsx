
import { Link } from "react-router-dom";
import { ShieldCheck, Mail, Lock } from "lucide-react";

function Login() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Login API integration will be added later.");
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={19} />

              <input
                type="email"
                placeholder="Enter your email"
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
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={19} />

              <input
                type="password"
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Login
          </button>

        </form>

        {/* Registration Link */}
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Register
          </Link>
        </p>

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

export default Login;
