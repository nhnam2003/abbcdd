// FACADE — billing delegate sang modules/billing/container.
export type { Invoice, InvoiceStatus } from "@/modules/billing/container";
import { getInvoiceRepo, createMonthlyInvoices as batch } from "@/modules/billing/container";
import { validateInvoiceInput } from "@/modules/billing/domain";
import { toUserMessage } from "@/shared/kernel/result";
import type { Invoice, InvoiceStatus } from "@/modules/billing/container";

export const BillingService = {
  async getAllInvoices(): Promise<Invoice[]> {
    try {
      const list = await getInvoiceRepo().list();
      return [...list].sort((a, b) => b.monthKey.localeCompare(a.monthKey));
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
  async getInvoicesByStudent(sid: string) {
    return getInvoiceRepo().listByStudent(sid);
  },
  subscribeInvoices(cb: (l: Invoice[]) => void) {
    return getInvoiceRepo().subscribe(cb);
  },
  async createInvoice(input: Omit<Invoice, "id" | "monthKey"> & { monthKey?: string }): Promise<Invoice> {
    try {
      const { month, monthKey } = validateInvoiceInput(input);
      return await getInvoiceRepo().create({ ...input, month, monthKey });
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
  async createMonthlyInvoices(month: string, picks: { studentId: string; studentName: string; classId: string; className: string; amount: number }[]) {
    return batch(month, picks);
  },
  async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<void> {
    try {
      await getInvoiceRepo().updateStatus(id, status);
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
  async updateInvoice(id: string, input: Partial<Omit<Invoice, "id">>): Promise<void> {
    try {
      await getInvoiceRepo().update(id, input);
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
  async deleteInvoice(id: string): Promise<void> {
    try {
      await getInvoiceRepo().delete(id);
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
};
