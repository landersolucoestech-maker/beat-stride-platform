import { Music, TrendingUp } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";

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
    <div className="rounded-xl bg-card border border-border p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Music className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Total Streams</h3>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-foreground">1.245.678</p>
          <p className="text-sm text-muted-foreground">streams totais</p>
        </div>
      </div>

      {/* Mini Bar Chart */}
      <div className="h-16 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <Bar 
              dataKey="streams" 
              fill="hsl(var(--primary))" 
              radius={[3, 3, 0, 0]}
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Este mês</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-foreground">156.432</span>
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Mês anterior</span>
          <span className="text-sm font-medium text-foreground">134.521</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Crescimento</span>
          <span className="text-sm font-medium text-emerald-500">+16.3%</span>
        </div>
      </div>
    </div>
  );
}
