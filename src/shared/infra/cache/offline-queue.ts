// Pending queue cho write offline (P3-05).
// - saveAttendance/createInvoice khi Firestore `unavailable` → enqueue.
// - Online → flush tuần tự. Last-write-wins theo updatedAt.
// - Lưu localStorage để reload không mất. Sync đa tab qua multi-tab-sync.

import { notify } from "./multi-tab-sync";

export interface PendingOp {
  id: string;
  kind: "attendance" | "invoice-create" | "invoice-update";
  payload: Record<string, unknown>;
  createdAt: string;
}

const KEY = "may_guitar_pending_queue";

function read(): PendingOp[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as PendingOp[];
  } catch {
    return [];
  }
}

function write(ops: PendingOp[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(ops));
  window.dispatchEvent(new CustomEvent("may-guitar-pending", { detail: { count: ops.length } }));
  try {
    notify("pending-changed", { count: ops.length });
  } catch {}
}

export function enqueueAttendance(sheet: Record<string, unknown>): void {
  const ops = read().filter(
    (o) =>
      !(
        o.kind === "attendance" &&
        (o.payload as { classId?: string; date?: string }).classId ===
          (sheet as { classId?: string }).classId &&
        (o.payload as { date?: string }).date === (sheet as { date?: string }).date
      )
  );
  ops.push({
    id: `op-${Date.now()}`,
    kind: "attendance",
    payload: sheet,
    createdAt: new Date().toISOString(),
  });
  write(ops);
}

export function enqueueInvoiceCreate(invoice: Record<string, unknown>): void {
  const ops = read();
  ops.push({ id: `op-${Date.now()}`, kind: "invoice-create", payload: invoice, createdAt: new Date().toISOString() });
  write(ops);
}

export function getPendingCount(): number {
  return read().length;
}

export function getPendingOps(): PendingOp[] {
  return read();
}

export function clearPendingOps(ids: string[]): void {
  write(read().filter((o) => !ids.includes(o.id)));
}

export async function flushPendingQueue(): Promise<{ flushed: number; remaining: number }> {
  const ops = read();
  if (ops.length === 0) return { flushed: 0, remaining: 0 };
  const { getFirebaseDb } = await import("@/lib/firebase-client");
  const db = getFirebaseDb();
  if (!db) return { flushed: 0, remaining: ops.length };
  const { doc, setDoc, addDoc, collection, updateDoc } = await import("firebase/firestore");
  const done: string[] = [];
  for (const op of ops) {
    try {
      if (op.kind === "attendance") {
        const p = op.payload as { classId: string; date: string; [k: string]: unknown };
        await setDoc(doc(db, "attendance_sheets", `${p.classId}_${p.date}`), p, { merge: true });
        done.push(op.id);
      } else if (op.kind === "invoice-create") {
        await addDoc(collection(db, "invoices"), op.payload);
        done.push(op.id);
      } else if (op.kind === "invoice-update") {
        const p = op.payload as { id: string; patch: Record<string, unknown> };
        await updateDoc(doc(db, "invoices", p.id), p.patch);
        done.push(op.id);
      }
    } catch {
      // Dừng ở op lỗi mạng, giữ lại để thử sau.
      break;
    }
  }
  if (done.length) clearPendingOps(done);
  return { flushed: done.length, remaining: read().length };
}
