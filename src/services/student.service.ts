export type GuitarLevel = "Cơ bản (Đệm hát)" | "Cổ điển (Classic)" | "Nâng cao (Fingerstyle)";

export interface Student {
  id: string;
  name: string;
  parentName: string;
  phoneNumber: string;
  guitarLevel: GuitarLevel;
  joinDate: string;
  email?: string;
}

const STORAGE_KEY = "may_guitar_students";

const mockStudents: Student[] = [
  {
    id: "std-1",
    name: "Nguyễn Minh Đức",
    parentName: "Nguyễn Văn Hải",
    phoneNumber: "0912345678",
    guitarLevel: "Cơ bản (Đệm hát)",
    joinDate: "2026-01-10",
    email: "minhduc@gmail.com",
  },
  {
    id: "std-2",
    name: "Trần Bảo Nam",
    parentName: "Phan Thị Thu",
    phoneNumber: "0987654321",
    guitarLevel: "Cơ bản (Đệm hát)",
    joinDate: "2026-02-15",
    email: "baonam@gmail.com",
  },
  {
    id: "std-3",
    name: "Lê Minh Tuấn",
    parentName: "Lê Văn Tùng",
    phoneNumber: "0905123456",
    guitarLevel: "Cổ điển (Classic)",
    joinDate: "2025-11-20",
    email: "tuanguitar@gmail.com",
  },
  {
    id: "std-4",
    name: "Phạm Thùy Chi",
    parentName: "Phạm Minh Hoàng",
    phoneNumber: "0934888999",
    guitarLevel: "Nâng cao (Fingerstyle)",
    joinDate: "2025-08-05",
    email: "thuychi@gmail.com",
  },
  {
    id: "std-5",
    name: "Hoàng Khánh An",
    parentName: "Hoàng Quốc Việt",
    phoneNumber: "0945678123",
    guitarLevel: "Nâng cao (Fingerstyle)",
    joinDate: "2026-03-01",
    email: "khanhan@gmail.com",
  },
  {
    id: "std-6",
    name: "Võ Thị Hồng Nhung",
    parentName: "Võ Đình Khoa",
    phoneNumber: "0968111222",
    guitarLevel: "Cổ điển (Classic)",
    joinDate: "2026-04-12",
    email: "hongnhung@gmail.com",
  },
  {
    id: "std-7",
    name: "Đặng Quốc Bảo",
    parentName: "Đặng Văn Thịnh",
    phoneNumber: "0977555333",
    guitarLevel: "Cơ bản (Đệm hát)",
    joinDate: "2026-05-06",
    email: "quocbao@gmail.com",
  },
];

function readAll(): Student[] {
  if (typeof window === "undefined") return mockStudents;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockStudents));
    return mockStudents;
  }
  try {
    return JSON.parse(stored) as Student[];
  } catch {
    return mockStudents;
  }
}

function writeAll(students: Student[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

export const StudentService = {
  async getAllStudents(): Promise<Student[]> {
    return [...readAll()];
  },

  async createStudent(input: Omit<Student, "id">): Promise<Student> {
    const created: Student = { ...input, id: `std-${Date.now()}` };
    writeAll([created, ...readAll()]);
    return created;
  },

  async updateStudent(id: string, input: Partial<Omit<Student, "id">>): Promise<void> {
    writeAll(readAll().map((s) => (s.id === id ? { ...s, ...input } : s)));
  },

  async deleteStudent(id: string): Promise<void> {
    writeAll(readAll().filter((s) => s.id !== id));
  },
};