"use client";

import { type ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

type AdminFormFieldProps = {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export const AdminFormField = forwardRef<HTMLDivElement, AdminFormFieldProps>(
  function AdminFormField({ label, error, required, children, className }, ref) {
    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5", className)}>
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        {children}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    );
  },
);