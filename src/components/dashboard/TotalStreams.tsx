import { TrendingUp } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";

const monthlyData = [
  { month: 'Jul', streams: 89000 },
  { month: 'Ago', streams: 102000 },
  { month: 'Set', streams: 98000 },
  { month: 'Out', streams: 115000 },
  { month: 'Nov', streams: 134521 },
  { month: 'Dez', streams: 156432 },
];

export function TotalStreams() {
  return (
    <div className="surface-glow p-6 flex flex-col justify-between h-full">
      <div className="relative">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Total streams</p>
        <p className="font-display text-4xl font-bold text-gradient tracking-tight">1.245.678</p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
            <TrendingUp className="h-3 w-3" /> +16.3%
          </span>
          <span className="text-xs text-muted-foreground">vs. mês anterior</span>
        </div>
      </div>

      <div className="h-20 mt-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <Bar dataKey="streams" radius={[4, 4, 0, 0]}>
              {monthlyData.map((_, i) => (
                <Cell key={i} fill={i === monthlyData.length - 1 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Este mês</p>
          <p className="font-display font-semibold text-foreground">156.432</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Anterior</p>
          <p className="font-display font-semibold text-foreground">134.521</p>
        </div>
      </div>
    </div>
  );
}
