// Helpers dùng chung cho services Firestore (P3-03).
// - monthKey: fix sort tháng billing (P0): "8/2026" -> "2026-08"
// - toPermissionMessage: map permission-denied thành tiếng Việt (P3-04 yêu cầu toast thay vì crash)

export function toMonthKey(month: string): string {
  // Nhận "M/YYYY" hoặc "MM/YYYY" hoặc đã là "YYYY-MM".
  const t = month.trim();
  if (/^\d{4}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})\/(\d{4})$/);
  if (!m) return t;
  const mm = m[1].padStart(2, "0");
  return `${m[2]}-${mm}`;
}

export function toDisplayMonth(monthKey: string): string {
  const m = monthKey.match(/^(\d{4})-(\d{2})$/);
  if (!m) return monthKey;
  return `${Number(m[2])}/${m[1]}`;
}

export function monthKeyFromDate(dateStr: string): string {
  // "2026-08-03" -> "2026-08"
  return dateStr.slice(0, 7);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function toUserMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code === "permission-denied" || code === "firestore/permission-denied") {
    return "Bạn không có quyền thực hiện thao tác này.";
  }
  if (code === "unavailable" || code === "firestore/unavailable") {
    return "Mất kết nối Firestore. Dữ liệu sẽ đồng bộ khi có mạng lại.";
  }
  if (err instanceof Error && err.message) return err.message;
  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}

export function validatePhone(phone: string): string | null {
  const t = phone.trim();
  if (!t) return "Vui lòng nhập số điện thoại.";
  // VN: 9-11 số, cho phép +84/0 đầu, khoảng trắng.
  const digits = t.replace(/[\s.]/g, "");
  if (!/^(0|\+84)(\d{8,9})$/.test(digits)) return "Số điện thoại chưa đúng (VD 0912345678).";
  return null;
}

export function validateEmail(email: string): string | null {
  const t = email.trim();
  if (!t) return null; // email optional ở student
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return "Email chưa đúng định dạng.";
  return null;
}

export function validateAmount(n: number): string | null {
  if (!Number.isFinite(n)) return "Số tiền không hợp lệ.";
  if (n < 0) return "Học phí không được âm.";
  return null;
}
