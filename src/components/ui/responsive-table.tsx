/**
 * Responsive Table Component
 * Automatically switches between table view (desktop) and card view (mobile)
 * WCAG 2.1 AA Compliant
 */

import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveTableProps {
  children: React.ReactNode;
  columns: string[];
  isMobile: boolean;
  className?: string;
}

export function ResponsiveTable({
  children,
  columns,
  isMobile,
  className,
}: ResponsiveTableProps) {
  if (isMobile) {
    return (
      <div className={cn("space-y-4", className)} role="table" aria-label="Tabla de datos">
        {children}
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="data-table w-full" role="table">
        {children}
      </table>
    </div>
  );
}

interface ResponsiveTableRowProps {
  children: React.ReactNode;
  isMobile: boolean;
  label?: string;
  className?: string;
}

export function ResponsiveTableRow({
  children,
  isMobile,
  label,
  className,
}: ResponsiveTableRowProps) {
  if (isMobile) {
    return (
      <div
        className={cn(
          "bg-card rounded-lg border border-border p-4 space-y-3",
          className
        )}
        role="row"
        aria-label={label}
      >
        {children}
      </div>
    );
  }

  return (
    <tr className={cn("border-b border-border hover:bg-muted/50", className)} role="row">
      {children}
    </tr>
  );
}

interface ResponsiveTableCellProps {
  children: React.ReactNode;
  label?: string;
  isMobile: boolean;
  className?: string;
}

export function ResponsiveTableCell({
  children,
  label,
  isMobile,
  className,
}: ResponsiveTableCellProps) {
  if (isMobile) {
    return (
      <div className={cn("flex justify-between items-start gap-2", className)} role="cell">
        {label && (
          <span className="font-semibold text-sm text-muted-foreground min-w-max">
            {label}:
          </span>
        )}
        <div className="text-sm text-foreground text-right flex-1">{children}</div>
      </div>
    );
  }

  return (
    <td
      className={cn("py-4 px-4 text-sm text-foreground", className)}
      role="cell"
    >
      {children}
    </td>
  );
}

interface ResponsiveTableHeadProps {
  children: React.ReactNode;
  isMobile: boolean;
  className?: string;
}

export function ResponsiveTableHead({
  children,
  isMobile,
  className,
}: ResponsiveTableHeadProps) {
  if (isMobile) {
    return null; // No mostrar header en móvil
  }

  return (
    <thead
      className={cn("bg-muted/50", className)}
      role="rowgroup"
    >
      {children}
    </thead>
  );
}

interface ResponsiveTableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableHeaderCell({
  children,
  className,
}: ResponsiveTableHeaderCellProps) {
  return (
    <th
      className={cn(
        "text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4",
        className
      )}
      role="columnheader"
      scope="col"
    >
      {children}
    </th>
  );
}
