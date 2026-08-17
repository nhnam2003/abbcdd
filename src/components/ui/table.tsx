import type { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
}

interface TableHeadProps {
  columns: { label: string; align?: "left" | "center" | "right" }[];
}

interface TableRowProps {
  children: ReactNode;
}

interface TableCellProps {
  children?: ReactNode;
  className?: string;
}

const alignMap = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-xs">{children}</table>
      </div>
    </div>
  );
}

export function TableHead({ columns }: TableHeadProps) {
  return (
    <thead>
      <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/25">
        {columns.map((col) => (
          <th key={col.label} className={`whitespace-nowrap px-4 py-4 sm:px-6 ${alignMap[col.align ?? "left"]}`}>
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TableRow({ children }: TableRowProps) {
  return (
    <tr className="border-t border-neutral-100 hover:bg-neutral-50/30 dark:border-neutral-800 dark:hover:bg-neutral-950/10">
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return <td className={`whitespace-nowrap px-4 py-4 sm:px-6 sm:py-5 ${className}`}>{children}</td>;
}