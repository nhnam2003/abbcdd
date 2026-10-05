// Module enrollment — Local adapters (seed + cache offline).
// Dùng khi chưa cấu hình Firebase hoặc Firestore read fail.

import type { Student, GuitarClass } from "./domain";
import type { IStudentRepository, IClassRepository } from "./ports";

const S_KEY = "may_guitar_students";
const C_KEY = "may_guitar_classes";

const seedStudents: Student[] = [
  { id: "std-1", name: "Nguyễn Minh Đức", parentName: "Nguyễn Văn Hải", phoneNumber: "0912345678", guitarLevel: "Cơ bản (Đệm hát)", joinDate: "2026-01-10", email: "minhduc@gmail.com" },
  { id: "std-2", name: "Trần Bảo Nam", parentName: "Phan Thị Thu", phoneNumber: "0987654321", guitarLevel: "Cơ bản (Đệm hát)", joinDate: "2026-02-15", email: "baonam@gmail.com" },
  { id: "std-3", name: "Lê Minh Tuấn", parentName: "Lê Văn Tùng", phoneNumber: "0905123456", guitarLevel: "Cổ điển (Classic)", joinDate: "2025-11-20", email: "tuanguitar@gmail.com" },
  { id: "std-4", name: "Phạm Thùy Chi", parentName: "Phạm Minh Hoàng", phoneNumber: "0934888999", guitarLevel: "Nâng cao (Fingerstyle)", joinDate: "2025-08-05", email: "thuychi@gmail.com" },
  { id: "std-5", name: "Hoàng Khánh An", parentName: "Hoàng Quốc Việt", phoneNumber: "0945678123", guitarLevel: "Nâng cao (Fingerstyle)", joinDate: "2026-03-01", email: "khanhan@gmail.com" },
  { id: "std-6", name: "Võ Thị Hồng Nhung", parentName: "Võ Đình Khoa", phoneNumber: "0968111222", guitarLevel: "Cổ điển (Classic)", joinDate: "2026-04-12", email: "hongnhung@gmail.com" },
  { id: "std-7", name: "Đặng Quốc Bảo", parentName: "Đặng Văn Thịnh", phoneNumber: "0977555333", guitarLevel: "Cơ bản (Đệm hát)", joinDate: "2026-05-06", email: "quocbao@gmail.com" },
];

const seedClasses: GuitarClass[] = [
  { id: "class-1", name: "Lớp Guitar Đệm Hát Cơ Bản A1", teacherId: "u-teacher-1", teacherName: "Thầy Tiến Guitar", studentIds: ["std-1", "std-2"], schedule: { dayOfWeek: "Thứ 2", time: "18:00 - 19:30" }, tuitionRate: 800000, active: true, maxStudents: 12 },
  { id: "class-2", name: "Lớp Guitar Cổ Điển Classic B2", teacherId: "u-teacher-2", teacherName: "Cô Phương Cầm", studentIds: ["std-3"], schedule: { dayOfWeek: "Thứ 4", time: "19:30 - 21:00" }, tuitionRate: 1200000, active: true, maxStudents: 10 },
  { id: "class-3", name: "Lớp Guitar Fingerstyle Nâng Cao C1", teacherId: "u-teacher-1", teacherName: "Thầy Tiến Guitar", studentIds: ["std-4", "std-5"], schedule: { dayOfWeek: "Thứ 7", time: "15:00 - 16:30" }, tuitionRate: 1500000, active: true, maxStudents: 8 },
  { id: "class-4", name: "Lớp Guitar Cổ Điển Nâng Cao C2", teacherId: "u-teacher-2", teacherName: "Cô Phương Cầm", studentIds: ["std-6", "std-7"], schedule: { dayOfWeek: "Thứ 5", time: "19:00 - 20:30" }, tuitionRate: 1200000, active: true, maxStudents: 10 },
  { id: "class-5", name: "Lớp Guitar Nhập Môn Thiếu Nhi E1", teacherId: "u-teacher-1", teacherName: "Thầy Tiến Guitar", studentIds: ["std-7"], schedule: { dayOfWeek: "Chủ Nhật", time: "09:00 - 10:30" }, tuitionRate: 600000, active: false, maxStudents: 15 },
];

function read<T>(key: string, seed: T[]): T[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as T[];
  } catch {
    return seed;
  }
}

function write<T>(key: string, v: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(v));
}

export class LocalStudentRepository implements IStudentRepository {
  async list(): Promise<Student[]> {
    return [...read<Student>(S_KEY, seedStudents)];
  }
  async getById(id: string): Promise<Student | null> {
    return read<Student>(S_KEY, seedStudents).find((s) => s.id === id) ?? null;
  }
  async findByPhone(phone: string): Promise<Student | null> {
    return read<Student>(S_KEY, seedStudents).find((s) => s.phoneNumber === phone) ?? null;
  }
  async create(input: Omit<Student, "id">): Promise<Student> {
    const created = { ...input, id: `std-${Date.now()}` };
    const all = read<Student>(S_KEY, seedStudents);
    write(S_KEY, [created, ...all]);
    return created;
  }
  async update(id: string, patch: Partial<Omit<Student, "id">>): Promise<void> {
    write(S_KEY, read<Student>(S_KEY, seedStudents).map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  async delete(id: string): Promise<void> {
    write(S_KEY, read<Student>(S_KEY, seedStudents).filter((s) => s.id !== id));
  }
  subscribe(cb: (list: Student[]) => void): () => void {
    cb([...read<Student>(S_KEY, seedStudents)]);
    return () => {};
  }
  static cacheList(list: Student[]): void {
    try {
      write(S_KEY, list);
    } catch {}
  }
}

export class LocalClassRepository implements IClassRepository {
  async list(): Promise<GuitarClass[]> {
    return [...read<GuitarClass>(C_KEY, seedClasses)];
  }
  async getById(id: string): Promise<GuitarClass | null> {
    return read<GuitarClass>(C_KEY, seedClasses).find((c) => c.id === id) ?? null;
  }
  async listActiveByTeacher(teacherId: string): Promise<GuitarClass[]> {
    return read<GuitarClass>(C_KEY, seedClasses).filter((c) => c.teacherId === teacherId && c.active);
  }
  async create(input: Omit<GuitarClass, "id">): Promise<GuitarClass> {
    const created = { ...input, id: `class-${Date.now()}` };
    const all = read<GuitarClass>(C_KEY, seedClasses);
    write(C_KEY, [created, ...all]);
    return created;
  }
  async update(id: string, patch: Partial<Omit<GuitarClass, "id">>): Promise<void> {
    write(C_KEY, read<GuitarClass>(C_KEY, seedClasses).map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  async delete(id: string): Promise<void> {
    write(C_KEY, read<GuitarClass>(C_KEY, seedClasses).filter((c) => c.id !== id));
  }
  subscribe(cb: (list: GuitarClass[]) => void): () => void {
    cb([...read<GuitarClass>(C_KEY, seedClasses)]);
    return () => {};
  }
  static cacheList(list: GuitarClass[]): void {
    try {
      write(C_KEY, list);
    } catch {}
  }
}
