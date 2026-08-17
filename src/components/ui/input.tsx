import type { InputHTMLAttributes } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  size?: "sm" | "md";
}

const sizes = {
  sm: "px-3.5 py-2.5 text-base sm:text-xs",
  md: "px-4 py-3 text-base sm:text-sm",
};

export default function Input({ label, size = "sm", className = "", ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={props.id} className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          {label}
        </label>
      )}
      <input
        className={`mt-1 block w-full rounded-xl border border-neutral-200 bg-neutral-50 placeholder-neutral-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder-neutral-600 dark:focus:border-brand-light dark:focus:bg-neutral-900 dark:focus:ring-brand-light/20 ${sizes[size]} ${className}`}
        {...props}
      />
    </div>
  );
}