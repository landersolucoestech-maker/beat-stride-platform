import { cn } from "@/lib/utils";

type StatusType = 'draft' | 'review' | 'scheduled' | 'live' | 'rejected' | 'pending' | 'processing' | 'completed' | 'failed' | 'open' | 'in_progress' | 'resolved' | 'closed';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  draft: { label: 'Rascunho', className: 'bg-muted text-muted-foreground' },
  review: { label: 'Em Revisão', className: 'bg-warning/20 text-warning' },
  scheduled: { label: 'Agendado', className: 'bg-primary/20 text-primary' },
  live: { label: 'Ativo', className: 'bg-success/20 text-success' },
  rejected: { label: 'Rejeitado', className: 'bg-destructive/20 text-destructive' },
  pending: { label: 'Pendente', className: 'bg-warning/20 text-warning' },
  processing: { label: 'Processando', className: 'bg-primary/20 text-primary' },
  completed: { label: 'Concluído', className: 'bg-success/20 text-success' },
  failed: { label: 'Falhou', className: 'bg-destructive/20 text-destructive' },
  open: { label: 'Aberto', className: 'bg-warning/20 text-warning' },
  in_progress: { label: 'Em Andamento', className: 'bg-primary/20 text-primary' },
  resolved: { label: 'Resolvido', className: 'bg-success/20 text-success' },
  closed: { label: 'Fechado', className: 'bg-muted text-muted-foreground' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
