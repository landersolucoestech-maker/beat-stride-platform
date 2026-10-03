import { Inbox } from "lucide-react";

interface DashboardEmptyStateProps {
  title: string;
  description: string;
  compact?: boolean;
}

export function DashboardEmptyState({ title, description, compact = false }: DashboardEmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-8" : "py-12"}`}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Inbox className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
