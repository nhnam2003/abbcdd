"use client";

import { useEffect, useRef, useState } from "react";
import type { GuitarClass } from "@/services/class.service";
import { useCalendar } from "./calendar-context";
import {
  DAY_SHORT,
  HOUR_HEIGHT,
  MIN_SLOT_MINUTES,
  buildTimeRange,
  classesForDate,
  dayIndexToName,
  getClassColor,
  isToday,
  layoutEvents,
  minutesToTime,
  roundToSlot,
  toClassEvent,
  weekDates,
} from "./calendar-types";

type GridMode = "week" | "day";

interface DragInfo {
  type: "move" | "resize";
  classId: string;
  startMin: number;
  endMin: number;
  grabOffset: number;
}

interface PreviewRect {
  dayIndex: number;
  start: number;
  end: number;
}

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function TimeGridView({ mode, className = "" }: { mode: GridMode; className?: string }) {
  const { currentDate, setCurrentDate, classes, openCreate, openPopover, updateClass } = useCalendar();
  const gridRef = useRef<HTMLDivElement | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const dragRef = useRef<DragInfo | null>(null);
  const didDragRef = useRef(false);
  const [preview, setPreview] = useState<PreviewRect | null>(null);

  const now = useNow();
  const days = mode === "week" ? weekDates(currentDate) : [currentDate];
  const dayCount = days.length;

  useEffect(() => {
    if (!dragActive) return;

    const onMove = (e: PointerEvent) => {
      const grid = gridRef.current;
      const drag = dragRef.current;
      if (!grid || !drag) return;

      const rect = grid.getBoundingClientRect();
      const dayWidth = rect.width / dayCount;
      const relX = e.clientX - rect.left;
      const dayIndex = Math.max(0, Math.min(dayCount - 1, Math.floor(relX / dayWidth)));

      const rawMinutes = ((e.clientY - rect.top) / HOUR_HEIGHT) * 60;

      if (drag.type === "move") {
        const duration = drag.endMin - drag.startMin;
        const maxStart = 24 * 60 - duration;
        const targetStart = Math.min(roundToSlot(rawMinutes - drag.grabOffset), maxStart);
        setPreview({ dayIndex, start: targetStart, end: targetStart + duration });
      } else {
        const snappedEnd = Math.round(rawMinutes / MIN_SLOT_MINUTES) * MIN_SLOT_MINUTES;
        const targetEnd = Math.min(Math.max(snappedEnd, drag.startMin + MIN_SLOT_MINUTES), 24 * 60);
        setPreview({ dayIndex, start: drag.startMin, end: targetEnd });
      }
    };

    const onUp = () => {
      const drag = dragRef.current;
      const target = preview;
      dragRef.current = null;
      setDragActive(false);
      setPreview(null);
      didDragRef.current = true;
      document.body.classList.remove("select-none");
      setTimeout(() => {
        didDragRef.current = false;
      }, 0);

      if (drag && target) {
        const dayName = dayIndexToName(target.dayIndex);
        void updateClass(drag.classId, {
          schedule: { dayOfWeek: dayName, time: buildTimeRange(target.start, target.end) },
        });
      }
    };

    const onCancel = () => {
      dragRef.current = null;
      setDragActive(false);
      setPreview(null);
      document.body.classList.remove("select-none");
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [dragActive, dayCount, preview, updateClass]);

  const startDrag = (e: React.PointerEvent, cls: GuitarClass, type: DragInfo["type"]) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    const { start, end } = toClassEvent(cls);
    const grid = gridRef.current;
    const grabOffset = grid ? ((e.clientY - grid.getBoundingClientRect().top) / HOUR_HEIGHT) * 60 - start : 0;

    dragRef.current = { type, classId: cls.id, startMin: start, endMin: end, grabOffset };
    setDragActive(true);
    document.body.classList.add("select-none");
  };

  const handleSlotClick = (e: React.MouseEvent, dayIndex: number) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    const grid = gridRef.current;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const minutes = roundToSlot(((e.clientY - rect.top) / HOUR_HEIGHT) * 60);
    openCreate({ dayOfWeek: dayIndexToName(dayIndex), start: minutesToTime(minutes) });
  };

  const handleEventClick = (e: React.MouseEvent, cls: GuitarClass) => {
    e.stopPropagation();
    openPopover({ cls, x: e.clientX, y: e.clientY });
  };

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className={`flex h-full flex-col overflow-hidden ${className}`}>
      <div className="flex shrink-0 border-b border-neutral-200 dark:border-neutral-800">
        <div className="w-14 shrink-0" />
        <div className="flex flex-1">
          {days.map((date) => {
            const today = isToday(date);
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => {
                  if (mode === "week") {
                    setCurrentDate(date);
                  }
                }}
                className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
                  today ? "" : ""
                }`}
              >
                <span className={`text-[10px] font-medium ${today ? "text-brand-dark dark:text-brand-light" : "text-neutral-500"}`}>
                  {DAY_SHORT[date.getDay()]}
                </span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    today
                      ? "bg-brand font-bold text-white"
                      : "font-medium text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain">
        <div className="flex" style={{ height: 24 * HOUR_HEIGHT }}>
          <div className="relative w-14 shrink-0">
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="absolute right-2 -translate-y-1/2 text-[9px] font-medium text-neutral-400"
                style={{ top: h * HOUR_HEIGHT }}
              >
                {`${String(h).padStart(2, "0")}:00`}
              </div>
            ))}
            {isToday(days[0]) && (
              <div
                className="absolute right-0 h-2 w-2 -translate-x-1 -translate-y-1/2 rounded-full bg-red-500"
                style={{ top: (nowMinutes / 60) * HOUR_HEIGHT }}
              />
            )}
          </div>

          <div ref={gridRef} className="relative flex flex-1">
            {days.map((date, di) => {
              const today = isToday(date);
              const events = classesForDate(classes, date).map(toClassEvent);
              const blocks = layoutEvents(events);
              const todayLine = today
                ? { top: (nowMinutes / 60) * HOUR_HEIGHT, visible: nowMinutes >= 0 }
                : null;

              return (
                <div
                  key={date.toISOString()}
                  className="relative flex-1 border-l border-neutral-200 dark:border-neutral-800"
                  onClick={(e) => handleSlotClick(e, di)}
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <div
                      key={h}
                      className="absolute inset-x-0 border-t border-neutral-100 dark:border-neutral-800/60"
                      style={{ top: h * HOUR_HEIGHT }}
                    />
                  ))}
                  {Array.from({ length: 23 }, (_, h) => (
                    <div
                      key={`half-${h}`}
                      className="absolute inset-x-0 border-t border-dashed border-neutral-100/70 dark:border-neutral-800/40"
                      style={{ top: (h + 0.5) * HOUR_HEIGHT }}
                    />
                  ))}

                  {blocks.map((block) => {
                    const { cls, start, end } = block.event;
                    const color = getClassColor(cls.teacherName);
                    const top = (start / 60) * HOUR_HEIGHT;
                    const height = Math.max(((end - start) / 60) * HOUR_HEIGHT - 2, 22);

                    return (
                      <div
                        key={cls.id}
                        onPointerDown={(e) => startDrag(e, cls, "move")}
                        onClick={(e) => handleEventClick(e, cls)}
                        className="absolute z-10 overflow-hidden rounded-md px-1.5 py-1 text-left leading-tight shadow-sm transition-opacity hover:opacity-90"
                        style={{
                          top,
                          height,
                          left: `calc(${block.left}% + 1px)`,
                          width: `calc(${block.width}% - 3px)`,
                          backgroundColor: color.bg,
                          color: color.text,
                          cursor: "pointer",
                          touchAction: "none",
                        }}
                      >
                        <div className="pointer-events-none">
                          <div className="truncate text-[10px] font-semibold">
                            {cls.name.replace("Lớp Guitar ", "")}
                          </div>
                          <div className="truncate text-[9px] opacity-90">
                            {minutesToTime(start)} – {minutesToTime(end)}
                          </div>
                        </div>
                        <div
                          className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
                          onPointerDown={(e) => startDrag(e, cls, "resize")}
                        />
                      </div>
                    );
                  })}

                  {todayLine?.visible && (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-red-500"
                      style={{ top: todayLine.top }}
                    />
                  )}

                  {preview && preview.dayIndex === di && (
                    <div
                      className="pointer-events-none absolute z-20 rounded-md border-2 border-brand bg-brand/10"
                      style={{
                        top: (preview.start / 60) * HOUR_HEIGHT,
                        height: Math.max(((preview.end - preview.start) / 60) * HOUR_HEIGHT, 22),
                        left: 2,
                        right: 2,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
