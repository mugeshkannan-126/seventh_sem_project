const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://civicproject-ouo8.onrender.com"
    : "http://127.0.0.1:8000")
).replace(/\/+$/, "");

// ── Generic helpers ──────────────────────────────────────────────

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
}

async function request<T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...opts.headers },
      ...opts,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Failed to connect to backend server at ${API_BASE}. ${errorMsg}`
    );
  }

  let json: ApiEnvelope<T>;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Invalid response from server (${res.status} ${res.statusText})`);
  }

  if (!res.ok || !json.success) throw new Error(json.message ?? res.statusText);
  return json.data as T;
}


// ── Types ────────────────────────────────────────────────────────

export interface Department {
  department_id: number;
  department_name: string;
  description: string | null;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "Citizen" | "Official" | "Engineer" | "Admin";
  department_id: number | null;
  created_at: string | null;
}

export interface ComplaintImage {
  image_id: number;
  complaint_id: number;
  image_url: string;
  image_type: string | null;
}

export interface StatusHistory {
  status_id: number;
  complaint_id: number;
  status: string;
  remarks: string | null;
  updated_by: number | null;
  updated_at: string | null;
}

export interface Complaint {
  complaint_id: number;
  citizen_id: number;
  department_id: number | null;
  title: string;
  description: string;
  category: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  priority: "Low" | "Medium" | "High" | null;
  status: "Submitted" | "Assigned" | "In Progress" | "Verified" | "Resolved" | "Closed" | null;
  upvotes: number;
  has_upvoted: boolean;
  created_at: string | null;
  updated_at: string | null;
  images: ComplaintImage[];
  status_histories: StatusHistory[];
}

export interface Assignment {
  assignment_id: number;
  complaint_id: number;
  official_id: number | null;
  engineer_id: number | null;
  assignment_status: "Assigned" | "Accepted" | "Completed" | null;
  remarks: string | null;
  assigned_at: string | null;
}

export interface Feedback {
  feedback_id: number;
  complaint_id: number;
  citizen_id: number;
  rating: number | null;
  comments: string | null;
  submitted_at: string | null;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  complaint_id: number | null;
  title: string | null;
  message: string | null;
  status: "Unread" | "Read" | null;
  created_at: string | null;
}

export interface DepartmentStat {
  name: string;
  count: number;
}

export interface DashboardStats {
  total_complaints: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_department: DepartmentStat[];
  total_users: number;
  users_by_role: Record<string, number>;
  total_departments: number;
  recent_complaints: Complaint[];
}

// ── Stats ────────────────────────────────────────────────────────

export const statsApi = {
  dashboard: () => request<DashboardStats>("/stats/dashboard"),
};

// ── Departments ──────────────────────────────────────────────────

export const departmentsApi = {
  list: () => request<Department[]>("/departments"),
  get: (id: number) => request<Department>(`/departments/${id}`),
  create: (data: { department_name: string; description?: string }) =>
    request<Department>("/departments", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: { department_name?: string; description?: string }) =>
    request<Department>(`/departments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request<unknown>(`/departments/${id}`, { method: "DELETE" }),
};

// ── Users ────────────────────────────────────────────────────────

export const usersApi = {
  list: () => request<User[]>("/users"),
  get: (id: number) => request<User>(`/users/${id}`),
  create: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    department_id?: number | null;
  }) => request<User>("/users/register", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    request<User>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request<unknown>(`/users/${id}`, { method: "DELETE" }),
};

// ── Complaints ───────────────────────────────────────────────────

export const complaintsApi = {
  list: () => request<Complaint[]>("/complaints"),
  get: (id: number) => request<Complaint>(`/complaints/${id}`),
  byStatus: (status: string) => request<Complaint[]>(`/complaints/status/${encodeURIComponent(status)}`),
  byDepartment: (deptId: number) => request<Complaint[]>(`/complaints/department/${deptId}`),
  byCitizen: (citizenId: number) => request<Complaint[]>(`/complaints/citizen/${citizenId}`),
  update: (id: number, data: Record<string, unknown>) =>
    request<Complaint>(`/complaints/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request<unknown>(`/complaints/${id}`, { method: "DELETE" }),
};

// ── Assignments ──────────────────────────────────────────────────

export const assignmentsApi = {
  list: () => request<Assignment[]>("/assignments"),
  get: (id: number) => request<Assignment>(`/assignments/${id}`),
  create: (data: {
    complaint_id: number;
    official_id?: number | null;
    engineer_id?: number | null;
    remarks?: string;
    assignment_status?: string;
  }) => request<Assignment>("/assignments", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    request<Assignment>(`/assignments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request<unknown>(`/assignments/${id}`, { method: "DELETE" }),
};

// ── Feedback ─────────────────────────────────────────────────────

export const feedbackApi = {
  list: () => request<Feedback[]>("/feedback"),
  byComplaint: (complaintId: number) => request<Feedback[]>(`/feedback/${complaintId}`),
  delete: (id: number) => request<unknown>(`/feedback/${id}`, { method: "DELETE" }),
};

// ── Notifications ────────────────────────────────────────────────

export const notificationsApi = {
  list: () => request<Notification[]>("/notifications"),
  byUser: (userId: number) => request<Notification[]>(`/notifications/${userId}`),
  create: (data: {
    user_id: number;
    complaint_id?: number | null;
    title?: string;
    message?: string;
  }) => request<Notification>("/notifications", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    request<Notification>(`/notifications/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request<unknown>(`/notifications/${id}`, { method: "DELETE" }),
};

// ── Status History ───────────────────────────────────────────────

export const statusApi = {
  byComplaint: (complaintId: number) => request<StatusHistory[]>(`/status/${complaintId}`),
  create: (data: {
    complaint_id: number;
    status: string;
    remarks?: string;
    updated_by?: number;
  }) => request<StatusHistory>("/status", { method: "POST", body: JSON.stringify(data) }),
};
