// Module billing — PORTS + USE-CASES + INFRA + CONTAINER gộp gọn (vẫn tách domain).
// Giữ Clean: UI chỉ gọi container/use-cases, không import firebase trực tiếp.

import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase-client";
import { nowISO } from "@/shared/kernel/value-object";
import { ConflictError } from "@/shared/kernel/result";
import { validateInvoiceInput, type Invoice, type InvoiceStatus } from "./domain";

export interface IInvoiceRepository {
  list(): Promise<Invoice[]>;
  listByStudent(studentId: string): Promise<Invoice[]>;
  create(input: Omit<Invoice, "id">): Promise<Invoice>;
  update(id: string, patch: Partial<Omit<Invoice, "id">>): Promise<void>;
  updateStatus(id: string, status: InvoiceStatus): Promise<void>;
  delete(id: string): Promise<void>;
  subscribe(cb: (list: Invoice[]) => void): () => void;
}

function db() {
  const d = getFirebaseDb();
  if (!d) throw new Error("Chưa cấu hình Firebase.");
  return d;
}

function fromDoc(id: string, data: Record<string, unknown>): Invoice {
  const month = data.month as string;
  return {
    id, studentId: data.studentId as string, studentName: data.studentName as string,
    classId: data.classId as string, className: data.className as string, month,
    monthKey: (data.monthKey as string) ?? month, amount: data.amount as number,
    discount: data.discount as number | undefined, paymentMethod: data.paymentMethod as string | undefined,
    status: data.status as InvoiceStatus, paidAt: data.paidAt as string | undefined,
    createdAt: data.createdAt as string | undefined,
  };
}

const I_KEY = "may_guitar_invoices";
function readLocal(): Invoice[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(I_KEY) ?? "[]") as Invoice[]; } catch { return []; }
}
function writeLocal(v: Invoice[]): void {
  try { localStorage.setItem(I_KEY, JSON.stringify(v)); } catch {}
}

class FirestoreInvoiceRepo implements IInvoiceRepository {
  async list(): Promise<Invoice[]> {
    const snap = await getDocs(query(collection(db(), "invoices"), orderBy("monthKey", "desc")));
    return snap.docs.map((d) => fromDoc(d.id, d.data()));
  }
  async listByStudent(sid: string): Promise<Invoice[]> {
    const snap = await getDocs(query(collection(db(), "invoices"), where("studentId", "==", sid), orderBy("monthKey", "desc")));
    return snap.docs.map((d) => fromDoc(d.id, d.data()));
  }
  async create(input: Omit<Invoice, "id">): Promise<Invoice> {
    const dup = await getDocs(query(collection(db(), "invoices"), where("studentId", "==", input.studentId), where("classId", "==", input.classId), where("monthKey", "==", input.monthKey)));
    if (!dup.empty) throw new ConflictError(`Đã có hóa đơn tháng ${input.month} cho học viên này.`);
    const payload = { ...input, createdAt: nowISO() };
    const ref = await addDoc(collection(db(), "invoices"), payload);
    return { ...input, id: ref.id, createdAt: payload.createdAt };
  }
  async update(id: string, patch: Partial<Omit<Invoice, "id">>): Promise<void> {
    await updateDoc(doc(db(), "invoices", id), patch);
  }
  async updateStatus(id: string, status: InvoiceStatus): Promise<void> {
    await updateDoc(doc(db(), "invoices", id), { status, paidAt: status === "paid" ? new Date().toISOString() : null });
  }
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db(), "invoices", id));
  }
  subscribe(cb: (list: Invoice[]) => void): () => void {
    return onSnapshot(query(collection(db(), "invoices"), orderBy("monthKey", "desc")), (s) => cb(s.docs.map((d) => fromDoc(d.id, d.data()))));
  }
}

class LocalInvoiceRepo implements IInvoiceRepository {
  async list(): Promise<Invoice[]> {
    return [...readLocal()].sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }
  async listByStudent(sid: string): Promise<Invoice[]> {
    return readLocal().filter((i) => i.studentId === sid);
  }
  async create(input: Omit<Invoice, "id">): Promise<Invoice> {
    const created = { ...input, id: `inv-${Date.now()}` };
    writeLocal([created, ...readLocal()]);
    return created;
  }
  async update(id: string, patch: Partial<Omit<Invoice, "id">>): Promise<void> {
    writeLocal(readLocal().map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  async updateStatus(id: string, status: InvoiceStatus): Promise<void> {
    return this.update(id, { status, paidAt: status === "paid" ? new Date().toISOString() : undefined });
  }
  async delete(id: string): Promise<void> {
    writeLocal(readLocal().filter((i) => i.id !== id));
  }
  subscribe(cb: (list: Invoice[]) => void): () => void {
    cb(readLocal());
    return () => {};
  }
}

function isCloudEnabled(): boolean {
  return isFirebaseConfigured() && getFirebaseDb() !== null;
}

let repo: IInvoiceRepository | null = null;
export function getInvoiceRepo(): IInvoiceRepository {
  if (repo) return repo;
  if (!isCloudEnabled()) {
    repo = new LocalInvoiceRepo();
    return repo;
  }
  const cloud = new FirestoreInvoiceRepo();
  const local = new LocalInvoiceRepo();
  repo = {
    async list() {
      try { const l = await cloud.list(); writeLocal(l); return l; } catch { return local.list(); }
    },
    listByStudent: (sid) => cloud.listByStudent(sid).catch(() => local.listByStudent(sid)),
    async create(input) {
      const { month, monthKey } = validateInvoiceInput(input);
      try { return await cloud.create({ ...input, month, monthKey }); }
      catch {
        // Offline → queue để flush sau (P3-05), vẫn trả về bản local tạm.
        const { enqueueInvoiceCreate } = await import("@/shared/infra/cache/offline-queue");
        enqueueInvoiceCreate({ ...input, month, monthKey, createdAt: nowISO() });
        return local.create({ ...input, month, monthKey });
      }
    },
    update: (id, p) => cloud.update(id, p),
    updateStatus: (id, s) => cloud.updateStatus(id, s).catch(() => local.updateStatus(id, s)),
    delete: (id) => cloud.delete(id).catch(() => local.delete(id)),
    subscribe(cb) {
      try { return cloud.subscribe((l) => { writeLocal(l); cb(l); }); } catch { return local.subscribe(cb); }
    },
  };
  return repo;
}

// Use-cases mỏng gọi từ presentation/services-facade.
export async function createMonthlyInvoices(month: string, picks: { studentId: string; studentName: string; classId: string; className: string; amount: number }[]): Promise<{ created: number; skipped: number }> {
  const r = getInvoiceRepo();
  let created = 0, skipped = 0;
  for (const p of picks) {
    try { await r.create({ ...p, month, monthKey: "", status: "pending" } as Omit<Invoice, "id">); created++; }
    catch { skipped++; }
  }
  return { created, skipped };
}

export type { Invoice, InvoiceStatus };
