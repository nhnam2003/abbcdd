"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { useCalendar, type DialogState } from "./calendar-context";
import {
  DAY_NAMES,
  DEFAULT_DURATION,
  buildTimeRange,
  minutesToTime,
  parseTimeRange,
  timeToMinutes,
} from "./calendar-types";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";

function DialogContent({ dialog }: { dialog: NonNullable<DialogState> }) {
  const { closeDialog, createClass, updateClass, deleteClass, refresh } = useCalendar();
  const [error, setError] = useState<string | null>(null);

  const editing = dialog.mode === "edit" ? dialog.cls : null;
  const editingStart = editing ? parseTimeRange(editing.schedule.time).start : null;
  const editingEnd = editing ? parseTimeRange(editing.schedule.time).end : null;
  const defaultStart = dialog.mode === "create" ? (dialog.start ?? "18:00") : "18:00";

  const [name, setName] = useState(editing?.name ?? "");
  const [dayOfWeek, setDayOfWeek] = useState(
    editing?.schedule.dayOfWeek ?? (dialog.mode === "create" ? (dialog.dayOfWeek ?? "Thứ 2") : "Thứ 2")
  );
  const [start, setStart] = useState(editingStart != null ? minutesToTime(editingStart) : defaultStart);
  const [end, setEnd] = useState(
    editingEnd != null
      ? minutesToTime(editingEnd)
      : minutesToTime(timeToMinutes(defaultStart) + DEFAULT_DURATION)
  );
  const [teacherName, setTeacherName] = useState(editing?.teacherName ?? "Thầy Tiến Guitar");
  const [tuitionRate, setTuitionRate] = useState(editing?.tuitionRate ?? 800000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);

    if (!name.trim()) {
      setError("Vui lòng nhập tên lớp học.");
      return;
    }
    if (endMin <= startMin) {
      setError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    const schedule = { dayOfWeek, time: buildTimeRange(startMin, endMin) };

    if (editing) {
      await updateClass(editing.id, { name, teacherName, schedule, tuitionRate });
    } else {
      await createClass({
        name,
        teacherId: "u-teacher-1",
        teacherName,
        studentIds: [],
        schedule,
        tuitionRate,
        active: true,
      });
    }
    closeDialog();
  };

  const handleDelete = async () => {
    if (!editing) return;
    await deleteClass(editing.id);
    await refresh();
    closeDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/60 p-4 backdrop-blur-xs sm:items-center">
      <div className="fade-in max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto overscroll-contain rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900/95">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white px-5 py-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            {editing ? "Sửa lớp học" : "Lớp học mới"}
          </h3>
          <div className="flex items-center gap-1">
            {editing && (
              <button
                type="button"
                aria-label="Xóa lớp"
                onClick={handleDelete}
                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              aria-label="Đóng"
              onClick={closeDialog}
              className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form className="space-y-4 px-5 py-5" onSubmit={handleSubmit}>
          <Input
            label="Tên lớp học"
            type="text"
            required
            placeholder="VD: Lớp Đệm Hát Guitar A5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-base font-medium"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Ngày trong tuần" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
              {DAY_NAMES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <Input
              label="Giảng viên"
              type="text"
              required
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Giờ bắt đầu"
              type="time"
              required
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
            <Input
              label="Giờ kết thúc"
              type="time"
              required
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>

          <Input
            label="Học phí (VND / Tháng)"
            type="number"
            required
            min={0}
            value={tuitionRate}
            onChange={(e) => setTuitionRate(Number(e.target.value))}
          />

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs text-red-600 dark:border-red-950 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Hủy
            </Button>
            <Button type="submit">{editing ? "Lưu thay đổi" : "Lưu"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClassDialog() {
  const { dialog } = useCalendar();
  if (!dialog) return null;
  return <DialogContent dialog={dialog} />;
}