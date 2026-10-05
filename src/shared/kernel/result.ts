// Shared kernel: Result + DomainError — dùng chung cho mọi use-case.
// Domain không throw string, trả Result để presentation map sang tiếng Việt.

export type Result<T, E = DomainError> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<T>(error: DomainError): Result<T> {
  return { ok: false, error };
}

export class DomainError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "DomainError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super("VALIDATION", message);
    this.name = "ValidationError";
  }
}

export class PermissionError extends DomainError {
  constructor(message = "Bạn không có quyền thực hiện thao tác này.") {
    super("PERMISSION", message);
    this.name = "PermissionError";
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super("NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super("CONFLICT", message);
    this.name = "ConflictError";
  }
}

export function toUserMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (
    code === "permission-denied" ||
    code === "firestore/permission-denied" ||
    code === "PERMISSION"
  ) {
    return "Bạn không có quyền thực hiện thao tác này.";
  }
  if (code === "unavailable" || code === "firestore/unavailable") {
    return "Mất kết nối. Dữ liệu sẽ đồng bộ khi có mạng lại.";
  }
  if (err instanceof DomainError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}
