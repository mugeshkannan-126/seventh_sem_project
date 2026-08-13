"use client";

import { useEffect, useState } from "react";
import { notificationsApi, usersApi, Notification, User } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TableSkeleton } from "@/components/Skeleton";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create
  const [createOpen, setCreateOpen] = useState(false);
  const [formUser, setFormUser] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [creating, setCreating] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [n, u] = await Promise.all([notificationsApi.list(), usersApi.list()]);
      setNotifications(n);
      setUsers(u);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getUserName = (id: number) => {
    const u = users.find((u) => u.user_id === id);
    return u ? u.name : `User #${id}`;
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await notificationsApi.create({
        user_id: parseInt(formUser),
        title: formTitle || undefined,
        message: formMessage || undefined,
      });
      setCreateOpen(false);
      setFormUser(""); setFormTitle(""); setFormMessage("");
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const toggleRead = async (n: Notification) => {
    try {
      const newStatus = n.status === "Read" ? "Unread" : "Read";
      await notificationsApi.update(n.notification_id, { status: newStatus });
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await notificationsApi.delete(deleteTarget.notification_id);
      setDeleteTarget(null);
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const unreadCount = notifications.filter((n) => n.status === "Unread").length;

  if (loading) return <TableSkeleton rows={6} cols={5} />;
  if (error)
    return (
      <div className="glass p-8 text-center space-y-3">
        <p className="text-danger font-medium">Failed to load notifications</p>
        <p className="text-text-dim text-sm max-w-md mx-auto">{error}</p>
        <button className="btn btn-primary text-sm mt-2" onClick={fetchData}>
          Retry Connection
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-dim">{notifications.length} notifications</span>
          {unreadCount > 0 && (
            <span className="badge bg-warning-dim text-warning">{unreadCount} unread</span>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => { setFormUser(""); setFormTitle(""); setFormMessage(""); setCreateOpen(true); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Send Notification
        </button>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Title</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.notification_id} className={n.status === "Unread" ? "!bg-accent-dim/30" : ""}>
                  <td className="text-text-muted font-mono">#{n.notification_id}</td>
                  <td className="text-text-muted text-sm">{getUserName(n.user_id)}</td>
                  <td className="font-medium text-sm">{n.title ?? "—"}</td>
                  <td className="max-w-xs">
                    <p className="text-sm text-text-muted truncate">{n.message ?? "—"}</p>
                  </td>
                  <td><StatusBadge status={n.status ?? "Unknown"} /></td>
                  <td className="text-text-dim text-xs whitespace-nowrap">
                    {n.created_at ? new Date(n.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        className="btn btn-ghost !p-1.5"
                        title={n.status === "Read" ? "Mark Unread" : "Mark Read"}
                        onClick={() => toggleRead(n)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {n.status === "Read" ? (
                            <>
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </>
                          ) : (
                            <>
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </>
                          )}
                        </svg>
                      </button>
                      <button className="btn btn-ghost !p-1.5 hover:!text-danger" title="Delete" onClick={() => setDeleteTarget(n)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {notifications.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-text-dim py-12">No notifications</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Send Notification">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">User *</label>
            <select className="input" value={formUser} onChange={(e) => setFormUser(e.target.value)}>
              <option value="">Select a user...</option>
              {users.map((u) => (
                <option key={u.user_id} value={String(u.user_id)}>
                  {u.name} ({u.email}) — {u.role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Title</label>
            <input className="input" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Notification title..." />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Message</label>
            <textarea className="input min-h-[100px] resize-y" value={formMessage} onChange={(e) => setFormMessage(e.target.value)} placeholder="Notification message..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={creating || !formUser}>
              {creating ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Notification"
        message={`Delete notification #${deleteTarget?.notification_id}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
