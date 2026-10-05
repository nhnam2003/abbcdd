// Migrate seed localStorage lên Firestore 1 lần (task-P3-03).
// Chạy: npm run migrate  (tự load .env/.env.local qua @next/env)
// - Dùng firebase-admin (đã có trong dependencies).
// - Idempotent: check trùng trước khi ghi (phoneNumber / composite keys / docId).

import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Thiếu env ${name}. Xem .env.example`);
  return v;
}

const projectId = mustEnv("FIREBASE_PROJECT_ID");
const clientEmail = mustEnv("FIREBASE_CLIENT_EMAIL");
const privateKey = mustEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

if (getApps().length === 0) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}
const db = getFirestore();
console.log(`[migrate] project=${projectId} region=asia-southeast1`);

const toMonthKey = (month) => {
  const m = month.match(/^(\d{1,2})\/(\d{4})$/);
  if (!m) return month;
  return `${m[2]}-${m[1].padStart(2, "0")}`;
};

const students = [
  { localId: "std-1", name: "Nguyễn Minh Đức", parentName: "Nguyễn Văn Hải", phoneNumber: "0912345678", guitarLevel: "Cơ bản (Đệm hát)", joinDate: "2026-01-10", email: "minhduc@gmail.com" },
  { localId: "std-2", name: "Trần Bảo Nam", parentName: "Phan Thị Thu", phoneNumber: "0987654321", guitarLevel: "Cơ bản (Đệm hát)", joinDate: "2026-02-15", email: "baonam@gmail.com" },
  { localId: "std-3", name: "Lê Minh Tuấn", parentName: "Lê Văn Tùng", phoneNumber: "0905123456", guitarLevel: "Cổ điển (Classic)", joinDate: "2025-11-20", email: "tuanguitar@gmail.com" },
  { localId: "std-4", name: "Phạm Thùy Chi", parentName: "Phạm Minh Hoàng", phoneNumber: "0934888999", guitarLevel: "Nâng cao (Fingerstyle)", joinDate: "2025-08-05", email: "thuychi@gmail.com" },
  { localId: "std-5", name: "Hoàng Khánh An", parentName: "Hoàng Quốc Việt", phoneNumber: "0945678123", guitarLevel: "Nâng cao (Fingerstyle)", joinDate: "2026-03-01", email: "khanhan@gmail.com" },
  { localId: "std-6", name: "Võ Thị Hồng Nhung", parentName: "Võ Đình Khoa", phoneNumber: "0968111222", guitarLevel: "Cổ điển (Classic)", joinDate: "2026-04-12", email: "hongnhung@gmail.com" },
  { localId: "std-7", name: "Đặng Quốc Bảo", parentName: "Đặng Văn Thịnh", phoneNumber: "0977555333", guitarLevel: "Cơ bản (Đệm hát)", joinDate: "2026-05-06", email: "quocbao@gmail.com" },
];

const classes = [
  { localId: "class-1", name: "Lớp Guitar Đệm Hát Cơ Bản A1", teacherId: "u-teacher-1", teacherName: "Thầy Tiến Guitar", studentPhones: ["0912345678", "0987654321"], schedule: { dayOfWeek: "Thứ 2", time: "18:00 - 19:30" }, tuitionRate: 800000, active: true, maxStudents: 12 },
  { localId: "class-2", name: "Lớp Guitar Cổ Điển Classic B2", teacherId: "u-teacher-2", teacherName: "Cô Phương Cầm", studentPhones: ["0905123456"], schedule: { dayOfWeek: "Thứ 4", time: "19:30 - 21:00" }, tuitionRate: 1200000, active: true, maxStudents: 10 },
  { localId: "class-3", name: "Lớp Guitar Fingerstyle Nâng Cao C1", teacherId: "u-teacher-1", teacherName: "Thầy Tiến Guitar", studentPhones: ["0934888999", "0945678123"], schedule: { dayOfWeek: "Thứ 7", time: "15:00 - 16:30" }, tuitionRate: 1500000, active: true, maxStudents: 8 },
  { localId: "class-4", name: "Lớp Guitar Cổ Điển Nâng Cao C2", teacherId: "u-teacher-2", teacherName: "Cô Phương Cầm", studentPhones: ["0968111222", "0977555333"], schedule: { dayOfWeek: "Thứ 5", time: "19:00 - 20:30" }, tuitionRate: 1200000, active: true, maxStudents: 10 },
  { localId: "class-5", name: "Lớp Guitar Nhập Môn Thiếu Nhi E1", teacherId: "u-teacher-1", teacherName: "Thầy Tiến Guitar", studentPhones: ["0977555333"], schedule: { dayOfWeek: "Chủ Nhật", time: "09:00 - 10:30" }, tuitionRate: 600000, active: false, maxStudents: 15 },
];

const invoices = [
  { studentPhone: "0912345678", classLocal: "class-1", month: "8/2026", amount: 800000, status: "paid", paidAt: "2026-08-02T09:30:00.000Z" },
  { studentPhone: "0987654321", classLocal: "class-1", month: "8/2026", amount: 800000, status: "pending" },
  { studentPhone: "0905123456", classLocal: "class-2", month: "8/2026", amount: 1200000, status: "paid", paidAt: "2026-08-01T14:00:00.000Z" },
  { studentPhone: "0934888999", classLocal: "class-3", month: "8/2026", amount: 1500000, status: "pending" },
  { studentPhone: "0945678123", classLocal: "class-3", month: "8/2026", amount: 1500000, status: "paid", paidAt: "2026-08-05T10:15:00.000Z" },
  { studentPhone: "0968111222", classLocal: "class-4", month: "8/2026", amount: 1200000, status: "paid", paidAt: "2026-08-03T16:45:00.000Z" },
  { studentPhone: "0977555333", classLocal: "class-4", month: "8/2026", amount: 1200000, status: "pending" },
  { studentPhone: "0912345678", classLocal: "class-1", month: "7/2026", amount: 800000, status: "paid", paidAt: "2026-07-01T09:00:00.000Z" },
  { studentPhone: "0987654321", classLocal: "class-1", month: "7/2026", amount: 800000, status: "paid", paidAt: "2026-07-08T19:20:00.000Z" },
  { studentPhone: "0905123456", classLocal: "class-2", month: "7/2026", amount: 1200000, status: "paid", paidAt: "2026-07-15T08:50:00.000Z" },
  { studentPhone: "0934888999", classLocal: "class-3", month: "7/2026", amount: 1500000, status: "pending" },
  { studentPhone: "0945678123", classLocal: "class-3", month: "6/2026", amount: 1500000, status: "paid", paidAt: "2026-06-02T11:10:00.000Z" },
];

const sheets = [
  { classLocal: "class-1", date: "2026-08-03", records: [{ phone: "0912345678", status: "present", note: "Thuộc các hợp âm cơ bản." }, { phone: "0987654321", status: "present", note: "Cần luyện tiết tấu." }] },
  { classLocal: "class-1", date: "2026-08-10", records: [{ phone: "0912345678", status: "present", note: "Quạt chải tốt." }, { phone: "0987654321", status: "absent", note: "Nghỉ không lý do." }] },
  { classLocal: "class-2", date: "2026-08-12", records: [{ phone: "0905123456", status: "present", note: "Ôn Classic tốt." }] },
  { classLocal: "class-3", date: "2026-08-08", records: [{ phone: "0934888999", status: "present", note: "Xong Fingerstyle." }, { phone: "0945678123", status: "excused", note: "Bận thi." }] },
];

async function main() {
  const now = new Date().toISOString();
  // 1. students (dedupe theo phoneNumber)
  const phoneToId = {};
  for (const s of students) {
    const dup = await db.collection("students").where("phoneNumber", "==", s.phoneNumber).limit(1).get();
    if (!dup.empty) {
      phoneToId[s.phoneNumber] = dup.docs[0].id;
      console.log(`[skip] student ${s.phoneNumber} -> ${dup.docs[0].id}`);
      continue;
    }
    const ref = await db.collection("students").add({
      name: s.name, parentName: s.parentName, phoneNumber: s.phoneNumber,
      guitarLevel: s.guitarLevel, joinDate: s.joinDate, email: s.email,
      createdAt: now, updatedAt: now, serverCreatedAt: FieldValue.serverTimestamp(),
    });
    phoneToId[s.phoneNumber] = ref.id;
    console.log(`[create] student ${s.localId} (${s.phoneNumber}) -> ${ref.id}`);
  }
  // 2. classes (map studentPhones -> ids)
  const localClassToId = {};
  for (const c of classes) {
    const dup = await db.collection("classes").where("name", "==", c.name).limit(1).get();
    const studentIds = c.studentPhones.map((p) => phoneToId[p]).filter(Boolean);
    if (!dup.empty) {
      localClassToId[c.localId] = dup.docs[0].id;
      console.log(`[skip] class ${c.localId} -> ${dup.docs[0].id}`);
      continue;
    }
    const ref = await db.collection("classes").add({
      name: c.name, teacherId: c.teacherId, teacherName: c.teacherName,
      studentIds, maxStudents: c.maxStudents, schedule: c.schedule,
      tuitionRate: c.tuitionRate, active: c.active,
      createdAt: now, updatedAt: now, serverCreatedAt: FieldValue.serverTimestamp(),
    });
    localClassToId[c.localId] = ref.id;
    console.log(`[create] class ${c.localId} -> ${ref.id} students=${studentIds.length}`);
  }
  // class name map cho invoices
  const classIdToName = {};
  for (const c of classes) classIdToName[localClassToId[c.localId]] = c.name;

  // 3. invoices (dedupe theo studentId+classId+monthKey)
  const allStudents = await db.collection("students").get();
  const phoneToName = {};
  allStudents.forEach((d) => { phoneToName[d.data().phoneNumber] = d.data().name; });
  for (const inv of invoices) {
    const studentId = phoneToId[inv.studentPhone];
    const classId = localClassToId[inv.classLocal];
    const monthKey = toMonthKey(inv.month);
    const dup = await db.collection("invoices")
      .where("studentId", "==", studentId).where("classId", "==", classId).where("monthKey", "==", monthKey)
      .limit(1).get();
    if (!dup.empty) {
      console.log(`[skip] invoice ${inv.studentPhone} ${inv.month} -> ${dup.docs[0].id}`);
      continue;
    }
    const ref = await db.collection("invoices").add({
      studentId, studentName: phoneToName[inv.studentPhone] ?? "Học viên",
      classId, className: classIdToName[classId] ?? "Lớp học",
      month: inv.month, monthKey, amount: inv.amount,
      status: inv.status, paidAt: inv.paidAt ?? null, createdAt: now,
      serverCreatedAt: FieldValue.serverTimestamp(),
    });
    console.log(`[create] invoice ${inv.studentPhone} ${inv.month} -> ${ref.id}`);
  }
  // 4. attendance_sheets (docId = classId_date)
  for (const s of sheets) {
    const classId = localClassToId[s.classLocal];
    const docId = `${classId}_${s.date}`;
    const existing = await db.collection("attendance_sheets").doc(docId).get();
    if (existing.exists) {
      console.log(`[skip] sheet ${docId}`);
      continue;
    }
    const records = s.records.map((r) => ({
      studentId: phoneToId[r.phone], studentName: phoneToName[r.phone] ?? "Học viên",
      status: r.status, note: r.note,
    }));
    await db.collection("attendance_sheets").doc(docId).set({
      classId, date: s.date, monthKey: s.date.slice(0, 7),
      records, updatedAt: now, serverUpdatedAt: FieldValue.serverTimestamp(),
    });
    console.log(`[create] sheet ${docId} records=${records.length}`);
  }
  console.log("[migrate] DONE. Kiểm tra Console Firebase đủ 5 collections.");
}

main().catch((e) => { console.error("[migrate] FAILED:", e.message); process.exit(1); });
