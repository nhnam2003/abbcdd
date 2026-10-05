// Module enrollment — USE-CASES (nghiệp vụ, nhận repo qua tham số = DI thủ công).

import {
  validateStudentInput,
  validateClassInput,
  assertCapacity,
  isScheduleConflict,
  DEFAULT_MAX_STUDENTS,
  type Student,
  type GuitarClass,
} from "./domain";
import type { IStudentRepository, IClassRepository } from "./ports";
import { ValidationError, ConflictError } from "@/shared/kernel/result";
import { StudentPhone, Email } from "@/shared/kernel/value-object";

export async function listStudents(repo: IStudentRepository): Promise<Student[]> {
  return repo.list();
}

export async function createStudent(
  repo: IStudentRepository,
  input: Omit<Student, "id">
): Promise<Student> {
  validateStudentInput(input);
  const phone = StudentPhone.create(input.phoneNumber).value;
  const dup = await repo.findByPhone(phone);
  if (dup) throw new ConflictError("Số điện thoại đã tồn tại. Mỗi học viên dùng 1 SĐT riêng.");
  // Chuẩn hóa trước khi lưu (P0-04): SĐT bỏ khoảng trắng, email lowercase.
  return repo.create({ ...input, phoneNumber: phone, email: Email.createOptional(input.email) || undefined });
}

export async function updateStudent(
  repo: IStudentRepository,
  id: string,
  patchIn: Partial<Omit<Student, "id">>
): Promise<void> {
  const patch: Partial<Omit<Student, "id">> = { ...patchIn };
  if (patchIn.phoneNumber) {
    const phone = StudentPhone.create(patchIn.phoneNumber).value;
    const dup = await repo.findByPhone(phone);
    if (dup && dup.id !== id) throw new ConflictError("Số điện thoại đã tồn tại.");
    patch.phoneNumber = phone;
  }
  if (patchIn.email !== undefined) patch.email = Email.createOptional(patchIn.email) || undefined;
  return repo.update(id, patch);
}

// Cascade P1/P3: xóa HV → repo HV xóa; invoice + lớp + attendance do orchestrator ở container lo.
export async function deleteStudent(repo: IStudentRepository, id: string): Promise<void> {
  return repo.delete(id);
}

export async function listClasses(repo: IClassRepository): Promise<GuitarClass[]> {
  return repo.list();
}

export async function createClass(
  repo: IClassRepository,
  input: Omit<GuitarClass, "id">
): Promise<GuitarClass> {
  const normalized = { ...input, maxStudents: input.maxStudents ?? DEFAULT_MAX_STUDENTS };
  validateClassInput(normalized);
  await assertNoTeacherConflict(repo, normalized.teacherId, normalized.schedule, undefined);
  return repo.create(normalized);
}

export async function updateClass(
  repo: IClassRepository,
  id: string,
  patch: Partial<Omit<GuitarClass, "id">>
): Promise<void> {
  const current = await repo.getById(id);
  if (!current) throw new ValidationError("Không tìm thấy lớp.");
  const nextIds = patch.studentIds ?? current.studentIds;
  const max = patch.maxStudents ?? current.maxStudents ?? DEFAULT_MAX_STUDENTS;
  assertCapacity(nextIds, max);
  const teacherId = patch.teacherId ?? current.teacherId;
  const schedule = patch.schedule ?? current.schedule;
  await assertNoTeacherConflict(repo, teacherId, schedule, id);
  return repo.update(id, patch);
}

async function assertNoTeacherConflict(
  repo: IClassRepository,
  teacherId: string,
  schedule: GuitarClass["schedule"],
  excludeId?: string
): Promise<void> {
  const actives = await repo.listActiveByTeacher(teacherId);
  const clash = actives.find(
    (c) => c.id !== excludeId && isScheduleConflict(c.schedule, schedule)
  );
  if (clash) {
    throw new ConflictError(
      `Giáo viên đã có lớp "${clash.name}" vào ${schedule.dayOfWeek}. Đổi thứ/giờ hoặc giáo viên khác.`
    );
  }
}

export async function enrollStudent(
  repo: IClassRepository,
  classId: string,
  studentId: string
): Promise<void> {
  const cls = await repo.getById(classId);
  if (!cls) throw new ValidationError("Không tìm thấy lớp.");
  if (cls.studentIds.includes(studentId)) return;
  const next = [...cls.studentIds, studentId];
  assertCapacity(next, cls.maxStudents ?? DEFAULT_MAX_STUDENTS);
  return repo.update(classId, { studentIds: next });
}

export async function unenrollStudent(
  repo: IClassRepository,
  classId: string,
  studentId: string
): Promise<void> {
  const cls = await repo.getById(classId);
  if (!cls) return;
  return repo.update(classId, { studentIds: cls.studentIds.filter((s) => s !== studentId) });
}
