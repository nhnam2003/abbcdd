"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendar } from "./calendar-context";
import { DAY_SHORT, addDays, isSameDay, isToday, startOfWeek } from "./calendar-types";

function getDaysMatrix(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export default function MiniCalendar() {
  const { miniDate, setMiniDate, currentDate, setCurrentDate } = useCalendar();
  const days = getDaysMatrix(miniDate);

  const monthLabel = miniDate.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  const goPrevMonth = () => setMiniDate(new Date(miniDate.getFullYear(), miniDate.getMonth() - 1, 1));
  const goNextMonth = () => setMiniDate(new Date(miniDate.getFullYear(), miniDate.getMonth() + 1, 1));

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between px-1 pb-2">
        <h3 className="text-xs font-semibold capitalize text-neutral-800 dark:text-neutral-200">
          {monthLabel}
        </h3>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Tháng trước"
            onClick={goPrevMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Tháng sau"
            onClick={goNextMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center">
        {DAY_SHORT.map((d) => (
          <span key={d} className="py-1 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((date, idx) => {
          const inCurrentMonth = date.getMonth() === miniDate.getMonth();
          const isSelected = isSameDay(date, currentDate);
          const today = isToday(date);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentDate(date)}
              className={`flex h-7 w-full items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
                isSelected
                  ? "bg-brand text-white"
                  : today
                    ? "bg-brand/10 font-bold text-brand-dark dark:text-brand-light"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              } ${!inCurrentMonth && !isSelected ? "text-neutral-300 dark:text-neutral-600" : ""}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
