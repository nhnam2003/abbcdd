"use client";

import { useState, useEffect } from "react";
import { ClassService, GuitarClass } from "@/services/class.service";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  BookOpen,
  MapPin,
  Calendar as CalendarIcon,
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Modal from "@/components/ui/modal";
import Loading from "@/components/ui/loading";

export default function SchedulePage() {
  const [classes, setClasses] = useState<GuitarClass[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    teacherName: "Thầy Tiến Guitar",
    dayOfWeek: "Thứ 2",
    time: "18:00 - 19:30",
    tuitionRate: 800000,
  });

  useEffect(() => {
    async function fetchClasses() {
      try {
        const data = await ClassService.getAllClasses();
        setClasses(data);
      } catch (err) {
        console.error("Lỗi lấy lịch học:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  const getDayNameVi = (dayIndex: number): string => {
    if (dayIndex === 0) return "Chủ Nhật";
    return `Thứ ${dayIndex + 1}`;
  };

  const getClassesForDate = (date: Date): GuitarClass[] => {
    const dayIndex = date.getDay();
    const dayNameVi = getDayNameVi(dayIndex);
    return classes.filter(
      (cls) => cls.active && cls.schedule.dayOfWeek.toLowerCase() === dayNameVi.toLowerCase()
    );
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay();

  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarCells: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, totalDaysInPrevMonth - i);
    calendarCells.push({ date: prevDate, isCurrentMonth: false });
  }

  for (let i = 1; i <= totalDaysInMonth; i++) {
    const currDate = new Date(year, month, i);
    calendarCells.push({ date: currDate, isCurrentMonth: true });
  }

  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(year, month + 1, i);
    calendarCells.push({ date: nextDate, isCurrentMonth: false });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await ClassService.createClass({
        name: newSchedule.name,
        teacherId: "u-teacher-1",
        teacherName: newSchedule.teacherName,
        studentIds: [],
        schedule: {
          dayOfWeek: newSchedule.dayOfWeek,
          time: newSchedule.time,
        },
        tuitionRate: newSchedule.tuitionRate,
        active: true,
      });
      setClasses([...classes, created]);
      setShowAddModal(false);
      setNewSchedule({
        name: "",
        teacherName: "Thầy Tiến Guitar",
        dayOfWeek: "Thứ 2",
        time: "18:00 - 19:30",
        tuitionRate: 800000,
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const selectedDateClasses = selectedDate ? getClassesForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white capitalize">
            {formatMonthYear(currentDate)}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hôm nay
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm" className="ml-auto sm:ml-2" onClick={() => setShowAddModal(true)}>
              <Plus className="h-3.5 w-3.5" />
              Thêm lớp
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
              <span key={d} className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider py-1">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map(({ date, isCurrentMonth }, idx) => {
              const dateClasses = getClassesForDate(date);
              const cellIsToday = isToday(date);
              const cellIsSelected = isSelected(date);

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-[72px] sm:min-h-[84px] p-2 flex flex-col items-start justify-between rounded-xl border border-transparent transition-all relative ${isCurrentMonth
                      ? "bg-transparent text-neutral-800 dark:text-neutral-200"
                      : "bg-neutral-50/20 text-neutral-300 dark:text-neutral-700"
                    } ${cellIsSelected
                      ? "border-brand bg-brand-subtle/40 shadow-sm dark:bg-brand/10"
                      : "hover:bg-brand-subtle/30 dark:hover:bg-brand/10"
                    }`}
                >
                  <span className={`text-xs font-semibold h-6 w-6 flex items-center justify-center rounded-full ${cellIsToday
                      ? "bg-brand text-white font-bold"
                      : ""
                    }`}>
                    {date.getDate()}
                  </span>

                  <div className="w-full mt-1.5 space-y-0.5 overflow-hidden">
                    {dateClasses.slice(0, 2).map((cls) => (
                      <div
                        key={cls.id}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-200 truncate w-full border border-neutral-200/50 dark:border-neutral-800/50"
                      >
                        {cls.name.replace("Lớp Guitar ", "")}
                      </div>
                    ))}
                    {dateClasses.length > 2 && (
                      <div className="text-[8px] font-semibold text-neutral-500 dark:text-neutral-500 pl-1">
                        + {dateClasses.length - 2} lớp khác
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Chi tiết ngày học
        </h2>

        {selectedDate ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <div className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-brand text-white font-bold">
                <span className="text-[10px] leading-none uppercase">
                  {selectedDate.toLocaleDateString("vi-VN", { month: "short" })}
                </span>
                <span className="text-base leading-tight">{selectedDate.getDate()}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  {selectedDate.toLocaleDateString("vi-VN", { weekday: "long" })}
                </p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-500">
                  {selectedDate.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {selectedDateClasses.length > 0 ? (
                selectedDateClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/20 hover:scale-[1.01] transition-transform"
                  >
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-brand dark:text-brand-light" />
                      {cls.name}
                    </h3>
                    <div className="mt-3 space-y-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{cls.schedule.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-neutral-400" />
                        <span>Giảng viên: {cls.teacherName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                        <span>Phòng học số 1 - May Center</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarIcon className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
                  <p className="mt-2 text-xs text-neutral-400 font-medium">Không có lịch học guitar vào ngày này.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-500">
            Chọn một ngày trên lịch để xem chi tiết ca học.
          </div>
        )}
      </div>

      {showAddModal && (
        <Modal title="Thêm lớp học & lịch dạy" onClose={() => setShowAddModal(false)}>
          <form className="mt-4 space-y-4" onSubmit={handleAddSchedule}>
            <Input
              label="Tên lớp học"
              type="text"
              required
              placeholder="Ví dụ: Lớp Đệm Hát Guitar A5"
              value={newSchedule.name}
              onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
            />

            <Input
              label="Giảng viên dạy"
              type="text"
              required
              value={newSchedule.teacherName}
              onChange={(e) => setNewSchedule({ ...newSchedule, teacherName: e.target.value })}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Ngày trong tuần"
                value={newSchedule.dayOfWeek}
                onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value })}
              >
                {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
              <Input
                label="Giờ học (Ca học)"
                type="text"
                required
                placeholder="18:00 - 19:30"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
              />
            </div>

            <Input
              label="Học phí (VND / Tháng)"
              type="number"
              required
              value={newSchedule.tuitionRate}
              onChange={(e) => setNewSchedule({ ...newSchedule, tuitionRate: Number(e.target.value) })}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit">Xác nhận lưu</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}