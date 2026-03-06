import { useEffect, useState } from "react";
import { useMeetingStore } from "../stores/meetingStore";
import { CreateMeetingModal } from "./CreateMeetingModal";
import { MeetingDetailModal } from "./MeetingDetailModal";
import type { Meeting } from "ermis-ekyc-sdk";

export function MeetingListPage() {
  const { meetings, isLoading, error, fetchMeetings, clearError } =
    useMeetingStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [detailMeeting, setDetailMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchMeetings();
  };

  const handleDetailUpdated = () => {
    fetchMeetings();
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">
            Phiên thẩm định
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Quản lý các phiên thẩm định ({meetings.length})
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[0_2px_12px_var(--color-accent-glow)] hover:shadow-[0_4px_20px_var(--color-accent-glow)] transition-all"
        >
          + Tạo phiên
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
          ⚠️ {error}
          <button
            onClick={clearError}
            className="ml-auto text-red-400/60 hover:text-red-400"
          >
            ✕
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <span className="spinner mr-2" /> Đang tải...
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            Chưa có phiên thẩm định nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Tiêu đề
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Mô tả
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Bắt đầu
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Kết thúc
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Địa điểm
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((m) => (
                  <tr
                    key={m._id}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-200">
                      {m.title}
                    </td>
                    <td className="px-4 py-3 text-slate-300 max-w-[200px] truncate">
                      {m.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">
                      {formatDate(m.startTime)}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">
                      {formatDate(m.endTime)}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">
                      {m.location || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setDetailMeeting(m)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateMeetingModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Detail Modal */}
      {detailMeeting && (
        <MeetingDetailModal
          meeting={detailMeeting}
          onClose={() => setDetailMeeting(null)}
          onUpdated={handleDetailUpdated}
        />
      )}
    </div>
  );
}
