import { useState, FormEvent } from "react";
import { useAuthStore } from "../stores/authStore";

export function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("adminpassword");
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    await login(username, password);
  };

  return (
    <div className="w-full max-w-md mx-auto py-6">
      {/* Card */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
              <span>⚠️</span>
              <span>{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="ml-auto text-red-400/60 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập username"
              autoFocus
              className="w-full px-4 py-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !username.trim() || !password.trim()}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[0_2px_12px_var(--color-accent-glow)] hover:shadow-[0_4px_20px_var(--color-accent-glow)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="spinner" /> Đang đăng nhập...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
