import type { ReactNode, SelectHTMLAttributes } from "react";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  size?: "sm" | "md";
  children: ReactNode;
}

const sizes = {
  sm: "px-3.5 py-2.5 text-base sm:text-xs",
  md: "px-4 py-3 text-base sm:text-sm",
};

export default function Select({ label, size = "sm", className = "", children, ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label htmlFor={props.id} className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          {label}
        </label>
      )}
      <select
        className={`mt-1 block w-full rounded-xl border border-neutral-200 bg-neutral-50 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:border-brand-light dark:focus:ring-brand-light/20 ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}