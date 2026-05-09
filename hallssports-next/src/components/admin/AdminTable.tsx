"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Column<T> = {
  header: string;
  accessor: ((row: T) => ReactNode) | string;
  className?: string;
};

type AdminTableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  className?: string;
  emptyMessage?: string;
};

export function AdminTable<T extends Record<string, unknown>>({
  columns,
  data,
  className,
  emptyMessage = "No data available",
}: AdminTableProps<T>) {
  return (
    <div className={cn("glass rounded-2xl overflow-hidden", className)}>
      <table className="w-full">
        <thead>
          <tr className="bg-primary/20 border-b border-white/10">
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  "px-4 py-3 text-left text-sm font-semibold text-primary",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b border-white/5 last:border-0",
                  i % 2 === 1 && "bg-white/5",
                )}
              >
                {columns.map((col, j) => {
                  const value =
                    typeof col.accessor === "function"
                      ? col.accessor(row)
                      : String(row[col.accessor as string] || "");
                  return (
                    <td key={j} className={cn("px-4 py-3 text-sm", col.className)}>
                      {value as ReactNode}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}