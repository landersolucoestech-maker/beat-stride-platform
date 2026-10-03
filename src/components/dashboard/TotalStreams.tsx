import { Music } from "lucide-react";

interface TotalStreamsProps {
  total: number | null;
  currentMonth: number | null;
  previousMonth: number | null;
}

function number(value: number | null): string {
  return value === null ? "—" : value.toLocaleString("pt-BR");
}

export function TotalStreams({ total, currentMonth, previousMonth }: TotalStreamsProps) {
  const growth = currentMonth !== null && previousMonth !== null && previousMonth > 0
    ? ((currentMonth - previousMonth) / previousMonth) * 100
    : null;

  return (
    <div className="rounded-xl bg-card border border-border p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Music className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Total Streams</h3>
        </div>
        <p className="text-3xl font-bold text-foreground">{number(total)}</p>
        <p className="text-sm text-muted-foreground">streams totais</p>
      </div>
      <div className="mt-6 h-16 rounded-lg bg-muted/50 flex items-end gap-1 px-3 py-2" aria-hidden="true">
        {[35, 50, 42, 62, 54, 70, 64, 78, 68, 82, 75, 88].map((height, index) => (
          <span key={index} className="flex-1 rounded-sm bg-primary/15" style={{ height: `${height}%` }} />
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Este mês</span><span className="text-sm font-medium text-foreground">{number(currentMonth)}</span></div>
        <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Mês anterior</span><span className="text-sm font-medium text-foreground">{number(previousMonth)}</span></div>
        <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Crescimento</span><span className="text-sm font-medium text-muted-foreground">{growth === null ? "—" : `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`}</span></div>
      </div>
    </div>
  );
}
