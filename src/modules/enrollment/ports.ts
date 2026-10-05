// Module enrollment — PORTS (interfaces, application phụ thuộc vào đây).

import type { Student, GuitarClass } from "./domain";

export interface IStudentRepository {
  list(): Promise<Student[]>;
  getById(id: string): Promise<Student | null>;
  findByPhone(phone: string): Promise<Student | null>;
  create(input: Omit<Student, "id">): Promise<Student>;
  update(id: string, patch: Partial<Omit<Student, "id">>): Promise<void>;
  delete(id: string): Promise<void>;
  subscribe(cb: (list: Student[]) => void): () => void;
}

export interface IClassRepository {
  list(): Promise<GuitarClass[]>;
  getById(id: string): Promise<GuitarClass | null>;
  listActiveByTeacher(teacherId: string): Promise<GuitarClass[]>;
  create(input: Omit<GuitarClass, "id">): Promise<GuitarClass>;
  update(id: string, patch: Partial<Omit<GuitarClass, "id">>): Promise<void>;
  delete(id: string): Promise<void>;
  subscribe(cb: (list: GuitarClass[]) => void): () => void;
}
