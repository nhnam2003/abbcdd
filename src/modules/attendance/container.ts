// Module attendance — DOMAIN + PORTS + USE-CASES + INFRA + CONTAINER gộp gọn.
// Sheet id = classId_date (VO). Không fallback lấy cả trường khi lớp rỗng (P0).

import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase-client";
import { nowISO, monthKeyFromDate, sheetId } from "@/shared/kernel/value-object";

export type AttendanceStatus = "present" | "excused" | "absent";
export interface AttendanceRecord { studentId: string; studentName: string; status: AttendanceStatus; note: string; }
export interface AttendanceSheet { classId: string; date: string; monthKey: string; records: AttendanceRecord[]; updatedAt?: string; updatedBy?: string; }

export interface ISheetRepository {
  get(classId: string, date: string): Promise<AttendanceSheet | null>;
  listByClass(classId: string): Promise<AttendanceSheet[]>;
  listByClassMonth(classId: string, monthKey: string): Promise<AttendanceSheet[]>;
  listAll(): Promise<AttendanceSheet[]>;
  save(sheet: AttendanceSheet): Promise<void>;
  delete(classId: string, date: string): Promise<void>;
  subscribe(classId: string, date: string, cb: (s: AttendanceSheet | null) => void): () => void;
}

function db() {
  const d = getFirebaseDb();
  if (!d) throw new Error("Chưa cấu hình Firebase.");
  return d;
}

function fromData(data: Record<string, unknown>): AttendanceSheet {
  const date = data.date as string;
  return { classId: data.classId as string, date, monthKey: (data.monthKey as string) ?? monthKeyFromDate(date), records: (data.records as AttendanceRecord[]) ?? [], updatedAt: data.updatedAt as string | undefined, updatedBy: data.updatedBy as string | undefined };
}

const A_KEY = "may_guitar_attendance";
function readLocal(): AttendanceSheet[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(A_KEY) ?? "[]") as AttendanceSheet[]; } catch { return []; }
}
function writeLocal(v: AttendanceSheet[]): void {
  try { localStorage.setItem(A_KEY, JSON.stringify(v)); } catch {}
}

class FirestoreSheetRepo implements ISheetRepository {
  async get(classId: string, date: string) {
    const s = await getDoc(doc(db(), "attendance_sheets", sheetId(classId, date)));
    return s.exists() ? fromData(s.data()) : null;
  }
  async listByClass(classId: string) {
    const snap = await getDocs(query(collection(db(), "attendance_sheets"), where("classId", "==", classId)));
    return snap.docs.map((d) => fromData(d.data())).sort((a, b) => b.date.localeCompare(a.date));
  }
  async listByClassMonth(classId: string, monthKey: string) {
    const snap = await getDocs(query(collection(db(), "attendance_sheets"), where("classId", "==", classId), where("monthKey", "==", monthKey)));
    return snap.docs.map((d) => fromData(d.data())).sort((a, b) => b.date.localeCompare(a.date));
  }
  async listAll() {
    const snap = await getDocs(collection(db(), "attendance_sheets"));
    return snap.docs.map((d) => fromData(d.data()));
  }
  async save(sheet: AttendanceSheet) {
    const ref = doc(db(), "attendance_sheets", sheetId(sheet.classId, sheet.date));
    const s = await getDoc(ref);
    if (s.exists()) await updateDoc(ref, { ...sheet });
    else await setDoc(ref, sheet);
  }
  async delete(classId: string, date: string) {
    await deleteDoc(doc(db(), "attendance_sheets", sheetId(classId, date)));
  }
  subscribe(classId: string, date: string, cb: (s: AttendanceSheet | null) => void) {
    return onSnapshot(doc(db(), "attendance_sheets", sheetId(classId, date)), (s) => cb(s.exists() ? fromData(s.data()) : null));
  }
}

class LocalSheetRepo implements ISheetRepository {
  async get(classId: string, date: string) { return readLocal().find((s) => s.classId === classId && s.date === date) ?? null; }
  async listByClass(classId: string) { return readLocal().filter((s) => s.classId === classId); }
  async listByClassMonth(classId: string, monthKey: string) { return readLocal().filter((s) => s.classId === classId && s.monthKey === monthKey); }
  async listAll() { return [...readLocal()]; }
  async save(sheet: AttendanceSheet) {
    const all = readLocal();
    const i = all.findIndex((s) => s.classId === sheet.classId && s.date === sheet.date);
    if (i >= 0) all[i] = sheet; else all.push(sheet);
    writeLocal(all);
  }
  async delete(classId: string, date: string) { writeLocal(readLocal().filter((s) => !(s.classId === classId && s.date === date))); }
  subscribe(classId: string, date: string, cb: (s: AttendanceSheet | null) => void) {
    cb(readLocal().find((s) => s.classId === classId && s.date === date) ?? null);
    return () => {};
  }
}

function isCloudEnabled(): boolean { return isFirebaseConfigured() && getFirebaseDb() !== null; }

let repo: ISheetRepository | null = null;
export function getSheetRepo(): ISheetRepository {
  if (repo) return repo;
  if (!isCloudEnabled()) { repo = new LocalSheetRepo(); return repo; }
  const cloud = new FirestoreSheetRepo();
  const local = new LocalSheetRepo();
  repo = {
    get: (c, d) => cloud.get(c, d).catch(() => local.get(c, d)),
    listByClass: (c) => cloud.listByClass(c).catch(() => local.listByClass(c)),
    listByClassMonth: (c, m) => cloud.listByClassMonth(c, m).catch(() => local.listByClassMonth(c, m)),
    listAll: () => cloud.listAll().catch(() => local.listAll()),
    save: async (sheet) => {
      const payload = { ...sheet, monthKey: monthKeyFromDate(sheet.date), updatedAt: nowISO() };
      try { await cloud.save(payload); }
      catch {
        const { enqueueAttendance } = await import("@/shared/infra/cache/offline-queue");
        enqueueAttendance(payload as unknown as Record<string, unknown>);
        await local.save(payload);
        return;
      }
      await local.save(payload).catch(() => {});
    },
    delete: (c, d) => cloud.delete(c, d).catch(() => local.delete(c, d)),
    subscribe: (c, d, cb) => {
      try { return cloud.subscribe(c, d, cb); } catch { return local.subscribe(c, d, cb); }
    },
  };
  return repo;
}

export async function getStudentStats(studentId: string): Promise<{ present: number; excused: number; absent: number; total: number; rate: number }> {
  const all = await getSheetRepo().listAll();
  let present = 0, excused = 0, absent = 0;
  for (const sh of all) {
    const r = sh.records.find((x) => x.studentId === studentId);
    if (!r) continue;
    if (r.status === "present") present++; else if (r.status === "excused") excused++; else absent++;
  }
  const total = present + excused + absent;
  return { present, excused, absent, total, rate: total ? Math.round((present / total) * 100) : 0 };
}
