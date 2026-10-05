// Value Objects thuần — không import firebase/next/react.
// Mọi validate input dồn về đây, không rải rác ở UI/service.

import { ValidationError } from "./result";

export class StudentPhone {
  private constructor(readonly value: string) {}
  static create(raw: string): StudentPhone {
    // P0-04: SĐT VN, bỏ khoảng trắng/chấm/gạch trước khi check.
    const t = raw.trim().replace(/[\s.\-]/g, "");
    if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(t)) {
      throw new ValidationError("Số điện thoại chưa đúng (VD 0912345678).");
    }
    return new StudentPhone(t);
  }
}

export class Email {
  private constructor(readonly value: string) {}
  static createOptional(raw?: string): string {
    const t = (raw ?? "").trim().toLowerCase();
    if (!t) return "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) {
      throw new ValidationError("Email chưa đúng định dạng.");
    }
    return t;
  }
}

export class AmountVND {
  private constructor(readonly value: number) {}
  static create(n: number, label = "Số tiền"): number {
    if (!Number.isFinite(n)) throw new ValidationError(`${label} không hợp lệ.`);
    if (n < 0) throw new ValidationError(`${label} không được âm.`);
    if (n > 100000000) throw new ValidationError(`${label} quá lớn.`);
    return Math.round(n);
  }
}

export class InvoiceMonth {
  private constructor(readonly month: string, readonly monthKey: string) {}
  static create(month: string): InvoiceMonth {
    const t = month.trim();
    if (/^\d{4}-\d{2}$/.test(t)) {
      const [y, m] = t.split("-");
      return new InvoiceMonth(`${Number(m)}/${y}`, t);
    }
    const m = t.match(/^(\d{1,2})\/(\d{4})$/);
    if (!m) throw new ValidationError("Tháng phải dạng M/YYYY (VD 9/2026).");
    const mm = m[1].padStart(2, "0");
    return new InvoiceMonth(t, `${m[2]}-${mm}`);
  }
  static fromKey(monthKey: string): InvoiceMonth {
    const m = monthKey.match(/^(\d{4})-(\d{2})$/);
    if (!m) throw new ValidationError("monthKey phải dạng YYYY-MM.");
    return new InvoiceMonth(`${Number(m[2])}/${m[1]}`, monthKey);
  }
}

export function sheetId(classId: string, date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError("Ngày phải dạng YYYY-MM-DD.");
  }
  return `${classId}_${date}`;
}

export function monthKeyFromDate(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function nowISO(): string {
  return new Date().toISOString();
}
