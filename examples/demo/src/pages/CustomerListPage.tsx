import { useEffect, useState } from "react";
import { useCustomerStore } from "../stores/customerStore";
import { CustomerFormModal } from "./CustomerFormModal";
import type { Customer } from "ermis-ekyc-sdk";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Chờ duyệt" },
  APPROVED: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Đã duyệt" },
  REJECTED: { bg: "bg-red-500/10", text: "text-red-400", label: "Từ chối" },
  IN_PROGRESS: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Đang xử lý" },
};

export function CustomerListPage() {
  const {
    customers,
    isLoading,
    error,
    fetchCustomers,
    setSelectedCustomer,
    clearError,
  } = useCustomerStore();

  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditCustomer(null);
    setSelectedCustomer(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditCustomer(null);
    setSelectedCustomer(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    fetchCustomers();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Khách hàng</h2>
          <p className="text-sm text-slate-400 mt-1">
            Quản lý danh sách khách hàng ({customers.length})
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[0_2px_12px_var(--color-accent-glow)] hover:shadow-[0_4px_20px_var(--color-accent-glow)] transition-all"
        >
          + Thêm khách hàng
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
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            Chưa có khách hàng nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Họ tên</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">CCCD</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">SĐT</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Nghề nghiệp</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Khoản vay</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400"></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const status = STATUS_STYLES[c.status] || STATUS_STYLES.PENDING;
                  return (
                    <tr
                      key={c._id}
                      className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-200">{c.fullName}</td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-xs">{c.identityNumber}</td>
                      <td className="px-4 py-3 text-slate-300">{c.phoneNumber}</td>
                      <td className="px-4 py-3 text-slate-300">{c.occupation}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {c.loanAmount.toLocaleString("vi-VN")}đ / {c.loanTerm} tháng
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEdit(c)}
                          className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                        >
                          Sửa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CustomerFormModal
          customer={editCustomer}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
