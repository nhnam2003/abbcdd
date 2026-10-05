// Module billing — DOMAIN: Invoice + InvoiceMonth VO (month/monthKey chuẩn sort P0).
import { AmountVND, InvoiceMonth } from "@/shared/kernel/value-object";
import { ValidationError } from "@/shared/kernel/result";

export type InvoiceStatus = "paid" | "pending";
export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  month: string;
  monthKey: string;
  amount: number;
  discount?: number;
  paymentMethod?: string;
  status: InvoiceStatus;
  paidAt?: string;
  createdAt?: string;
}

export function validateInvoiceInput(input: Omit<Invoice, "id" | "monthKey" | "createdAt"> & { monthKey?: string }): { month: string; monthKey: string } {
  if (!input.studentId) throw new ValidationError("Thiếu học viên.");
  if (!input.classId) throw new ValidationError("Thiếu lớp.");
  AmountVND.create(input.amount, "Học phí");
  if (input.discount !== undefined && input.discount < 0) throw new ValidationError("Giảm giá không được âm.");
  const m = InvoiceMonth.create(input.month);
  return { month: m.month, monthKey: m.monthKey };
}

// Uniqueness (studentId, classId, monthKey) — dùng cho batch + Function P3-07.
export function invoiceKey(studentId: string, classId: string, monthKey: string): string {
  return `${studentId}|${classId}|${monthKey}`;
}
