import { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  LogOut,
  MapPin,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus
} from "lucide-react";
import { authApi, complaintApi } from "./api";

const blankComplaint = {
  name: "",
  email: "",
  title: "",
  description: "",
  category: "Water Supply",
  location: "",
  status: "Pending"
};

const categories = ["Water Supply", "Electricity", "Sanitation", "Roads", "Health", "Police", "Other"];
const statuses = ["Pending", "In Progress", "Resolved", "Rejected"];

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("smartComplaintUser") || "null"));
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [complaint, setComplaint] = useState(blankComplaint);
  const [complaints, setComplaints] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const total = complaints.length;
    const high = complaints.filter((item) => ["High", "Critical"].includes(item.aiAnalysis?.priority)).length;
    const resolved = complaints.filter((item) => item.status === "Resolved").length;
    return { total, high, resolved };
  }, [complaints]);

  const loadComplaints = async () => {
    if (!user) return;
    const params = new URLSearchParams();
    if (categoryFilter) params.set("category", categoryFilter);
    if (locationSearch) params.set("location", locationSearch);
    const query = params.toString() ? `?${params.toString()}` : "";
    const data = await complaintApi.list(query);
    setComplaints(data.complaints || []);
  };

  useEffect(() => {
    loadComplaints().catch((error) => setMessage(error.message));
  }, [user, categoryFilter]);

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = authMode === "login" ? await authApi.login(authForm) : await authApi.signup(authForm);
      localStorage.setItem("smartComplaintToken", data.token);
      localStorage.setItem("smartComplaintUser", JSON.stringify(data.user));
      setUser(data.user);
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setMessage("");

    try {
      const data = await complaintApi.analyze(complaint);
      setAnalysis(data.analysis);
      setMessage("AI analysis ready");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await complaintApi.create(complaint);
      setAnalysis(data.complaint.aiAnalysis);
      setComplaint({ ...blankComplaint, name: complaint.name, email: complaint.email });
      setMessage("Complaint submitted and AI-classified successfully");
      await loadComplaints();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await complaintApi.updateStatus(id, status);
      setComplaints((items) => items.map((item) => (item._id === id ? { ...item, status } : item)));
      setMessage("Status updated");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await complaintApi.remove(id);
      setComplaints((items) => items.filter((item) => item._id !== id));
      setMessage("Complaint removed");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("smartComplaintToken");
    localStorage.removeItem("smartComplaintUser");
    setUser(null);
    setComplaints([]);
  };

  if (!user) {
    return (
      <main className="auth-screen">
        <section className="auth-brand">
          <div className="brand-mark">
            <BrainCircuit size={34} />
          </div>
          <p className="eyebrow">AI308B MERN Case Study</p>
          <h1>Smart Complaint Management System</h1>
          <p>
            Register public complaints, classify urgency with AI, assign departments, and track resolution through a secure dashboard.
          </p>
          <div className="feature-strip">
            <span><ShieldCheck size={18} /> JWT Auth</span>
            <span><Sparkles size={18} /> AI Analysis</span>
            <span><ClipboardList size={18} /> Live Tracking</span>
          </div>
        </section>

        <form className="auth-card" onSubmit={handleAuth}>
          <div className="tabs">
            <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>
              Login
            </button>
            <button type="button" className={authMode === "signup" ? "active" : ""} onClick={() => setAuthMode("signup")}>
              Signup
            </button>
          </div>

          {authMode === "signup" && (
            <label>
              Full Name
              <input value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} placeholder="Rahul Kumar" />
            </label>
          )}

          <label>
            Email
            <input type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} placeholder="rahul@gmail.com" />
          </label>
          <label>
            Password
            <input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} placeholder="Minimum 6 characters" />
          </label>

          {authMode === "signup" && (
            <label>
              Role
              <select value={authForm.role} onChange={(event) => setAuthForm({ ...authForm, role: event.target.value })}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          <button className="primary-btn" disabled={loading}>
            <UserPlus size={18} />
            {loading ? "Please wait..." : authMode === "login" ? "Login Securely" : "Create Account"}
          </button>
          {message && <p className="notice">{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">AI Driven Full Stack Development</p>
          <h1>Smart Complaint Command Center</h1>
        </div>
        <button className="ghost-btn" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <section className="metrics">
        <article>
          <span>Total Complaints</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>High Priority</span>
          <strong>{stats.high}</strong>
        </article>
        <article>
          <span>Resolved</span>
          <strong>{stats.resolved}</strong>
        </article>
      </section>

      {message && <div className="toast">{message}</div>}

      <section className="workspace">
        <form className="panel complaint-form" onSubmit={handleSubmitComplaint}>
          <div className="panel-title">
            <Send size={20} />
            <h2>Complaint Registration</h2>
          </div>

          <div className="grid two">
            <label>
              Name
              <input value={complaint.name} onChange={(event) => setComplaint({ ...complaint, name: event.target.value })} placeholder="Rahul Kumar" />
            </label>
            <label>
              Email
              <input type="email" value={complaint.email} onChange={(event) => setComplaint({ ...complaint, email: event.target.value })} placeholder="rahul@gmail.com" />
            </label>
          </div>

          <label>
            Complaint Title
            <input value={complaint.title} onChange={(event) => setComplaint({ ...complaint, title: event.target.value })} placeholder="Water Leakage Issue" />
          </label>

          <label>
            Complaint Description
            <textarea value={complaint.description} onChange={(event) => setComplaint({ ...complaint, description: event.target.value })} placeholder="Water pipeline damaged near market area." />
          </label>

          <div className="grid three">
            <label>
              Category
              <select value={complaint.category} onChange={(event) => setComplaint({ ...complaint, category: event.target.value })}>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              Location
              <input value={complaint.location} onChange={(event) => setComplaint({ ...complaint, location: event.target.value })} placeholder="Ghaziabad" />
            </label>
            <label>
              Status
              <select value={complaint.status} onChange={(event) => setComplaint({ ...complaint, status: event.target.value })}>
                {statuses.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={handleAnalyze} disabled={loading}>
              <BrainCircuit size={18} />
              Analyze
            </button>
            <button className="primary-btn" disabled={loading}>
              <CheckCircle2 size={18} />
              Submit Complaint
            </button>
          </div>
        </form>

        <aside className="panel ai-panel">
          <div className="panel-title">
            <Sparkles size={20} />
            <h2>AI Analysis Result</h2>
          </div>
          {analysis ? (
            <div className="analysis-card">
              <span className={`priority ${analysis.priority?.toLowerCase()}`}>{analysis.priority}</span>
              <h3>{analysis.department}</h3>
              <p>{analysis.summary}</p>
              <div className="auto-response">{analysis.response}</div>
            </div>
          ) : (
            <div className="empty-state">Run AI analysis or submit a complaint to view urgency, department, summary, and auto response.</div>
          )}
        </aside>
      </section>

      <section className="panel list-panel">
        <div className="list-header">
          <div className="panel-title">
            <ClipboardList size={20} />
            <h2>Complaint List & Status Update</h2>
          </div>
          <div className="filters">
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="">All Categories</option>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <div className="searchbox">
              <MapPin size={16} />
              <input value={locationSearch} onChange={(event) => setLocationSearch(event.target.value)} placeholder="Search location" />
              <button type="button" onClick={loadComplaints} aria-label="Search by location">
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="complaint-list">
          {complaints.map((item) => (
            <article className="complaint-card" key={item._id}>
              <div>
                <span className={`priority ${item.aiAnalysis?.priority?.toLowerCase()}`}>{item.aiAnalysis?.priority || "Medium"}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="meta">
                  <span>{item.category}</span>
                  <span>{item.location}</span>
                  <span>{item.aiAnalysis?.department}</span>
                </div>
              </div>
              <div className="status-tools">
                <select value={item.status} onChange={(event) => handleStatusChange(item._id, event.target.value)}>
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
                <button className="icon-btn" onClick={() => handleDelete(item._id)} aria-label="Delete complaint">
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
          {!complaints.length && <div className="empty-state">No complaints found. Submit a complaint or adjust filters.</div>}
        </div>
      </section>
    </main>
  );
}

export default App;
