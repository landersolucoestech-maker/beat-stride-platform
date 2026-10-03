import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import type { DashboardPlatformPerformance } from "@/features/dashboard/dashboard.types";

interface StreamsChartProps { platforms: DashboardPlatformPerformance[]; }

export function StreamsChart({ platforms }: StreamsChartProps) {
  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-6"><div><h3 className="font-semibold text-foreground">Streams por Plataforma</h3><p className="text-sm text-muted-foreground">Últimos 30 dias</p></div></div>
      {platforms.length === 0 ? <DashboardEmptyState title="Sem dados por plataforma" description="A distribuição por DSP será exibida quando houver analytics sincronizados." /> : (
        <div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={platforms} layout="vertical" margin={{ left: 0, right: 20 }}><XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} /><YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} width={100} /><Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value: number) => [value.toLocaleString("pt-BR"), "Streams"]} /><Bar dataKey="streams" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} maxBarSize={32} /></BarChart></ResponsiveContainer></div>
      )}
    </div>
  );
}
