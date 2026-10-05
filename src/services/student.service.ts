// FACADE (strangler) — giữ chữ ký cũ cho UI, ruột delegate sang modules/enrollment.
// Không thêm logic mới ở đây. Mọi validate/policy nằm ở modules/enrollment/domain.ts.
export type { Student, GuitarLevel } from "@/modules/enrollment/domain";
import { getStudentRepo } from "@/modules/enrollment/container";
import * as UC from "@/modules/enrollment/use-cases";
import { toUserMessage } from "@/shared/kernel/result";
import type { Student } from "@/modules/enrollment/domain";

export const StudentService = {
  async getAllStudents(): Promise<Student[]> {
    try {
      return await UC.listStudents(getStudentRepo());
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
  async getStudentById(id: string) {
    return getStudentRepo().getById(id);
  },
  subscribeStudents(cb: (s: Student[]) => void) {
    return getStudentRepo().subscribe(cb);
  },
  async createStudent(input: Omit<Student, "id">): Promise<Student> {
    try {
      return await UC.createStudent(getStudentRepo(), input);
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
  async updateStudent(id: string, input: Partial<Omit<Student, "id">>): Promise<void> {
    try {
      await UC.updateStudent(getStudentRepo(), id, input);
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
  async deleteStudent(id: string): Promise<void> {
    try {
      await UC.deleteStudent(getStudentRepo(), id);
      // Cascade xóa invoice/lớp/attendance/avatar nằm ở enrollment/container CachedStudentRepo.delete.
      // Gọi thêm lần nữa để chắc chắn khi dùng Local repo (không qua decorator).
      try {
        const { getInvoiceRepo } = await import("@/modules/billing/container");
        const invs = await getInvoiceRepo().list().catch(() => []);
        await Promise.all(invs.filter((i) => i.studentId === id).map((i) => getInvoiceRepo().delete(i.id).catch(() => {})));
      } catch {}
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
};
