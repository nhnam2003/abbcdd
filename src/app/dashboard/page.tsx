"use client";

import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { ClassService, GuitarClass } from "@/services/class.service";
import { StudentService, Student } from "@/services/student.service";
import { BillingService, Invoice } from "@/services/billing.service";
import {
  BookOpen,
  Users,
  DollarSign,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Activity,
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Loading from "@/components/ui/loading";

export default function DashboardHome() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<GuitarClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [classesData, studentsData, invoicesData] = await Promise.all([
          ClassService.getAllClasses(),
          StudentService.getAllStudents(),
          BillingService.getAllInvoices(),
        ]);
        setClasses(classesData);
        setStudents(studentsData);
        setInvoices(invoicesData);
      } catch (error) {
        console.error("Lỗi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalClasses = classes.filter((c) => c.active).length;
  const totalStudents = students.length;

  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = invoices
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const pendingInvoices = invoices.filter((inv) => inv.status === "pending").slice(0, 4);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Xin chào, {user?.displayName || "Guitarist"}! 👋
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Hôm nay là {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}. Dưới đây là tóm tắt tình hình trung tâm.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Lớp học hoạt động</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle/60 text-brand-dark dark:bg-brand/15 dark:text-brand-light">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">{totalClasses}</span>
            <span className="text-[10px] font-medium text-neutral-400">lớp đang mở</span>
          </div>
        </Card>

        <Card className="p-6 transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Tổng số Học viên</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">{totalStudents}</span>
            <span className="text-[10px] font-medium text-neutral-400">học viên đăng ký</span>
          </div>
        </Card>

        <Card className="p-6 transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Học phí đã thu</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle/60 text-brand-dark dark:bg-brand/15 dark:text-brand-light">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold tracking-tight">{formatCurrency(totalPaid)}</span>
            <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-emerald-500">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Tháng hiện tại</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Học phí cần thu</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {formatCurrency(totalPending)}
            </span>
            <div className="mt-1 text-[10px] font-medium text-neutral-400">
              <span>Đang chờ thanh toán</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="flex flex-col justify-between p-6 lg:col-span-2">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-800 dark:text-neutral-200">
                <Calendar className="h-4 w-4 text-brand dark:text-brand-light" />
                Lịch học các lớp sắp tới
              </h3>
              <Link
                href="/dashboard/schedule"
                className="flex items-center gap-0.5 text-[11px] font-semibold text-brand-dark hover:text-brand dark:hover:text-brand-light"
              >
                Xem chi tiết lịch học
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-6 divide-y divide-neutral-100 dark:divide-neutral-800">
              {classes.slice(0, 3).map((cls) => (
                <div key={cls.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-xs font-bold text-neutral-800 dark:text-neutral-200">{cls.name}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-500">Giáo viên: {cls.teacherName}</p>
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full bg-brand px-3 py-1 text-[10px] font-bold whitespace-nowrap text-white">
                    {cls.schedule.dayOfWeek} | {cls.schedule.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
            <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-800 dark:text-neutral-200">
              <Activity className="h-4 w-4 text-rose-500" />
              Học viên chờ đóng phí
            </h3>
            <Link
              href="/dashboard/billing"
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400"
            >
              Xem hóa đơn
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {pendingInvoices.length > 0 ? (
              pendingInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-200/50 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-950/30"
                >
                  <div className="space-y-0.5">
                    <p className="max-w-[140px] truncate text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      {inv.studentName}
                    </p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-500">
                      Tháng {inv.month}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-rose-500">{formatCurrency(inv.amount)}</p>
                    <div className="mt-1">
                      <Badge variant="rose">Chưa đóng</Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-neutral-400">Đã thu đủ học phí trong tháng! 🎉</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}