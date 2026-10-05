// Cloud Function: scheduledMonthlyInvoices (P3-07).
// Deploy riêng trong functions/ (Node 20, firebase-functions v6, firebase-admin).
// Cron: 0 0 1 * * Asia/Ho_Chi_Minh — duyệt lớp active → sinh invoice pending,
// skip trùng (studentId, classId, monthKey). Tái dùng logic chống trùng của BillingService.

import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();

function monthKeyOf(d: Date): { month: string; monthKey: string } {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return { month: `${m}/${y}`, monthKey: `${y}-${String(m).padStart(2, "0")}` };
}

export const scheduledMonthlyInvoices = onSchedule(
  { schedule: "0 0 1 * *", timeZone: "Asia/Ho_Chi_Minh" },
  async () => {
    const db = getFirestore();
    const now = new Date();
    const { month, monthKey } = monthKeyOf(now);
    const classes = await db.collection("classes").where("active", "==", true).get();
    let created = 0;
    let skipped = 0;
    for (const cls of classes.docs) {
      const c = cls.data() as { name: string; tuitionRate: number; studentIds: string[] };
      for (const studentId of c.studentIds ?? []) {
        const dup = await db
          .collection("invoices")
          .where("studentId", "==", studentId)
          .where("classId", "==", cls.id)
          .where("monthKey", "==", monthKey)
          .limit(1)
          .get();
        if (!dup.empty) {
          skipped++;
          continue;
        }
        const st = await db.collection("students").doc(studentId).get();
        await db.collection("invoices").add({
          studentId,
          studentName: (st.data()?.name as string) ?? "Học viên",
          classId: cls.id,
          className: c.name,
          month,
          monthKey,
          amount: c.tuitionRate,
          status: "pending",
          createdAt: now.toISOString(),
          serverCreatedAt: FieldValue.serverTimestamp(),
          createdBy: "scheduledMonthlyInvoices",
        });
        created++;
      }
    }
    console.log(`[monthly-invoices] ${monthKey} created=${created} skipped=${skipped}`);
  }
);
