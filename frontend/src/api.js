const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("smartComplaintToken");

export const request = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.errors?.join(", ") || data.message || "Request failed");
  }

  return data;
};

export const authApi = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) })
};

export const complaintApi = {
  create: (payload) => request("/complaints", { method: "POST", body: JSON.stringify(payload) }),
  list: (query = "") => request(`/complaints${query}`),
  updateStatus: (id, status) => request(`/complaints/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
  remove: (id) => request(`/complaints/${id}`, { method: "DELETE" }),
  analyze: (payload) => request("/ai/analyze", { method: "POST", body: JSON.stringify(payload) })
};
