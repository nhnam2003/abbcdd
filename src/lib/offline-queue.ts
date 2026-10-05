// Shim tương thích: services cũ import "@/lib/offline-queue".
// Logic thật nằm ở shared/infra/cache/offline-queue.ts theo architecture.md.
export * from "@/shared/infra/cache/offline-queue";
