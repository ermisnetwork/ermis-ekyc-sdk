import { useState, FormEvent } from "react";
import { useCustomerStore } from "../stores/customerStore";
import type { Customer } from "ermis-ekyc-sdk";

interface Props {
  customer: Customer | null; // null = create mode
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerFormModal({ customer, onClose, onSuccess }: Props) {
  const { createCustomer, updateCustomer } = useCustomerStore();
  const isEdit = !!customer;

  const [form, setForm] = useState({
    fullName: customer?.fullName || "",
    dateOfBirth: customer?.dateOfBirth || "",
    identityNumber: customer?.identityNumber || "",
    placeOfOrigin: customer?.placeOfOrigin || "",
    issueDate: customer?.issueDate || "",
    issuePlace: customer?.issuePlace || "",
    phoneNumber: customer?.phoneNumber || "",
    address: customer?.address || "",
    occupation: customer?.occupation || "",
    monthlyIncome: customer?.monthlyIncome?.toString() || "",
    loanAmount: customer?.loanAmount?.toString() || "",
    loanTerm: customer?.loanTerm?.toString() || "",
  });
  const [frontIdImage, setFrontIdImage] = useState<File | null>(null);
  const [backIdImage, setBackIdImage] = useState<File | null>(null);
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
      if (isEdit && customer) {
        await updateCustomer(customer._id, {
          ...form,
          monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : undefined,
          loanAmount: form.loanAmount ? Number(form.loanAmount) : undefined,
          loanTerm: form.loanTerm ? Number(form.loanTerm) : undefined,
          frontIdImage: frontIdImage || undefined,
          backIdImage: backIdImage || undefined,
        });
      } else {
        await createCustomer({
          ...form,
          monthlyIncome: Number(form.monthlyIncome) || 0,
          loanAmount: Number(form.loanAmount) || 0,
          loanTerm: Number(form.loanTerm) || 0,
          frontIdImage: frontIdImage || undefined,
          backIdImage: backIdImage || undefined,
        });
      }
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: { key: string; label: string; type?: string; placeholder?: string }[] = [
    { key: "fullName", label: "Họ tên", placeholder: "Nguyễn Văn A" },
    { key: "dateOfBirth", label: "Ngày sinh", type: "date" },
    { key: "identityNumber", label: "Số CCCD", placeholder: "012345678901" },
    { key: "placeOfOrigin", label: "Quê quán", placeholder: "Hà Nội" },
    { key: "issueDate", label: "Ngày cấp", type: "date" },
    { key: "issuePlace", label: "Nơi cấp", placeholder: "Cục CS QLHC về TTXH" },
    { key: "phoneNumber", label: "Số điện thoại", placeholder: "0901234567" },
    { key: "address", label: "Địa chỉ", placeholder: "123 Đường ABC, Quận XYZ" },
    { key: "occupation", label: "Nghề nghiệp", placeholder: "Kỹ sư phần mềm" },
    { key: "monthlyIncome", label: "Thu nhập (VNĐ/tháng)", type: "number", placeholder: "15000000" },
    { key: "loanAmount", label: "Số tiền vay (VNĐ)", type: "number", placeholder: "100000000" },
    { key: "loanTerm", label: "Kỳ hạn vay (tháng)", type: "number", placeholder: "12" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h3 className="text-lg font-bold text-slate-100">
            {isEdit ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key}>
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

          {/* File uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Ảnh CCCD mặt trước
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFrontIdImage(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Ảnh CCCD mặt sau
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBackIdImage(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 transition-all"
              />
            </div>
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
                  <span className="spinner" /> Đang lưu...
                </span>
              ) : isEdit ? (
                "Cập nhật"
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
