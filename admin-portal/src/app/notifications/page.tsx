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
  const [statusFilter, setStatusFilter] = useState("");

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

  useEffect(() => {
    fetchData();
  }, []);

  const getUserName = (id: number) => {
    const u = users.find((u) => u.user_id === id);
    return u ? `${u.name} (${u.role})` : `User #${id}`;
  };

  const handleCreate = async () => {
    if (!formUser || !formTitle.trim()) {
      alert("Recipient User and Notification Title are required.");
      return;
    }
    setCreating(true);
    try {
      await notificationsApi.create({
        user_id: parseInt(formUser),
        title: formTitle || undefined,
        message: formMessage || undefined,
      });
      setCreateOpen(false);
      setFormUser("");
      setFormTitle("");
      setFormMessage("");
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

  const filtered = notifications.filter((n) => {
    if (statusFilter && n.status !== statusFilter) return false;
    return true;
  });

  if (loading) return <TableSkeleton rows={6} cols={5} />;
  if (error)
    return (
      <div className="gov-card p-8 text-center space-y-3 bg-white">
        <p className="text-rose-700 font-bold text-sm">Failed to load official notifications</p>
        <p className="text-slate-500 text-xs">{error}</p>
        <button className="btn btn-primary text-xs mt-2" onClick={fetchData}>
          Retry Connection
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto sm:!w-44 text-xs font-semibold"
          >
            <option value="">All Notifications</option>
            <option value="Unread">Unread ({unreadCount})</option>
            <option value="Read">Read ({notifications.length - unreadCount})</option>
          </select>
          <span className="text-xs text-slate-500 font-mono">
            {filtered.length} of {notifications.length} Bulletins
          </span>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="px-3.5 py-2 bg-[#0b3c68] hover:bg-[#072847] text-white text-xs font-bold rounded shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Issue Directive / Bulletin
        </button>
      </div>

      {/* Notifications Table */}
      <div className="gov-card overflow-hidden bg-white max-w-full">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="w-20">NID</th>
                <th>Recipient Personnel / Citizen</th>
                <th>Subject &amp; Directive Narration</th>
                <th className="w-28">Status</th>
                <th className="w-32">Timestamp</th>
                <th className="w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={n.notification_id} className="hover:bg-slate-50">
                  <td className="font-mono text-xs font-bold text-[#0b3c68]">
                    #{n.notification_id}
                  </td>

                  <td>
                    <span className="font-bold text-xs text-slate-900 block">
                      {getUserName(n.user_id)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      UID: #{n.user_id}
                    </span>
                  </td>

                  <td className="max-w-md">
                    <span className="font-bold text-xs text-slate-900 block">
                      {n.title || "Official Communication"}
                    </span>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                      {n.message || "—"}
                    </p>
                  </td>

                  <td>
                    <button
                      onClick={() => toggleRead(n)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      title="Click to toggle Read/Unread"
                    >
                      <StatusBadge status={n.status ?? "Unread"} />
                    </button>
                  </td>

                  <td className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                    {n.created_at
                      ? new Date(n.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>

                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleRead(n)}
                        className="px-2 py-1 text-xs border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700"
                        title="Toggle Status"
                      >
                        {n.status === "Read" ? "Mark Unread" : "Mark Read"}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(n)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                        title="Delete Notification"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-slate-500 py-10 text-xs">
                    No official notifications found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Issue Official Notification / Bulletin">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Recipient User / Official *</label>
            <select
              value={formUser}
              onChange={(e) => setFormUser(e.target.value)}
              className="input text-xs"
            >
              <option value="">— Select Target Recipient —</option>
              {users.map((u) => (
                <option key={u.user_id} value={String(u.user_id)}>
                  {u.name} ({u.role} - {u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Subject / Bulletin Title *</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Directive: Immediate Inspection of Drainage Pipeline"
              className="input text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Message Body</label>
            <textarea
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
              placeholder="Enter official directives, compliance deadlines, or service updates..."
              className="input text-xs min-h-[90px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button className="btn btn-secondary text-xs" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary text-xs" onClick={handleCreate} disabled={creating}>
              {creating ? "Dispatching..." : "Dispatch Notification"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Notification Entry"
        message={`Are you sure you want to remove notification #${deleteTarget?.notification_id}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
