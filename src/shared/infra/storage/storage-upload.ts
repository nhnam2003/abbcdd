// Storage upload (P3-06): resize client + upload avatar/logo.
// Path: avatars/{studentId|uid}.jpg, branding/logo.png, docs/{id}/*.

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase-client";

const MAX_BYTES = 2 * 1024 * 1024;
const TARGET_MAX_DIM = 512;

async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, TARGET_MAX_DIM / Math.max(bitmap.width, bitmap.height));
  if (scale >= 1 && file.size <= MAX_BYTES) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.82)
  );
  return blob ?? file;
}

function assertImage(file: File): void {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Chỉ nhận ảnh JPG/PNG/WebP.");
  }
  if (file.size > 5 * 1024 * 1024) throw new Error("Ảnh quá lớn (tối đa 5MB).");
}

export async function uploadStudentAvatar(studentId: string, file: File): Promise<string> {
  const storage = getFirebaseStorage();
  if (!storage) throw new Error("Chưa cấu hình Firebase Storage.");
  assertImage(file);
  const blob = await resizeImage(file);
  const r = ref(storage, `avatars/${studentId}.jpg`);
  await uploadBytes(r, blob, { contentType: "image/jpeg" });
  return getDownloadURL(r);
}

export async function deleteStudentAvatar(studentId: string): Promise<void> {
  const storage = getFirebaseStorage();
  if (!storage) return;
  try {
    await deleteObject(ref(storage, `avatars/${studentId}.jpg`));
  } catch {}
}

export async function uploadBrandLogo(file: File): Promise<string> {
  const storage = getFirebaseStorage();
  if (!storage) throw new Error("Chưa cấu hình Firebase Storage.");
  assertImage(file);
  const blob = await resizeImage(file);
  const r = ref(storage, "branding/logo.png");
  await uploadBytes(r, blob, { contentType: "image/png" });
  return getDownloadURL(r);
}
