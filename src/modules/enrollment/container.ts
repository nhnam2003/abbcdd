// Module enrollment — CONTAINER (DI thủ công).
// Chọn Firestore khi đã cấu hình, fallback Local. Decorator Cached:
// list() thử cloud, fail thì dùng cache; đồng thời snapshot cloud về local.

import { isFirebaseConfigured, getFirebaseDb } from "@/lib/firebase-client";
import { FirestoreStudentRepository, FirestoreClassRepository } from "./infra-firestore";
import { LocalStudentRepository, LocalClassRepository } from "./infra-local";
import type { IStudentRepository, IClassRepository } from "./ports";
import type { Student, GuitarClass } from "./domain";

function isCloudEnabled(): boolean {
  return isFirebaseConfigured() && getFirebaseDb() !== null;
}

class CachedStudentRepo implements IStudentRepository {
  constructor(private cloud: IStudentRepository, private local: LocalStudentRepository) {}
  async list() {
    try {
      const list = await this.cloud.list();
      LocalStudentRepository.cacheList(list);
      return list;
    } catch {
      return this.local.list();
    }
  }
  getById(id: string) {
    return this.cloud.getById(id).catch(() => this.local.getById(id));
  }
  findByPhone(phone: string) {
    return this.cloud.findByPhone(phone).catch(() => this.local.findByPhone(phone));
  }
  create(input: Omit<Student, "id">) {
    return this.cloud.create(input);
  }
  update(id: string, patch: Partial<Omit<Student, "id">>) {
    return this.cloud.update(id, patch);
  }
  async delete(id: string) {
    // Cascade ở đây để use-case mỏng: xóa invoice + gỡ khỏi lớp + attendance + avatar.
    const { getInvoiceRepo } = await import("@/modules/billing/container");
    const { getClassRepo } = await import("@/modules/enrollment/container");
    const { getSheetRepo } = await import("@/modules/attendance/container");
    try {
      const invRepo = getInvoiceRepo();
      const invs = await invRepo.list().catch(() => []);
      await Promise.all(invs.filter((i) => i.studentId === id).map((i) => invRepo.delete(i.id).catch(() => {})));
    } catch {}
    try {
      const classRepo: IClassRepository = getClassRepo();
      const classes = await classRepo.list().catch(() => []);
      await Promise.all(
        classes
          .filter((c) => c.studentIds.includes(id))
          .map((c) => classRepo.update(c.id, { studentIds: c.studentIds.filter((s) => s !== id) }).catch(() => {}))
      );
    } catch {}
    try {
      const sheetRepo = getSheetRepo();
      const sheets = await sheetRepo.listAll().catch(() => []);
      await Promise.all(
        sheets.map((s) => {
          if (!s.records.some((r) => r.studentId === id)) return Promise.resolve();
          return sheetRepo
            .save({ ...s, records: s.records.filter((r) => r.studentId !== id) })
            .catch(() => {});
        })
      );
    } catch {}
    try {
      const { deleteStudentAvatar } = await import("@/shared/infra/storage/storage-upload");
      await deleteStudentAvatar(id);
    } catch {}
    return this.cloud.delete(id);
  }
  subscribe(cb: (list: Student[]) => void) {
    try {
      return this.cloud.subscribe((list) => {
        LocalStudentRepository.cacheList(list);
        cb(list);
      });
    } catch {
      return this.local.subscribe(cb);
    }
  }
}

class CachedClassRepo implements IClassRepository {
  constructor(private cloud: IClassRepository, private local: LocalClassRepository) {}
  async list() {
    try {
      const list = await this.cloud.list();
      LocalClassRepository.cacheList(list);
      return list;
    } catch {
      return this.local.list();
    }
  }
  getById(id: string) {
    return this.cloud.getById(id).catch(() => this.local.getById(id));
  }
  listActiveByTeacher(t: string) {
    return this.cloud.listActiveByTeacher(t).catch(() => this.local.listActiveByTeacher(t));
  }
  create(input: Omit<GuitarClass, "id">) {
    return this.cloud.create(input);
  }
  update(id: string, patch: Partial<Omit<GuitarClass, "id">>) {
    return this.cloud.update(id, patch);
  }
  async delete(id: string) {
    try {
      const { getInvoiceRepo } = await import("@/modules/billing/container");
      const invRepo = getInvoiceRepo();
      const invs = await invRepo.list().catch(() => []);
      await Promise.all(invs.filter((i) => i.classId === id).map((i) => invRepo.delete(i.id).catch(() => {})));
    } catch {}
    try {
      const { getSheetRepo } = await import("@/modules/attendance/container");
      const sheetRepo = getSheetRepo();
      const sheets = await sheetRepo.listByClass(id).catch(() => []);
      await Promise.all(sheets.map((s) => sheetRepo.delete(s.classId, s.date).catch(() => {})));
    } catch {}
    return this.cloud.delete(id);
  }
  subscribe(cb: (list: GuitarClass[]) => void) {
    try {
      return this.cloud.subscribe((list) => {
        LocalClassRepository.cacheList(list);
        cb(list);
      });
    } catch {
      return this.local.subscribe(cb);
    }
  }
}

let studentRepo: IStudentRepository | null = null;
let classRepo: IClassRepository | null = null;

export function getStudentRepo(): IStudentRepository {
  if (studentRepo) return studentRepo;
  studentRepo = isCloudEnabled()
    ? new CachedStudentRepo(new FirestoreStudentRepository(), new LocalStudentRepository())
    : new LocalStudentRepository();
  return studentRepo;
}

export function getClassRepo(): IClassRepository {
  if (classRepo) return classRepo;
  classRepo = isCloudEnabled()
    ? new CachedClassRepo(new FirestoreClassRepository(), new LocalClassRepository())
    : new LocalClassRepository();
  return classRepo;
}
