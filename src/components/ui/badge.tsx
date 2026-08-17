import type { ReactNode } from "react";

interface BadgeProps {
  variant?: "emerald" | "rose" | "amber" | "neutral";
  children: ReactNode;
}

const variants = {
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  neutral: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
};

export default function Badge({ variant = "neutral", children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold ${variants[variant]}`}>
      {children}
    </span>
  );
}