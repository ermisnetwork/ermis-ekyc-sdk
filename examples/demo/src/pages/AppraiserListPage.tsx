import { useEffect, useState } from "react";
import { useAppraiserStore } from "../stores/appraiserStore";
import { AppraiserFormModal } from "./AppraiserFormModal";

export function AppraiserListPage() {
  const {
    appraisers,
    isLoading,
    error,
    fetchAppraisers,
    clearError,
  } = useAppraiserStore();

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAppraisers();
  }, [fetchAppraisers]);

  const handleSuccess = () => {
    setShowModal(false);
    fetchAppraisers();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Thẩm định viên</h2>
          <p className="text-sm text-slate-400 mt-1">
            Quản lý danh sách thẩm định viên ({appraisers.length})
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[0_2px_12px_var(--color-accent-glow)] hover:shadow-[0_4px_20px_var(--color-accent-glow)] transition-all"
        >
          + Thêm thẩm định viên
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
          ⚠️ {error}
          <button onClick={clearError} className="ml-auto text-red-400/60 hover:text-red-400">✕</button>
        </div>
      )}



      {/* Table */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <span className="spinner mr-2" /> Đang tải...
          </div>
        ) : appraisers.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            Chưa có thẩm định viên nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Họ tên</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">SĐT</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Khu vực</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {appraisers.map((a) => (
                  <tr
                    key={a._id}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-200">
                      {a.firstName} {a.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{a.email}</td>
                    <td className="px-4 py-3 text-slate-300">{a.phoneNumber}</td>
                    <td className="px-4 py-3 text-slate-300">{a.location}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(a.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AppraiserFormModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
