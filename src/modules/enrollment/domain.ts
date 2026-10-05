// Module enrollment — DOMAIN (thuần, không firebase).
// Gồm Student + GuitarClass + policies: sĩ số, trùng lịch GV, SĐT unique (check ở repo).

import { StudentPhone, Email, AmountVND } from "@/shared/kernel/value-object";
import { ValidationError } from "@/shared/kernel/result";

export type GuitarLevel = "Cơ bản (Đệm hát)" | "Cổ điển (Classic)" | "Nâng cao (Fingerstyle)";
export const GUITAR_LEVELS: GuitarLevel[] = ["Cơ bản (Đệm hát)", "Cổ điển (Classic)", "Nâng cao (Fingerstyle)"];

export interface Student {
  id: string;
  name: string;
  parentName: string;
  phoneNumber: string;
  guitarLevel: GuitarLevel;
  joinDate: string;
  email?: string;
  birthDate?: string;
  address?: string;
  note?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassSchedule {
  dayOfWeek: string;
  time: string;
}

export interface GuitarClass {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  studentIds: string[];
  schedule: ClassSchedule;
  tuitionRate: number;
  active: boolean;
  maxStudents?: number;
  branchId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_MAX_STUDENTS = 12;

export function validateStudentInput(input: Omit<Student, "id" | "createdAt" | "updatedAt">): void {
  if (!input.name.trim()) throw new ValidationError("Vui lòng nhập tên học viên.");
  if (!input.parentName.trim()) throw new ValidationError("Vui lòng nhập tên phụ huynh.");
  StudentPhone.create(input.phoneNumber);
  Email.createOptional(input.email);
  if (!GUITAR_LEVELS.includes(input.guitarLevel)) throw new ValidationError("Trình độ không hợp lệ.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.joinDate)) throw new ValidationError("Ngày nhập học phải dạng YYYY-MM-DD.");
  if (input.address && input.address.length > 500) throw new ValidationError("Địa chỉ quá dài.");
  if (input.note && input.note.length > 2000) throw new ValidationError("Ghi chú quá dài.");
}

export function validateClassInput(input: Omit<GuitarClass, "id" | "createdAt" | "updatedAt">): void {
  if (!input.name.trim()) throw new ValidationError("Vui lòng nhập tên lớp.");
  if (!input.teacherId.trim()) throw new ValidationError("Thiếu giáo viên.");
  AmountVND.create(input.tuitionRate, "Học phí");
  if (!input.schedule.dayOfWeek.trim()) throw new ValidationError("Thiếu thứ học.");
  const max = input.maxStudents ?? DEFAULT_MAX_STUDENTS;
  if (!Number.isFinite(max) || max < 1 || max > 100) {
    throw new ValidationError("Sĩ số tối đa phải từ 1 đến 100.");
  }
}

// Policy P1-03: sĩ số.
export function assertCapacity(studentIds: string[], max: number): void {
  if (studentIds.length > max) {
    throw new ValidationError(`Lớp đã đầy (${studentIds.length}/${max}). Không thể thêm học viên.`);
  }
}

// Policy P1-04: trùng lịch GV (so sánh theo dayOfWeek, time overlap đơn giản).
export function isScheduleConflict(a: ClassSchedule, b: ClassSchedule): boolean {
  return a.dayOfWeek === b.dayOfWeek && a.time.trim() === b.time.trim();
}
