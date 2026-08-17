import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger" | "emerald" | "rose";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-1.5 font-semibold transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-brand text-white shadow-sm hover:bg-brand-dark dark:bg-brand dark:text-white dark:hover:bg-brand-dark",
  outline:
    "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800",
  ghost:
    "text-neutral-400 hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white",
  danger:
    "text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400",
  emerald:
    "border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-400",
  rose:
    "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-950 dark:bg-rose-950/20 dark:text-rose-400",
};

const sizes = {
  sm: "rounded-lg px-3 py-1.5 text-xs",
  md: "rounded-xl px-4 py-2 text-xs",
  lg: "rounded-xl px-4 py-2.5 text-xs",
  xl: "rounded-xl px-4 py-3 text-sm",
  icon: "rounded-lg p-1.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}