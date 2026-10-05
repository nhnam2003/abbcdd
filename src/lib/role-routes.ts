// Map route dashboard → roles được phép (P0-01).
// Pure map, không import firebase/react. Layout + ProtectedRoute dùng chung.
// Nguồn bảng phân quyền: docs/01-chuc-nang-hien-co.md.

import type { UserRole } from "@/modules/identity/domain";

export type AllowedRoles = UserRole[] | undefined;

export function rolesForPath(path: string): AllowedRoles {
  if (path.startsWith("/dashboard/classes")) return ["admin"];
  if (path.startsWith("/dashboard/students")) return ["admin"];
  if (path.startsWith("/dashboard/attendance")) return ["admin", "teacher"];
  if (path.startsWith("/dashboard/billing")) return ["admin", "student"];
  if (path.startsWith("/dashboard/schedule")) return ["admin", "teacher", "student"];
  if (path.startsWith("/dashboard/profile")) return ["admin", "teacher", "student"];
  // /dashboard (overview) + fallback: mọi role đã login.
  return ["admin", "teacher", "student"];
}
