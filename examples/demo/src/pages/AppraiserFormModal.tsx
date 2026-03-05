import { useState, FormEvent } from "react";
import { useAppraiserStore } from "../stores/appraiserStore";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function AppraiserFormModal({ onClose, onSuccess }: Props) {
  const { createAppraiser } = useAppraiserStore();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createAppraiser(form);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: { key: string; label: string; placeholder: string; type?: string }[] = [
    { key: "firstName", label: "Họ", placeholder: "Nguyễn" },
    { key: "lastName", label: "Tên", placeholder: "Văn A" },
    { key: "email", label: "Email", placeholder: "example@company.com", type: "email" },
    { key: "phoneNumber", label: "Số điện thoại", placeholder: "0901234567" },
    { key: "location", label: "Khu vực", placeholder: "Hà Nội" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h3 className="text-lg font-bold text-slate-100">
            Thêm thẩm định viên
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key} className={f.key === "location" ? "sm:col-span-2" : ""}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {f.label}
                </label>
                <input
                  type={f.type || "text"}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:text-slate-200 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[0_2px_12px_var(--color-accent-glow)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="spinner" /> Đang tạo...
                </span>
              ) : (
                "Tạo mới"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
