"use client";

import { useCalendar } from "./calendar-context";
import {
  DAY_SHORT,
  classesForDate,
  getClassColor,
  isSameDay,
  isToday,
  minutesToTime,
  parseTimeRange,
} from "./calendar-types";

const MAX_CHIPS = 3;

export default function MonthView() {
  const { currentDate, setCurrentDate, classes, openPopover } = useCalendar();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const handleChipClick = (e: React.MouseEvent, cls: (typeof classes)[number]) => {
    e.stopPropagation();
    openPopover({ cls, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800">
        {DAY_SHORT.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
          {rows.map((week, wi) =>
          week.map((date, di) => {
            if (!date) {
              return <div key={`${wi}-${di}`} className="min-h-16 border-b border-r border-neutral-200 sm:min-h-24 dark:border-neutral-800" />;
            }

            const dayClasses = classesForDate(classes, date);
            const today = isToday(date);
            const isSelected = isSameDay(date, currentDate);
            const extra = dayClasses.length - MAX_CHIPS;

            return (
              <div
                key={`${wi}-${di}`}
                className={`min-h-16 border-b border-r border-neutral-200 p-0.5 sm:min-h-24 sm:p-1 dark:border-neutral-800 ${
                  isSelected ? "bg-brand-subtle/20 dark:bg-brand/5" : ""
                }`}
                onClick={() => setCurrentDate(date)}
              >
                <div className="flex items-center justify-end">
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-medium sm:h-6 sm:min-w-6 sm:text-[11px] ${
                      today
                        ? "bg-brand font-bold text-white"
                        : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>

                <div className="mt-0.5 space-y-0.5">
                  {dayClasses.slice(0, MAX_CHIPS).map((cls) => {
                    const { start } = parseTimeRange(cls.schedule.time);
                    const color = getClassColor(cls.teacherName);
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={(e) => handleChipClick(e, cls)}
                        className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[9px] font-medium transition-opacity hover:opacity-85 sm:px-1.5 sm:text-[10px]"
                        style={{ backgroundColor: color.bg, color: color.text }}
                      >
                        <span className="hidden shrink-0 opacity-90 sm:inline">{minutesToTime(start)}</span>
                        <span className="truncate">{cls.name.replace("Lớp Guitar ", "")}</span>
                      </button>
                    );
                  })}
                  {extra > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentDate(date);
                      }}
                      className="w-full truncate rounded px-1 py-0.5 text-left text-[9px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 sm:px-1.5 sm:text-[10px] dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                      + {extra}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
