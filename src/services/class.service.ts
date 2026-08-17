export interface ClassSchedule {
  dayOfWeek: string;
  time: string;
}

export interface GuitarClass {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  studentIds: string[];
  schedule: ClassSchedule;
  tuitionRate: number;
  active: boolean;
}

const STORAGE_KEY = "may_guitar_classes";

const mockClasses: GuitarClass[] = [
  {
    id: "class-1",
    name: "Lớp Guitar Đệm Hát Cơ Bản A1",
    teacherId: "u-teacher-1",
    teacherName: "Thầy Tiến Guitar",
    studentIds: ["std-1", "std-2"],
    schedule: { dayOfWeek: "Thứ 2", time: "18:00 - 19:30" },
    tuitionRate: 800000,
    active: true,
  },
  {
    id: "class-2",
    name: "Lớp Guitar Cổ Điển Classic B2",
    teacherId: "u-teacher-2",
    teacherName: "Cô Phương Cầm",
    studentIds: ["std-3"],
    schedule: { dayOfWeek: "Thứ 4", time: "19:30 - 21:00" },
    tuitionRate: 1200000,
    active: true,
  },
  {
    id: "class-3",
    name: "Lớp Guitar Fingerstyle Nâng Cao C1",
    teacherId: "u-teacher-1",
    teacherName: "Thầy Tiến Guitar",
    studentIds: ["std-4", "std-5"],
    schedule: { dayOfWeek: "Thứ 7", time: "15:00 - 16:30" },
    tuitionRate: 1500000,
    active: true,
  },
  {
    id: "class-4",
    name: "Lớp Guitar Cổ Điển Nâng Cao C2",
    teacherId: "u-teacher-2",
    teacherName: "Cô Phương Cầm",
    studentIds: ["std-6", "std-7"],
    schedule: { dayOfWeek: "Thứ 5", time: "19:00 - 20:30" },
    tuitionRate: 1200000,
    active: true,
  },
  {
    id: "class-5",
    name: "Lớp Guitar Nhập Môn Thiếu Nhi E1",
    teacherId: "u-teacher-1",
    teacherName: "Thầy Tiến Guitar",
    studentIds: ["std-7"],
    schedule: { dayOfWeek: "Chủ Nhật", time: "09:00 - 10:30" },
    tuitionRate: 600000,
    active: false,
  },
];

function readAll(): GuitarClass[] {
  if (typeof window === "undefined") return mockClasses;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockClasses));
    return mockClasses;
  }
  try {
    return JSON.parse(stored) as GuitarClass[];
  } catch {
    return mockClasses;
  }
}

function writeAll(classes: GuitarClass[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
}

export const ClassService = {
  async getAllClasses(): Promise<GuitarClass[]> {
    return [...readAll()];
  },

  async createClass(input: Omit<GuitarClass, "id">): Promise<GuitarClass> {
    const created: GuitarClass = { ...input, id: `class-${Date.now()}` };
    writeAll([created, ...readAll()]);
    return created;
  },

  async updateClass(id: string, input: Partial<Omit<GuitarClass, "id">>): Promise<void> {
    writeAll(readAll().map((c) => (c.id === id ? { ...c, ...input } : c)));
  },

  async deleteClass(id: string): Promise<void> {
    writeAll(readAll().filter((c) => c.id !== id));
  },
};