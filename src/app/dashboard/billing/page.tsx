"use client";

import { useEffect, useState } from "react";
import { BillingService, Invoice } from "@/services/billing.service";
import { StudentService, Student } from "@/services/student.service";
import { ClassService, GuitarClass } from "@/services/class.service";
import { Plus, RefreshCw } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Modal from "@/components/ui/modal";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";
import { Table, TableHead, TableRow, TableCell } from "@/components/ui/table";

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<GuitarClass[]>([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending">("all");

  const [formData, setFormData] = useState({
    studentId: "",
    classId: "",
    month: `${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
    amount: 800000,
    status: "pending" as "paid" | "pending",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [invoicesData, studentsData, classesData] = await Promise.all([
          BillingService.getAllInvoices(),
          StudentService.getAllStudents(),
          ClassService.getAllClasses(),
        ]);
        setInvoices(invoicesData);
        setStudents(studentsData);
        setClasses(classesData);
        if (studentsData.length > 0) {
          setFormData(prev => ({ ...prev, studentId: studentsData[0].id }));
        }
        if (classesData.length > 0) {
          setFormData(prev => ({
            ...prev,
            classId: classesData[0].id,
            amount: classesData[0].tuitionRate,
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleStatus = async (invoiceId: string, currentStatus: "paid" | "pending") => {
    const newStatus = currentStatus === "paid" ? "pending" : "paid";
    try {
      await BillingService.updateInvoiceStatus(invoiceId, newStatus);
      setInvoices(prev =>
        prev.map(inv =>
          inv.id === invoiceId
            ? { ...inv, status: newStatus, paidAt: newStatus === "paid" ? new Date().toISOString() : undefined }
            : inv
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedStudent = students.find(s => s.id === formData.studentId);
      const selectedClass = classes.find(c => c.id === formData.classId);

      const newInv = await BillingService.createInvoice({
        studentId: formData.studentId,
        studentName: selectedStudent?.name || "Học viên",
        classId: formData.classId,
        className: selectedClass?.name || "Lớp học Guitar",
        month: formData.month,
        amount: formData.amount,
        status: formData.status,
        paidAt: formData.status === "paid" ? new Date().toISOString() : undefined,
      });

      setInvoices([newInv, ...invoices]);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const totalPaid = invoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = invoices.filter(inv => inv.status === "pending").reduce((sum, inv) => sum + inv.amount, 0);

  const filteredInvoices = invoices.filter(inv => {
    if (filterStatus === "all") return true;
    return inv.status === filterStatus;
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Quản lý Học phí</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Tạo hóa đơn, theo dõi trạng thái thanh toán và quản lý doanh thu lớp học.</p>
        </div>
        <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Tạo hóa đơn học phí
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Tổng cộng đã thu</p>
          <p className="mt-2 text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaid)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Chưa đóng (Còn thiếu)</p>
          <p className="mt-2 text-lg font-bold text-rose-500">{formatCurrency(totalPending)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Tổng tiền hóa đơn</p>
          <p className="mt-2 text-lg font-bold text-neutral-900 dark:text-white">{formatCurrency(totalPaid + totalPending)}</p>
        </Card>
      </div>

      <div className="flex gap-6 border-b border-neutral-200/50 dark:border-neutral-800/50">
        {(["all", "paid", "pending"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`border-b-2 pb-3 text-xs font-semibold transition-all ${filterStatus === status
                ? "border-brand text-brand-dark dark:border-brand-light dark:text-brand-light"
                : "border-transparent text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
          >
            {status === "all" ? "Tất cả" : status === "paid" ? "Đã đóng" : "Chưa đóng"}
          </button>
        ))}
      </div>

      {filteredInvoices.length > 0 ? (
        <Table>
          <TableHead
            columns={[
              { label: "Tên học viên" },
              { label: "Lớp học" },
              { label: "Tháng", align: "center" },
              { label: "Số tiền", align: "right" },
              { label: "Tình trạng", align: "center" },
              { label: "Hành động", align: "center" },
            ]}
          />
          <tbody>
            {filteredInvoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-bold text-neutral-800 dark:text-neutral-200">
                  {inv.studentName}
                </TableCell>
                <TableCell className="text-neutral-500 dark:text-neutral-400">
                  {inv.className}
                </TableCell>
                <TableCell className="text-center font-semibold text-neutral-500 dark:text-neutral-500">
                  {inv.month}
                </TableCell>
                <TableCell className="text-right font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(inv.amount)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={inv.status === "paid" ? "emerald" : "rose"}>
                    {inv.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant={inv.status === "paid" ? "rose" : "emerald"}
                    size="sm"
                    onClick={() => handleToggleStatus(inv.id, inv.status)}
                  >
                    <RefreshCw className="h-3 w-3" />
                    {inv.status === "paid" ? "Đổi sang Chưa đóng" : "Xác nhận Đã đóng"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      ) : (
        <Card>
          <EmptyState message="Không tìm thấy hóa đơn nào phù hợp." />
        </Card>
      )}

      {showModal && (
        <Modal title="Tạo hóa đơn học phí mới" onClose={() => setShowModal(false)}>
          <form className="mt-4 space-y-4" onSubmit={handleCreateInvoice}>
            <Select
              label="Học viên nhận hóa đơn"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </Select>

            <Select
              label="Lớp học tính học phí"
              value={formData.classId}
              onChange={(e) => {
                const cls = classes.find(c => c.id === e.target.value);
                setFormData(prev => ({
                  ...prev,
                  classId: e.target.value,
                  amount: cls?.tuitionRate ?? prev.amount,
                }));
              }}
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </Select>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Hóa đơn tháng"
                type="text"
                required
                placeholder="08/2026"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              />
              <Input
                label="Số học phí (VND)"
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </div>

            <Select
              label="Trạng thái đóng phí"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "paid" | "pending" })}
            >
              <option value="pending">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
            </Select>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang tạo..." : "Tạo hóa đơn"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}