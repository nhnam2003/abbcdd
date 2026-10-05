"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { AuthService, toVietnameseAuthError } from "@/services/auth.service";
import ProtectedRoute from "@/components/protected-route";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function ProfileInner() {
  const { user } = useAuth();
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (newPw.length < 6) {
      setError("Mật khẩu mới tối thiểu 6 ký tự.");
      return;
    }
    if (newPw !== confirmPw) {
      setError("Xác nhận mật khẩu chưa khớp.");
      return;
    }
    setLoading(true);
    try {
      await AuthService.changePassword(newPw);
      setInfo("Đổi mật khẩu thành công. Lần sau hãy đăng nhập bằng mật khẩu mới.");
      setNewPw("");
      setConfirmPw("");
    } catch (err: unknown) {
      setError(toVietnameseAuthError((err as { code?: string }).code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hồ sơ tài khoản</h1>
        <p className="mt-1 text-sm text-neutral-500">Xem quyền và đổi mật khẩu Firebase Auth.</p>
      </div>
      <Card className="p-6">
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-neutral-500">Họ tên: </span>
            <span className="font-medium">{user?.displayName ?? "—"}</span>
          </p>
          <p>
            <span className="text-neutral-500">Email: </span>
            <span className="font-medium">{user?.email ?? "—"}</span>
          </p>
          <p>
            <span className="text-neutral-500">Vai trò: </span>
            <span className="font-semibold text-orange-500">{user?.role}</span>
          </p>
          <p>
            <span className="text-neutral-500">UID: </span>
            <span className="font-mono text-xs">{user?.uid}</span>
          </p>
        </div>
      </Card>
      <Card className="p-6">
        <h2 className="text-base font-semibold">Đổi mật khẩu</h2>
        <form onSubmit={handleChange} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {info && (
            <div className="flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 p-3 text-xs text-green-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{info}</span>
            </div>
          )}
          <Input
            label="Mật khẩu mới"
            type="password"
            autoComplete="new-password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            required
          />
          <Input
            label="Nhập lại mật khẩu mới"
            type="password"
            autoComplete="new-password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang đổi...
              </>
            ) : (
              "Đổi mật khẩu"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
      <ProfileInner />
    </ProtectedRoute>
  );
}
