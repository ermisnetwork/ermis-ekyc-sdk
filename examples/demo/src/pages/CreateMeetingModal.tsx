import { useState, useEffect } from "react";
import { ErmisService } from "ermis-ekyc-sdk";
import type {
  CreateMeetingRequest,
  Appraiser,
  Customer,
} from "ermis-ekyc-sdk";
import { useMeetingStore } from "../stores/meetingStore";

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Thông tin phiên",
  2: "Chọn Host (Thẩm định viên)",
  3: "Chọn Guest (Khách hàng)",
};

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMeetingModal({ onClose, onSuccess }: Props) {
  const { createFullSession } = useMeetingStore();

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 – Meeting info
  const [meetingData, setMeetingData] = useState<CreateMeetingRequest>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
  });

  // Step 2 – Appraiser selection
  const [appraisers, setAppraisers] = useState<Appraiser[]>([]);
  const [selectedAppraiser, setSelectedAppraiser] = useState<Appraiser | null>(
    null,
  );
  const [loadingAppraisers, setLoadingAppraisers] = useState(false);

  // Step 3 – Customer selection
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Load appraisers when entering step 2
  useEffect(() => {
    if (step === 2 && appraisers.length === 0) {
      setLoadingAppraisers(true);
      const ermis = ErmisService.getInstance();
      ermis.appraisers
        .getAppraisers()
        .then((res) => setAppraisers(res.data))
        .catch(() => setError("Không thể tải danh sách thẩm định viên"))
        .finally(() => setLoadingAppraisers(false));
    }
  }, [step]);

  // Load customers when entering step 3
  useEffect(() => {
    if (step === 3 && customers.length === 0) {
      setLoadingCustomers(true);
      const ermis = ErmisService.getInstance();
      ermis.customers
        .getCustomers()
        .then((res) => setCustomers(res.data))
        .catch(() => setError("Không thể tải danh sách khách hàng"))
        .finally(() => setLoadingCustomers(false));
    }
  }, [step]);

  const canNext = (): boolean => {
    if (step === 1) {
      return !!(
        meetingData.title.trim() &&
        meetingData.startTime &&
        meetingData.endTime
      );
    }
    if (step === 2) return !!selectedAppraiser;
    return !!selectedCustomer;
  };

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handleSubmit = async () => {
    if (!selectedAppraiser || !selectedCustomer) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createFullSession(
        meetingData,
        { objectId: selectedAppraiser._id },
        { objectId: selectedCustomer._id },
      );
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Tạo phiên thất bại";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof CreateMeetingRequest, value: any) => {
    setMeetingData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              Tạo phiên thẩm định
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bước {step}/3 — {STEP_LABELS[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {([1, 2, 3] as Step[]).map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-all ${s <= step
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                  : "bg-[var(--color-bg-secondary)]"
                  }`}
              />
            ))}
          </div>
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
          {/* ──── Step 1: Meeting Info ──── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={meetingData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Phiên thẩm định khoản vay..."
                  className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Mô tả
                </label>
                <textarea
                  value={meetingData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Mô tả chi tiết..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Thời gian bắt đầu *
                  </label>
                  <input
                    type="datetime-local"
                    value={meetingData.startTime}
                    onChange={(e) => updateField("startTime", e.target.value)}
                    className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Thời gian kết thúc *
                  </label>
                  <input
                    type="datetime-local"
                    value={meetingData.endTime}
                    onChange={(e) => updateField("endTime", e.target.value)}
                    className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Địa điểm
                </label>
                <input
                  type="text"
                  value={meetingData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="Online / Văn phòng chi nhánh..."
                  className="w-full px-3 py-2.5 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

            </div>
          )}

          {/* ──── Step 2: Select appraiser (HOST) ──── */}
          {step === 2 && (
            <div>
              <p className="text-sm text-slate-400 mb-4">
                Chọn thẩm định viên làm <span className="text-indigo-400 font-semibold">HOST</span> cho phiên thẩm định.
              </p>
              {loadingAppraisers ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <span className="spinner mr-2" /> Đang tải...
                </div>
              ) : appraisers.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  Chưa có thẩm định viên nào
                </div>
              ) : (
                <div className="space-y-2">
                  {appraisers.map((a) => (
                    <button
                      key={a._id}
                      onClick={() => setSelectedAppraiser(a)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selectedAppraiser?._id === a._id
                        ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30"
                        : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-slate-500"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            {a.firstName} {a.lastName}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {a.email} · {a.phoneNumber}
                          </p>
                        </div>
                        {selectedAppraiser?._id === a._id && (
                          <span className="text-indigo-400 text-lg">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──── Step 3: Select customer (GUEST) ──── */}
          {step === 3 && (
            <div>
              <p className="text-sm text-slate-400 mb-4">
                Chọn khách hàng làm <span className="text-purple-400 font-semibold">GUEST</span> cho phiên thẩm định.
              </p>
              {loadingCustomers ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <span className="spinner mr-2" /> Đang tải...
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  Chưa có khách hàng nào
                </div>
              ) : (
                <div className="space-y-2">
                  {customers.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => setSelectedCustomer(c)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selectedCustomer?._id === c._id
                        ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30"
                        : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-slate-500"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            {c.fullName}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            CCCD: {c.identityNumber} · SĐT: {c.phoneNumber}
                          </p>
                        </div>
                        {selectedCustomer?._id === c._id && (
                          <span className="text-purple-400 text-lg">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:text-slate-200 transition-all"
          >
            {step === 1 ? "Huỷ" : "← Quay lại"}
          </button>
          <div className="flex gap-2">
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canNext()}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${canNext()
                  ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_2px_12px_var(--color-accent-glow)] hover:shadow-[0_4px_20px_var(--color-accent-glow)]"
                  : "bg-[var(--color-bg-secondary)] text-slate-500 cursor-not-allowed"
                  }`}
              >
                Tiếp theo →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canNext() || isSubmitting}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${canNext() && !isSubmitting
                  ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-[0_2px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                  : "bg-[var(--color-bg-secondary)] text-slate-500 cursor-not-allowed"
                  }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner" /> Đang tạo...
                  </span>
                ) : (
                  "✓ Tạo phiên"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
