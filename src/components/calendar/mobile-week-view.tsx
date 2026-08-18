"use client";

import { useCalendar } from "./calendar-context";
import TimeGridView from "./time-grid-view";
import { DAY_SHORT, isSameDay, isToday, weekDates } from "./calendar-types";

export default function MobileWeekView({ className = "" }: { className?: string }) {
  const { currentDate, setCurrentDate } = useCalendar();
  const days = weekDates(currentDate);

  return (
    <div className={`flex h-full flex-col overflow-hidden ${className}`}>
      <div className="flex shrink-0 border-b border-neutral-200 px-1 pt-2 dark:border-neutral-800">
        {days.map((date) => {
          const today = isToday(date);
          const selected = isSameDay(date, currentDate);
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => setCurrentDate(date)}
              className="flex flex-1 flex-col items-center gap-1 pb-1.5"
            >
              <span
                className={`text-[10px] font-medium ${
                  today ? "text-brand-dark dark:text-brand-light" : "text-neutral-400"
                }`}
              >
                {DAY_SHORT[date.getDay()]}
              </span>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  selected
                    ? "bg-brand font-bold text-white"
                    : today
                      ? "border-2 border-brand text-brand-dark dark:text-brand-light"
                      : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
      <div className="min-h-0 flex-1">
        <TimeGridView mode="day" />
      </div>
    </div>
  );
}
