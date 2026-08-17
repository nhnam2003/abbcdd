"use client";

import { useEffect, useState } from "react";
import { ClassService, GuitarClass } from "@/services/class.service";
import { StudentService, Student } from "@/services/student.service";
import { AttendanceService, AttendanceRecord } from "@/services/attendance.service";
import { Check, X, AlertCircle, Save, CheckCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Select from "@/components/ui/select";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";
import { Table, TableHead, TableRow, TableCell } from "@/components/ui/table";

type StatusToggleProps = {
  active: boolean;
  status: "present" | "excused" | "absent";
  onClick: () => void;
  children: React.ReactNode;
};

function StatusToggle({ active, status, onClick, children }: StatusToggleProps) {
  const activeClasses = {
    present:
      "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-950",
    excused:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-950",
    absent:
      "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-950",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-bold transition-all active:scale-[0.95] md:px-3 md:py-1.5 md:text-[10px] ${
        active
          ? activeClasses[status]
          : "bg-transparent border-neutral-200 text-neutral-400 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
      }`}
    >
      {children}
    </button>
  );
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<GuitarClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [classesData, studentsData] = await Promise.all([
          ClassService.getAllClasses(),
          StudentService.getAllStudents(),
        ]);
        setClasses(classesData);
        setStudents(studentsData);
        if (classesData.length > 0) {
          setSelectedClassId(classesData[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedClassId || !selectedDate) return;

    async function loadAttendanceSheet() {
      setLoading(true);
      setSaveSuccess(false);
      try {
        const sheet = await AttendanceService.getAttendanceSheet(selectedClassId, selectedDate);
        const selectedClass = classes.find(c => c.id === selectedClassId);

        if (sheet) {
          setRecords(sheet.records);
        } else {
          const enrolledStudentIds = selectedClass?.studentIds || [];
          let enrolledStudents = students.filter(s => enrolledStudentIds.includes(s.id));

          if (enrolledStudents.length === 0) {
            enrolledStudents = students;
          }

          const defaultRecords: AttendanceRecord[] = enrolledStudents.map(student => ({
            studentId: student.id,
            studentName: student.name,
            status: "present",
            note: "",
          }));
          setRecords(defaultRecords);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendanceSheet();
  }, [selectedClassId, selectedDate, classes, students]);

  const handleStatusChange = (studentId: string, status: AttendanceRecord["status"]) => {
    setRecords(prev =>
      prev.map(rec => (rec.studentId === studentId ? { ...rec, status } : rec))
    );
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setRecords(prev =>
      prev.map(rec => (rec.studentId === studentId ? { ...rec, note } : rec))
    );
  };

  const handleSave = async () => {
    if (!selectedClassId || !selectedDate) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await AttendanceService.saveAttendanceSheet(selectedClassId, selectedDate, records);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading && classes.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Điểm danh học tập</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Giảng viên chọn lớp học và ngày dạy để ghi nhận chuyên cần và nhận xét bài học.</p>
      </div>

      <Card className="grid grid-cols-1 items-end gap-4 p-4 sm:grid-cols-2 sm:p-6 md:grid-cols-3">
        <Select
          label="Chọn lớp học"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name} ({cls.schedule.dayOfWeek} - {cls.schedule.time})
            </option>
          ))}
        </Select>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Ngày học (Buổi dạy)</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-base focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-neutral-100 sm:text-xs"
          />
        </div>

        <div className="flex justify-end">
          <Button size="lg" className="w-full sm:w-auto" onClick={handleSave} disabled={saving || records.length === 0}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? "Đang lưu..." : "Lưu điểm danh"}</span>
          </Button>
        </div>
      </Card>

      {saveSuccess && (
        <div className="fade-in flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>Điểm danh đã được lưu vào hệ thống thành công!</span>
        </div>
      )}

      {loading ? (
        <Loading className="h-[30vh]" />
      ) : records.length > 0 ? (
        <>
          <div className="space-y-4 md:hidden">
            {records.map((rec) => (
              <Card key={rec.studentId} className="p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {rec.studentName.charAt(0)}
                  </div>
                  <p className="min-w-0 flex-1 truncate text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    {rec.studentName}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <StatusToggle
                    active={rec.status === "present"}
                    status="present"
                    onClick={() => handleStatusChange(rec.studentId, "present")}
                  >
                    <Check className="h-4 w-4" />
                    Có mặt
                  </StatusToggle>
                  <StatusToggle
                    active={rec.status === "excused"}
                    status="excused"
                    onClick={() => handleStatusChange(rec.studentId, "excused")}
                  >
                    <AlertCircle className="h-4 w-4" />
                    Có phép
                  </StatusToggle>
                  <StatusToggle
                    active={rec.status === "absent"}
                    status="absent"
                    onClick={() => handleStatusChange(rec.studentId, "absent")}
                  >
                    <X className="h-4 w-4" />
                    Vắng
                  </StatusToggle>
                </div>

                <input
                  type="text"
                  placeholder="Nhập nhận xét (ví dụ: Tập ngón tốt...)"
                  value={rec.note}
                  onChange={(e) => handleNoteChange(rec.studentId, e.target.value)}
                  className="mt-3 w-full rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-base focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-neutral-100 dark:focus:bg-neutral-900 sm:text-xs"
                />
              </Card>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHead
                columns={[
                  { label: "Tên học viên" },
                  { label: "Trạng thái chuyên cần", align: "center" },
                  { label: "Nhận xét của giảng viên" },
                ]}
              />
              <tbody>
                {records.map((rec) => (
                  <TableRow key={rec.studentId}>
                    <TableCell className="font-bold text-neutral-800 dark:text-neutral-200">
                      {rec.studentName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2.5">
                        <StatusToggle
                          active={rec.status === "present"}
                          status="present"
                          onClick={() => handleStatusChange(rec.studentId, "present")}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Có mặt
                        </StatusToggle>
                        <StatusToggle
                          active={rec.status === "excused"}
                          status="excused"
                          onClick={() => handleStatusChange(rec.studentId, "excused")}
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          Có phép
                        </StatusToggle>
                        <StatusToggle
                          active={rec.status === "absent"}
                          status="absent"
                          onClick={() => handleStatusChange(rec.studentId, "absent")}
                        >
                          <X className="h-3.5 w-3.5" />
                          Vắng
                        </StatusToggle>
                      </div>
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        placeholder="Nhập nhận xét (ví dụ: Tập ngón tốt, thuộc nhạc lý...)"
                        value={rec.note}
                        onChange={(e) => handleNoteChange(rec.studentId, e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-base focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-neutral-100 dark:focus:bg-neutral-900 sm:text-xs"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      ) : (
        <Card>
          <EmptyState message="Không tìm thấy thông tin học viên để điểm danh trong lớp học này." />
        </Card>
      )}
    </div>
  );
}