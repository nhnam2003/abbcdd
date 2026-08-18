"use client";

import { CalendarDays, Calendar, LayoutGrid, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useCalendar } from "./calendar-context";
import type { ViewMode } from "./calendar-types";
import { monthTitle, weekDates } from "./calendar-types";

function viewTitle(view: ViewMode, date: Date): string {
  if (view === "month") {
    return monthTitle(date).replace(/^./, (c) => c.toUpperCase());
  }
  const days = view === "week" ? weekDates(date) : [date];
  const start = days[0];
  const end = days[days.length - 1];

  if (view === "day") {
    return date.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startLabel = start.toLocaleDateString("vi-VN", { day: "numeric", month: "long" });
  const endLabel = end.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (sameMonth) {
    return `${start.getDate()} – ${endLabel}`;
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${startLabel} – ${endLabel}`;
  }
  const startFull = start.toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
  return `${startFull} – ${endLabel}`;
}

const VIEWS: { key: ViewMode; label: string; icon: typeof CalendarDays }[] = [
  { key: "day", label: "Ngày", icon: CalendarDays },
  { key: "week", label: "Tuần", icon: LayoutGrid },
  { key: "month", label: "Tháng", icon: Calendar },
];

export default function CalendarHeader() {
  const { view, setView, currentDate, goToday, goPrev, goNext, openCreate } = useCalendar();

  return (
    <div className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => openCreate()}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          Tạo
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Trước"
            onClick={goPrev}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Sau"
            onClick={goNext}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="ml-1 flex h-8 shrink-0 items-center rounded-md border border-neutral-200 px-2.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 sm:px-3"
          >
            Hôm nay
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <h2 className="min-w-0 truncate text-sm font-semibold capitalize text-neutral-800 dark:text-neutral-200">
          {viewTitle(view, currentDate)}
        </h2>

        <div className="flex shrink-0 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
          {VIEWS.map(({ key, label, icon: Icon }) => {
            const active = view === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={`flex h-8 items-center gap-1.5 px-3 text-xs font-medium transition-colors ${
                  active
                    ? "bg-brand text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
