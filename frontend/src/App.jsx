import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy-loaded pages
const Home = lazy(() => import("./Home"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));

const Dashboard = lazy(() => import("./pages/citizen/Dashboard"));
const ReportIssue = lazy(() => import("./pages/citizen/ReportIssue"));
const AIResults = lazy(() => import("./pages/citizen/AIResults"));
const MyComplaints = lazy(() => import("./pages/citizen/MyComplaints"));
const ComplaintDetails = lazy(() =>
  import("./pages/citizen/ComplaintDetails")
);

const AdminDashboard = lazy(() =>
  import("./pages/admin/AdminDashboard")
);
const ComplaintReview = lazy(() =>
  import("./pages/admin/ComplaintReview")
);
const DuplicateReview = lazy(() =>
  import("./pages/admin/DuplicateReview")
);

function PageLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-50"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="mt-3 text-sm font-medium text-slate-600">
          Loading CivicAI...
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report-issue" element={<ReportIssue />} />
          <Route path="/ai-results" element={<AIResults />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route
            path="/complaint/:id"
            element={<ComplaintDetails />}
          />

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
          <Route
            path="/admin/complaints/:id"
            element={<ComplaintReview />}
          />
          <Route
            path="/admin/duplicates/:id"
            element={<DuplicateReview />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;