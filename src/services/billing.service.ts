export type InvoiceStatus = "paid" | "pending";

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  month: string;
  amount: number;
  status: InvoiceStatus;
  paidAt?: string;
}

const STORAGE_KEY = "may_guitar_invoices";

const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    studentId: "std-1",
    studentName: "Nguyễn Minh Đức",
    classId: "class-1",
    className: "Lớp Guitar Đệm Hát Cơ Bản A1",
    month: "8/2026",
    amount: 800000,
    status: "paid",
    paidAt: "2026-08-02T09:30:00.000Z",
  },
  {
    id: "inv-2",
    studentId: "std-2",
    studentName: "Trần Bảo Nam",
    classId: "class-1",
    className: "Lớp Guitar Đệm Hát Cơ Bản A1",
    month: "8/2026",
    amount: 800000,
    status: "pending",
  },
  {
    id: "inv-3",
    studentId: "std-3",
    studentName: "Lê Minh Tuấn",
    classId: "class-2",
    className: "Lớp Guitar Cổ Điển Classic B2",
    month: "8/2026",
    amount: 1200000,
    status: "paid",
    paidAt: "2026-08-01T14:00:00.000Z",
  },
  {
    id: "inv-4",
    studentId: "std-4",
    studentName: "Phạm Thùy Chi",
    classId: "class-3",
    className: "Lớp Guitar Fingerstyle Nâng Cao C1",
    month: "8/2026",
    amount: 1500000,
    status: "pending",
  },
  {
    id: "inv-5",
    studentId: "std-5",
    studentName: "Hoàng Khánh An",
    classId: "class-3",
    className: "Lớp Guitar Fingerstyle Nâng Cao C1",
    month: "8/2026",
    amount: 1500000,
    status: "paid",
    paidAt: "2026-08-05T10:15:00.000Z",
  },
  {
    id: "inv-6",
    studentId: "std-6",
    studentName: "Võ Thị Hồng Nhung",
    classId: "class-4",
    className: "Lớp Guitar Cổ Điển Nâng Cao C2",
    month: "8/2026",
    amount: 1200000,
    status: "paid",
    paidAt: "2026-08-03T16:45:00.000Z",
  },
  {
    id: "inv-7",
    studentId: "std-7",
    studentName: "Đặng Quốc Bảo",
    classId: "class-4",
    className: "Lớp Guitar Cổ Điển Nâng Cao C2",
    month: "8/2026",
    amount: 1200000,
    status: "pending",
  },
  {
    id: "inv-8",
    studentId: "std-1",
    studentName: "Nguyễn Minh Đức",
    classId: "class-1",
    className: "Lớp Guitar Đệm Hát Cơ Bản A1",
    month: "7/2026",
    amount: 800000,
    status: "paid",
    paidAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "inv-9",
    studentId: "std-2",
    studentName: "Trần Bảo Nam",
    classId: "class-1",
    className: "Lớp Guitar Đệm Hát Cơ Bản A1",
    month: "7/2026",
    amount: 800000,
    status: "paid",
    paidAt: "2026-07-08T19:20:00.000Z",
  },
  {
    id: "inv-10",
    studentId: "std-3",
    studentName: "Lê Minh Tuấn",
    classId: "class-2",
    className: "Lớp Guitar Cổ Điển Classic B2",
    month: "7/2026",
    amount: 1200000,
    status: "paid",
    paidAt: "2026-07-15T08:50:00.000Z",
  },
  {
    id: "inv-11",
    studentId: "std-4",
    studentName: "Phạm Thùy Chi",
    classId: "class-3",
    className: "Lớp Guitar Fingerstyle Nâng Cao C1",
    month: "7/2026",
    amount: 1500000,
    status: "pending",
  },
  {
    id: "inv-12",
    studentId: "std-5",
    studentName: "Hoàng Khánh An",
    classId: "class-3",
    className: "Lớp Guitar Fingerstyle Nâng Cao C1",
    month: "6/2026",
    amount: 1500000,
    status: "paid",
    paidAt: "2026-06-02T11:10:00.000Z",
  },
];

function readAll(): Invoice[] {
  if (typeof window === "undefined") return mockInvoices;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockInvoices));
    return mockInvoices;
  }
  try {
    return JSON.parse(stored) as Invoice[];
  } catch {
    return mockInvoices;
  }
}

function writeAll(invoices: Invoice[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export const BillingService = {
  async getAllInvoices(): Promise<Invoice[]> {
    return [...readAll()].sort((a, b) => b.month.localeCompare(a.month));
  },

  async createInvoice(input: Omit<Invoice, "id">): Promise<Invoice> {
    const created: Invoice = { ...input, id: `inv-${Date.now()}` };
    writeAll([created, ...readAll()]);
    return created;
  },

  async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<void> {
    writeAll(
      readAll().map((inv) =>
        inv.id === id
          ? { ...inv, status, paidAt: status === "paid" ? new Date().toISOString() : undefined }
          : inv
      )
    );
  },
};