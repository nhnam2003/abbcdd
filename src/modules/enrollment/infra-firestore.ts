// Module enrollment — Firestore adapters (infrastructure).
// Chứa toàn bộ `firebase/firestore` của HV + lớp. Domain/use-case không import firebase.

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase-client";
import { nowISO } from "@/shared/kernel/value-object";
import type { Student, GuitarClass } from "./domain";
import type { IStudentRepository, IClassRepository } from "./ports";

function db() {
  const d = getFirebaseDb();
  if (!d) throw new Error("Chưa cấu hình Firebase.");
  return d;
}

function sFromDoc(id: string, data: Record<string, unknown>): Student {
  return {
    id,
    name: data.name as string,
    parentName: data.parentName as string,
    phoneNumber: data.phoneNumber as string,
    guitarLevel: data.guitarLevel as Student["guitarLevel"],
    joinDate: data.joinDate as string,
    email: (data.email as string) || undefined,
    birthDate: data.birthDate as string | undefined,
    address: data.address as string | undefined,
    note: data.note as string | undefined,
    avatarUrl: data.avatarUrl as string | undefined,
    createdAt: data.createdAt as string | undefined,
    updatedAt: data.updatedAt as string | undefined,
  };
}

function cFromDoc(id: string, data: Record<string, unknown>): GuitarClass {
  return {
    id,
    name: data.name as string,
    teacherId: data.teacherId as string,
    teacherName: data.teacherName as string,
    studentIds: (data.studentIds as string[]) ?? [],
    schedule: data.schedule as GuitarClass["schedule"],
    tuitionRate: data.tuitionRate as number,
    active: data.active as boolean,
    maxStudents: (data.maxStudents as number) ?? 12,
    branchId: data.branchId as string | undefined,
    createdAt: data.createdAt as string | undefined,
    updatedAt: data.updatedAt as string | undefined,
  };
}

export class FirestoreStudentRepository implements IStudentRepository {
  async list(): Promise<Student[]> {
    const snap = await getDocs(query(collection(db(), "students"), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => sFromDoc(d.id, d.data()));
  }
  async getById(id: string): Promise<Student | null> {
    const s = await getDoc(doc(db(), "students", id));
    return s.exists() ? sFromDoc(s.id, s.data()) : null;
  }
  async findByPhone(phone: string): Promise<Student | null> {
    const snap = await getDocs(query(collection(db(), "students"), where("phoneNumber", "==", phone)));
    return snap.empty ? null : sFromDoc(snap.docs[0].id, snap.docs[0].data());
  }
  async create(input: Omit<Student, "id">): Promise<Student> {
    const payload = { ...input, createdAt: nowISO(), updatedAt: nowISO() };
    const ref = await addDoc(collection(db(), "students"), payload);
    return { ...input, id: ref.id, createdAt: payload.createdAt, updatedAt: payload.updatedAt };
  }
  async update(id: string, patch: Partial<Omit<Student, "id">>): Promise<void> {
    await updateDoc(doc(db(), "students", id), { ...patch, updatedAt: nowISO() });
  }
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db(), "students", id));
  }
  subscribe(cb: (list: Student[]) => void): () => void {
    return onSnapshot(
      query(collection(db(), "students"), orderBy("createdAt", "desc")),
      (snap) => cb(snap.docs.map((d) => sFromDoc(d.id, d.data())))
    );
  }
}

export class FirestoreClassRepository implements IClassRepository {
  async list(): Promise<GuitarClass[]> {
    const snap = await getDocs(query(collection(db(), "classes"), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => cFromDoc(d.id, d.data()));
  }
  async getById(id: string): Promise<GuitarClass | null> {
    const s = await getDoc(doc(db(), "classes", id));
    return s.exists() ? cFromDoc(s.id, s.data()) : null;
  }
  async listActiveByTeacher(teacherId: string): Promise<GuitarClass[]> {
    const snap = await getDocs(
      query(collection(db(), "classes"), where("teacherId", "==", teacherId), where("active", "==", true))
    );
    return snap.docs.map((d) => cFromDoc(d.id, d.data()));
  }
  async create(input: Omit<GuitarClass, "id">): Promise<GuitarClass> {
    const payload = { ...input, createdAt: nowISO(), updatedAt: nowISO() };
    const ref = await addDoc(collection(db(), "classes"), payload);
    return { ...input, id: ref.id };
  }
  async update(id: string, patch: Partial<Omit<GuitarClass, "id">>): Promise<void> {
    await updateDoc(doc(db(), "classes", id), { ...patch, updatedAt: nowISO() });
  }
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db(), "classes", id));
  }
  subscribe(cb: (list: GuitarClass[]) => void): () => void {
    return onSnapshot(
      query(collection(db(), "classes"), orderBy("createdAt", "desc")),
      (snap) => cb(snap.docs.map((d) => cFromDoc(d.id, d.data())))
    );
  }
}
