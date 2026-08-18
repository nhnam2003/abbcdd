import type { GuitarClass } from "@/services/class.service";

export const DAY_NAMES = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
export const DAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
export const HOUR_HEIGHT = 48;
export const MIN_SLOT_MINUTES = 30;
export const DEFAULT_DURATION = 90;

export type ViewMode = "day" | "week" | "month";

export function nameToDayIndex(name: string): number {
  const idx = DAY_NAMES.indexOf(name);
  return idx === -1 ? 0 : idx;
}

export function dayIndexToName(idx: number): string {
  return DAY_NAMES[((idx % 7) + 7) % 7];
}

export function parseTimeRange(time: string): { start: number; end: number } {
  const match = time.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  if (!match) {
    const start = toMin(time.trim());
    return { start, end: start + DEFAULT_DURATION };
  }
  const start = toMin(match[1]);
  const end = toMin(match[2]);
  return { start, end: end <= start ? start + DEFAULT_DURATION : end };
}

export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function buildTimeRange(startMin: number, endMin: number): string {
  return `${minutesToTime(startMin)} - ${minutesToTime(endMin)}`;
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatTimeRange(time: string): string {
  const { start, end } = parseTimeRange(time);
  return `${minutesToTime(start)} – ${minutesToTime(end)}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function addDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export function weekDates(anchor: Date): Date[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthTitle(date: Date): string {
  return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function classesForDate(classes: GuitarClass[], date: Date): GuitarClass[] {
  const dayName = dayIndexToName(date.getDay());
  return classes.filter(
    (cls) =>
      cls.active &&
      nameToDayIndex(cls.schedule.dayOfWeek) === nameToDayIndex(dayName)
  );
}

export function roundToSlot(minutes: number): number {
  const rounded = Math.round(minutes / MIN_SLOT_MINUTES) * MIN_SLOT_MINUTES;
  return Math.max(0, Math.min(23 * 60, rounded));
}

export function snapMinutesToSlot(minutes: number): number {
  return Math.round(minutes / MIN_SLOT_MINUTES) * MIN_SLOT_MINUTES;
}

export interface ClassEvent {
  cls: GuitarClass;
  start: number;
  end: number;
}

export function toClassEvent(cls: GuitarClass): ClassEvent {
  const { start, end } = parseTimeRange(cls.schedule.time);
  return { cls, start, end };
}

export interface LayoutBlock {
  event: ClassEvent;
  left: number;
  width: number;
}

export function layoutEvents(events: ClassEvent[]): LayoutBlock[] {
  if (events.length === 0) return [];
  const sorted = [...events].sort((a, b) => a.start - b.start || b.end - a.end);
  const lanes: { end: number; id: string }[] = [];
  const assigned = new Map<string, number>();

  for (const e of sorted) {
    let lane = lanes.findIndex((l) => l.end <= e.start);
    if (lane === -1) {
      lane = lanes.length;
      lanes.push({ end: e.end, id: e.cls.id });
    } else {
      lanes[lane] = { end: e.end, id: e.cls.id };
    }
    assigned.set(e.cls.id, lane);
  }

  const total = Math.max(lanes.length, 1);
  return events.map((e) => ({
    event: e,
    left: (assigned.get(e.cls.id)! / total) * 100,
    width: 100 / total,
  }));
}

export interface EventColor {
  bg: string;
  darkBg: string;
  text: string;
}

const PALETTE: EventColor[] = [
  { bg: "#1a73e8", darkBg: "#264a7d", text: "#ffffff" },
  { bg: "#188038", darkBg: "#205c33", text: "#ffffff" },
  { bg: "#d93025", darkBg: "#6b2620", text: "#ffffff" },
  { bg: "#f9ab00", darkBg: "#6b5516", text: "#3c2f00" },
  { bg: "#8e24aa", darkBg: "#5a2a63", text: "#ffffff" },
  { bg: "#ff6d01", darkBg: "#6b4115", text: "#ffffff" },
  { bg: "#5f6368", darkBg: "#3a3f44", text: "#ffffff" },
  { bg: "#039be5", darkBg: "#1f5f7d", text: "#ffffff" },
  { bg: "#00acc1", darkBg: "#165f6b", text: "#ffffff" },
  { bg: "#c5221f", darkBg: "#6b2622", text: "#ffffff" },
];

export function getClassColor(teacherName: string): EventColor {
  let hash = 0;
  for (let i = 0; i < teacherName.length; i++) {
    hash = (hash * 31 + teacherName.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function getClassColorHex(teacherName: string): string {
  return getClassColor(teacherName).bg;
}
