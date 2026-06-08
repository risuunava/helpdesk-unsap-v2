import React from "react";
import { FolderSimplePlus, MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-border/40 bg-card/10",
        className
      )}
    >
      <div className="mb-4 rounded-full bg-muted/20 p-6">
        {icon || <MagnifyingGlass size={48} className="text-muted-foreground/60" />}
      </div>
      <h3 className="text-xl font-serif font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="flex items-center gap-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function NoTicketsState({ onCreateClick }: { onCreateClick?: () => void }) {
  return (
    <EmptyState
      icon={<FolderSimplePlus size={48} className="text-muted-foreground/60" />}
      title="Belum Ada Laporan"
      description="Anda belum memiliki laporan yang terdaftar. Klik tombol di bawah untuk mulai membuat laporan pertama Anda."
      action={
        onCreateClick
          ? {
              label: "Buat Laporan Baru",
              onClick: onCreateClick,
            }
          : undefined
      }
    />
  );
}
