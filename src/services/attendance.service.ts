export type AttendanceStatus = "present" | "excused" | "absent";

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  note: string;
}

export interface AttendanceSheet {
  classId: string;
  date: string;
  records: AttendanceRecord[];
}

const STORAGE_KEY = "may_guitar_attendance";

const mockSheets: AttendanceSheet[] = [
  {
    classId: "class-1",
    date: "2026-08-03",
    records: [
      {
        studentId: "std-1",
        studentName: "Nguyễn Minh Đức",
        status: "present",
        note: "Thuộc các hợp âm cơ bản, chuyển hợp âm mượt hơn.",
      },
      {
        studentId: "std-2",
        studentName: "Trần Bảo Nam",
        status: "present",
        note: "Cần luyện thêm bài tập tiết tấu.",
      },
    ],
  },
  {
    classId: "class-1",
    date: "2026-08-10",
    records: [
      {
        studentId: "std-1",
        studentName: "Nguyễn Minh Đức",
        status: "present",
        note: "Ôn luyện bài hát mới, quạt chải tốt.",
      },
      {
        studentId: "std-2",
        studentName: "Trần Bảo Nam",
        status: "absent",
        note: "Xin nghỉ không lý do, cần nhắc nhở phụ huynh.",
      },
    ],
  },
  {
    classId: "class-2",
    date: "2026-08-12",
    records: [
      {
        studentId: "std-3",
        studentName: "Lê Minh Tuấn",
        status: "present",
        note: "Ôn bài Cổ điển tốt, học kỹ thuật mới nhanh.",
      },
    ],
  },
  {
    classId: "class-3",
    date: "2026-08-08",
    records: [
      {
        studentId: "std-4",
        studentName: "Phạm Thùy Chi",
        status: "present",
        note: "Hoàn thành bài Fingerstyle tuần này.",
      },
      {
        studentId: "std-5",
        studentName: "Hoàng Khánh An",
        status: "excused",
        note: "Bận thi học kỳ trên trường.",
      },
    ],
  },
];

function readAll(): AttendanceSheet[] {
  if (typeof window === "undefined") return mockSheets;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSheets));
    return mockSheets;
  }
  try {
    return JSON.parse(stored) as AttendanceSheet[];
  } catch {
    return mockSheets;
  }
}

function writeAll(sheets: AttendanceSheet[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
}

export const AttendanceService = {
  async getAttendanceSheet(classId: string, date: string): Promise<AttendanceSheet | null> {
    return readAll().find((s) => s.classId === classId && s.date === date) ?? null;
  },

  async saveAttendanceSheet(classId: string, date: string, records: AttendanceRecord[]): Promise<void> {
    const sheets = readAll();
    const existing = sheets.find((s) => s.classId === classId && s.date === date);
    if (existing) {
      writeAll(sheets.map((s) => (s === existing ? { ...s, records } : s)));
    } else {
      writeAll([...sheets, { classId, date, records }]);
    }
  },
};