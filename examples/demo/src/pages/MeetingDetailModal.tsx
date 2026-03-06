import { useState, useEffect } from "react";
import type {
  Meeting,
  MeetingRegistrant,
  UpdateMeetingRequest,
  UpdateRegistrantRequest,
} from "ermis-ekyc-sdk";
import { useMeetingStore } from "../stores/meetingStore";

type Tab = "info" | "registrants";

interface Props {
  meeting: Meeting;
  onClose: () => void;
  onUpdated: () => void;
}

export function MeetingDetailModal({ meeting, onClose, onUpdated }: Props) {
  const { updateMeeting, fetchRegistrants, updateRegistrant } =
    useMeetingStore();

  const [tab, setTab] = useState<Tab>("info");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Meeting edit state ──────────────────────────────────
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [meetingForm, setMeetingForm] = useState<UpdateMeetingRequest>({
    title: meeting.title,
    description: meeting.description,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    location: meeting.location || "",
  });

  // ── Registrants state ───────────────────────────────────
  const [registrants, setRegistrants] = useState<MeetingRegistrant[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [editingRegId, setEditingRegId] = useState<string | null>(null);
  const [regForm, setRegForm] = useState<UpdateRegistrantRequest>({});

  // Load registrants when tab switches
  useEffect(() => {
    if (tab === "registrants" && registrants.length === 0) {
      setLoadingRegs(true);
      fetchRegistrants(meeting._id)
        .then((data) => setRegistrants(Array.isArray(data) ? data : []))
        .catch(() => setError("Không thể tải danh sách người tham gia"))
        .finally(() => setLoadingRegs(false));
    }
  }, [tab]);

  // ── Meeting actions ─────────────────────────────────────
  const handleSaveMeeting = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateMeeting(meeting._id, meetingForm);
      setIsEditingMeeting(false);
      onUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Registrant actions ──────────────────────────────────
  const startEditReg = (reg: MeetingRegistrant) => {
    setEditingRegId(reg._id);
    setRegForm({
      firstName: reg.firstName,
      lastName: reg.lastName,
      phoneNumber: reg.phoneNumber,
      email: reg.email || "",
    });
  };

  const handleSaveReg = async () => {
    if (!editingRegId) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateRegistrant(
        meeting._id,
        editingRegId,
        regForm,
      );
      setRegistrants((prev) =>
        prev.map((r) => (r._id === editingRegId ? updated : r)),
      );
      setEditingRegId(null);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Cập nhật registrant thất bại",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const toDatetimeLocal = (iso: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return iso;
    }
  };

  const roleLabel = (role: string) =>
    role === "HOST" ? "HOST (Thẩm định viên)" : "GUEST (Khách hàng)";

  const roleBadge = (role: string) =>
    role === "HOST"
      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
      : "bg-purple-500/10 text-purple-400 border-purple-500/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              Chi tiết phiên thẩm định
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{meeting.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)]">
          {(
            [
              { key: "info", label: "Thông tin phiên" },
              { key: "registrants", label: "Người tham gia" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${tab === key
                ? "text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5"
                : "text-slate-400 hover:text-slate-200"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm flex items-center gap-2">
            ⚠️ {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400/60 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {/* ──── Tab: Thông tin phiên ──── */}
          {tab === "info" && (
            <div>
              {!isEditingMeeting ? (
                /* View mode */
                <div className="space-y-4">
                  <InfoRow label="Tiêu đề" value={meeting.title} />
                  <InfoRow
                    label="Mô tả"
                    value={meeting.description || "—"}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow
                      label="Bắt đầu"
                      value={formatDate(meeting.startTime)}
                    />
                    <InfoRow
                      label="Kết thúc"
                      value={formatDate(meeting.endTime)}
                    />
                  </div>
                  <InfoRow label="Địa điểm" value={meeting.location || "—"} />
                  {meeting.ermisRoomCode && (
                    <InfoRow label="Room Code" value={meeting.ermisRoomCode} />
                  )}
                  <div className="pt-2">
                    <button
                      onClick={() => setIsEditingMeeting(true)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[0_2px_12px_var(--color-accent-glow)] hover:shadow-[0_4px_20px_var(--color-accent-glow)] transition-all"
                    >
                      ✏️ Sửa thông tin
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit mode */
                <div className="space-y-4">
                  <FormField label="Tiêu đề">
                    <input
                      type="text"
                      value={meetingForm.title || ""}
                      onChange={(e) =>
                        setMeetingForm((p) => ({
                          ...p,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </FormField>
                  <FormField label="Mô tả">
                    <textarea
                      value={meetingForm.description || ""}
                      onChange={(e) =>
                        setMeetingForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 resize-none"
                    />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Bắt đầu">
                      <input
                        type="datetime-local"
                        value={toDatetimeLocal(meetingForm.startTime || "")}
                        onChange={(e) =>
                          setMeetingForm((p) => ({
                            ...p,
                            startTime: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </FormField>
                    <FormField label="Kết thúc">
                      <input
                        type="datetime-local"
                        value={toDatetimeLocal(meetingForm.endTime || "")}
                        onChange={(e) =>
                          setMeetingForm((p) => ({
                            ...p,
                            endTime: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </FormField>
                  </div>
                  <FormField label="Địa điểm">
                    <input
                      type="text"
                      value={meetingForm.location || ""}
                      onChange={(e) =>
                        setMeetingForm((p) => ({
                          ...p,
                          location: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </FormField>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveMeeting}
                      disabled={isSaving}
                      className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_2px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
                    >
                      {isSaving ? "Đang lưu..." : "💾 Lưu"}
                    </button>
                    <button
                      onClick={() => setIsEditingMeeting(false)}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:text-slate-200 transition-all"
                    >
                      Huỷ
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──── Tab: Người tham gia ──── */}
          {tab === "registrants" && (
            <div>
              {loadingRegs ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <span className="spinner mr-2" /> Đang tải...
                </div>
              ) : registrants.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  Không có người tham gia
                </div>
              ) : (
                <div className="space-y-3">
                  {registrants.map((reg) => (
                    <div
                      key={reg._id}
                      className="px-4 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${roleBadge(reg.role)}`}
                        >
                          {roleLabel(reg.role)}
                        </span>
                        {editingRegId !== reg._id && (
                          <button
                            onClick={() => startEditReg(reg)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                          >
                            ✏️ Sửa
                          </button>
                        )}
                      </div>

                      {editingRegId === reg._id ? (
                        /* Edit registrant */
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <FormField label="Họ">
                              <input
                                type="text"
                                value={regForm.firstName || ""}
                                onChange={(e) =>
                                  setRegForm((p) => ({
                                    ...p,
                                    firstName: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                              />
                            </FormField>
                            <FormField label="Tên">
                              <input
                                type="text"
                                value={regForm.lastName || ""}
                                onChange={(e) =>
                                  setRegForm((p) => ({
                                    ...p,
                                    lastName: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                              />
                            </FormField>
                          </div>
                          <FormField label="SĐT">
                            <input
                              type="text"
                              value={regForm.phoneNumber || ""}
                              onChange={(e) =>
                                setRegForm((p) => ({
                                  ...p,
                                  phoneNumber: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                            />
                          </FormField>
                          <FormField label="Email">
                            <input
                              type="email"
                              value={regForm.email || ""}
                              onChange={(e) =>
                                setRegForm((p) => ({
                                  ...p,
                                  email: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                            />
                          </FormField>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveReg}
                              disabled={isSaving}
                              className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-br from-emerald-500 to-teal-500 transition-all disabled:opacity-50"
                            >
                              {isSaving ? "Đang lưu..." : "💾 Lưu"}
                            </button>
                            <button
                              onClick={() => setEditingRegId(null)}
                              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:text-slate-200 transition-all"
                            >
                              Huỷ
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View registrant */
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-500 text-xs">Họ tên</span>
                            <p className="text-slate-200">
                              {reg.firstName} {reg.lastName}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-xs">SĐT</span>
                            <p className="text-slate-200">
                              {reg.phoneNumber || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-xs">Email</span>
                            <p className="text-slate-200">
                              {reg.email || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-xs">
                              Join Code
                            </span>
                            <div className="flex items-center gap-1.5">
                              <p className="text-slate-200 font-mono text-xs">
                                {reg.joinCode || "—"}
                              </p>
                              {reg.joinCode && (
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(reg.joinCode);
                                    const btn = document.getElementById(`copy-${reg._id}`);
                                    if (btn) {
                                      btn.textContent = "✓ Đã copy!";
                                      setTimeout(() => { btn.textContent = "📋"; }, 1500);
                                    }
                                  }}
                                  id={`copy-${reg._id}`}
                                  title="Copy join code"
                                  className="px-1.5 py-0.5 rounded text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
                                >
                                  📋
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:text-slate-200 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shared small components ──────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
        {label}
      </span>
      <p className="text-sm text-slate-200">{value}</p>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
