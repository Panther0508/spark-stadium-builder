"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  function GlassInput({ label, error, className, containerClassName, ...props }, ref) {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20",
            "text-white placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
            "transition-all duration-200",
            error && "border-destructive focus:ring-destructive/50",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  function GlassTextarea({ label, error, className, ...props }, ref) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-muted-foreground">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20",
            "text-white placeholder:text-muted-foreground resize-none",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
            "transition-all duration-200",
            error && "border-destructive focus:ring-destructive/50",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

interface GlassCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function GlassCheckbox({ checked, onChange, label }: GlassCheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded bg-white/5 border border-white/30 
                   checked:bg-primary checked:border-primary
                   focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </label>
  );
}

interface GlassToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function GlassToggle({ checked, onChange, label }: GlassToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full",
          "bg-white/20 transition-colors",
          checked && "bg-primary"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white",
            "transform transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </label>
  );
}