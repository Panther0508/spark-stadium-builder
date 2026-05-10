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
  if (data.length === 0) {
    return (
      <div className={cn("glass rounded-2xl p-8 text-center", className)}>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Desktop Table */}
      <div className="hidden md:block glass rounded-2xl overflow-hidden">
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
            {data.map((row, i) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {data.map((row, i) => (
          <div key={i} className="glass rounded-xl p-4 border border-white/10">
            <div className="space-y-2">
              {columns.map((col, j) => {
                const value =
                  typeof col.accessor === "function"
                    ? col.accessor(row)
                    : String(row[col.accessor as string] || "");
                return (
                  <div key={j} className="flex flex-col gap-1">
                    <span className="text-xs text-primary font-semibold">{col.header}</span>
                    <span className="text-sm">{value as ReactNode}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}