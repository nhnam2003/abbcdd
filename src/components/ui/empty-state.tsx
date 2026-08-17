export default function EmptyState({ message }: { message: string }) {
  return <div className="py-16 text-center text-xs text-neutral-500">{message}</div>;
}