import Spinner from "./spinner";

export default function Loading({ className = "h-[60vh]" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Spinner />
    </div>
  );
}