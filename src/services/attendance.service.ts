// FACADE — attendance delegate sang modules/attendance/container.
export type { AttendanceRecord, AttendanceSheet, AttendanceStatus } from "@/modules/attendance/container";
import { getSheetRepo, getStudentStats as stats } from "@/modules/attendance/container";
import { toUserMessage } from "@/shared/kernel/result";
import type { AttendanceRecord, AttendanceSheet } from "@/modules/attendance/container";

export const AttendanceService = {
  async getAttendanceSheet(classId: string, date: string) {
    try {
      return await getSheetRepo().get(classId, date);
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
  async getSheetsByClassMonth(classId: string, monthKey: string) {
    return getSheetRepo().listByClassMonth(classId, monthKey);
  },
  async getStudentStats(studentId: string) {
    return stats(studentId);
  },
  subscribeSheet(classId: string, date: string, cb: (s: AttendanceSheet | null) => void) {
    return getSheetRepo().subscribe(classId, date, cb);
  },
  async saveAttendanceSheet(classId: string, date: string, records: AttendanceRecord[]): Promise<void> {
    try {
      await getSheetRepo().save({ classId, date, monthKey: date.slice(0, 7), records });
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
  async deleteSheet(classId: string, date: string): Promise<void> {
    await getSheetRepo().delete(classId, date);
  },
};
