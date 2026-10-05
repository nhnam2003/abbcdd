// FACADE — classes delegate sang modules/enrollment.
export type { GuitarClass, ClassSchedule } from "@/modules/enrollment/domain";
import { getClassRepo } from "@/modules/enrollment/container";
import * as UC from "@/modules/enrollment/use-cases";
import { toUserMessage } from "@/shared/kernel/result";
import type { GuitarClass } from "@/modules/enrollment/domain";

export const ClassService = {
  async getAllClasses(): Promise<GuitarClass[]> {
    try {
      return await UC.listClasses(getClassRepo());
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
  subscribeClasses(cb: (c: GuitarClass[]) => void) {
    return getClassRepo().subscribe(cb);
  },
  async createClass(input: Omit<GuitarClass, "id">): Promise<GuitarClass> {
    try {
      return await UC.createClass(getClassRepo(), input);
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
  async updateClass(id: string, input: Partial<Omit<GuitarClass, "id">>): Promise<void> {
    try {
      await UC.updateClass(getClassRepo(), id, input);
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
  async enrollStudent(classId: string, studentId: string): Promise<void> {
    try {
      await UC.enrollStudent(getClassRepo(), classId, studentId);
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
  async unenrollStudent(classId: string, studentId: string): Promise<void> {
    try {
      await UC.unenrollStudent(getClassRepo(), classId, studentId);
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
  async deleteClass(id: string): Promise<void> {
    try {
      await getClassRepo().delete(id);
    } catch (e) {
      throw new Error(toUserMessage(e));
    }
  },
};
