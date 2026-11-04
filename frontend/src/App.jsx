
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/citizen/Dashboard";
import ReportIssue from "./pages/citizen/ReportIssue";
import AIResults from "./pages/citizen/AIResults";
import MyComplaints from "./pages/citizen/MyComplaints";
import ComplaintDetails from "./pages/citizen/ComplaintDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ComplaintReview from "./pages/admin/ComplaintReview";
import DuplicateReview from "./pages/admin/DuplicateReview";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report-issue" element={<ReportIssue />} />
        <Route path="/ai-results" element={<AIResults />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
        <Route path="/complaint/:id" element={<ComplaintDetails />}/>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/complaints/:id" element={<ComplaintReview />}/>
        <Route path="/admin/duplicates/:id" element={<DuplicateReview />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
