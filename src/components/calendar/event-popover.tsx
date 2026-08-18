"use client";

import { useEffect, useRef } from "react";
import { Clock, GraduationCap, Users, Wallet, X, Pencil, Trash2 } from "lucide-react";
import { useCalendar } from "./calendar-context";
import { formatTimeRange, getClassColor } from "./calendar-types";

export default function EventPopover() {
  const { popover, closePopover, openEdit, deleteClass, refresh } = useCalendar();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!popover) return;

    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closePopover();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopover();
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [popover, closePopover]);

  if (!popover) return null;
  const { cls, x, y } = popover;
  const color = getClassColor(cls.teacherName);
  const padding = 24;
  const left = Math.min(x, window.innerWidth - 300 - padding);
  const top = Math.min(y, window.innerHeight - 280 - padding);

  const handleDelete = async () => {
    await deleteClass(cls.id);
    await refresh();
    closePopover();
  };

  return (
    <div
      ref={ref}
      className="fade-in-fast fixed z-50 w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
      style={{ left: Math.max(padding, left), top: Math.max(padding, top) }}
    >
      <div className="flex items-start justify-between gap-2 border-b border-neutral-100 p-4 pb-3 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color.bg }} />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            {cls.name.replace("Lớp Guitar ", "Lớp Guitar ")}
          </h3>
        </div>
        <button
          type="button"
          aria-label="Đóng"
          onClick={closePopover}
          className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 p-4 text-xs text-neutral-600 dark:text-neutral-300">
        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 shrink-0 text-brand dark:text-brand-light" />
          <span>
            {cls.schedule.dayOfWeek}, {formatTimeRange(cls.schedule.time)}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <GraduationCap className="h-4 w-4 shrink-0 text-brand dark:text-brand-light" />
          <span>{cls.teacherName}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Users className="h-4 w-4 shrink-0 text-brand dark:text-brand-light" />
          <span>{cls.studentIds.length} học viên</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Wallet className="h-4 w-4 shrink-0 text-brand dark:text-brand-light" />
          <span>{cls.tuitionRate.toLocaleString("vi-VN")}đ / tháng</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
        <button
          type="button"
          onClick={handleDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400"
          aria-label="Xóa lớp"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            openEdit(cls);
            closePopover();
          }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          <Pencil className="h-3.5 w-3.5" />
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
}
