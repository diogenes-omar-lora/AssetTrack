/**
 * Accessible Form Input Component
 * WCAG 2.1 AA Compliant
 * Ensures proper label association and focus management
 */

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AccessibleFormFieldProps {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
  autoComplete?: string;
}

export function AccessibleFormField({
  label,
  id,
  error,
  required,
  helperText,
  type = "text",
  placeholder,
  value,
  onChange,
  className,
  minLength,
  maxLength,
  disabled,
  autoComplete,
}: AccessibleFormFieldProps) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="requerido">
            *
          </span>
        )}
      </Label>

      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          "min-h-11 text-base",
          error && "border-destructive focus:ring-destructive",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />

      {helperText && !error && (
        <p
          id={helperId}
          className="text-xs text-muted-foreground"
          role="note"
        >
          {helperText}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="text-xs text-destructive font-medium"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface AccessibleSelectProps {
  label: string;
  id: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export function AccessibleSelect({
  label,
  id,
  options,
  value,
  onChange,
  error,
  required,
  helperText,
  disabled,
  className,
}: AccessibleSelectProps) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="requerido">
            *
          </span>
        )}
      </Label>

      <select
        id={id}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          "w-full h-11 px-3 rounded-md border border-input bg-background text-foreground text-base",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-destructive focus:ring-destructive"
        )}
      >
        <option value="">Seleccione una opción</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {helperText && !error && (
        <p id={helperId} className="text-xs text-muted-foreground" role="note">
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-xs text-destructive font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface AccessibleCheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export function AccessibleCheckbox({
  id,
  label,
  checked,
  onChange,
  error,
  helperText,
  disabled,
  className,
}: AccessibleCheckboxProps) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className="w-5 h-5 rounded border border-input focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
        />
        <Label htmlFor={id} className="text-sm font-medium text-foreground cursor-pointer">
          {label}
        </Label>
      </div>

      {helperText && !error && (
        <p id={helperId} className="text-xs text-muted-foreground ml-8" role="note">
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-xs text-destructive font-medium ml-8" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
