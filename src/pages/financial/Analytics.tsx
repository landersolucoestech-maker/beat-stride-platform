import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { MainLayout } from "@/components/layout/MainLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancialAnalytics } from "@/features/finance/use-finance";
import { formatDecimalPtBr, formatMoneyPtBr } from "@/lib/format-money";

export default function FinancialAnalytics() {
  const [period, setPeriod] = useState<string | undefined>(undefined);
  const analyticsQuery = useFinancialAnalytics(period);
  const data = analyticsQuery.data;

  useEffect(() => {
    if (!period && data?.period) setPeriod(data.period);
  }, [data?.period, period]);

  const chartData = useMemo(
    () => (data?.providers ?? []).map((provider) => ({
      name: provider.label,
      usage: Number(provider.usageCount),
      net: Number(provider.netAmount),
    })),
    [data?.providers],
  );

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Análises Mensais</h1>
            <p className="text-muted-foreground">Visão financeira derivada dos statements processados e conciliados.</p>
          </div>
          <Select value={period} onValueChange={setPeriod} disabled={!data?.available || (data.periods.length ?? 0) === 0}>
            <SelectTrigger className="w-full sm:w-[190px]"><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent>{data?.periods.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {!analyticsQuery.isLoading && data?.available === false && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            O preview não possui dados financeiros reais conectados. Nenhum stream ou valor de receita é fabricado para preencher os gráficos.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">Usos reportados</p><p className="mt-1 text-2xl font-bold text-foreground">{data?.totalUsage ? formatDecimalPtBr(data.totalUsage, 0) : "—"}</p></div>
          <div className="rounded-xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">Receita Bruta</p><p className="mt-1 text-2xl font-bold text-foreground">{data?.grossAmount && data.currency ? formatMoneyPtBr(data.grossAmount, data.currency) : "—"}</p></div>
          <div className="rounded-xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">Receita Líquida</p><p className="mt-1 text-2xl font-bold text-success">{data?.netAmount && data.currency ? formatMoneyPtBr(data.netAmount, data.currency) : "—"}</p></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">Uso por provider</h3>
            {chartData.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">Sem dados para o período.</div>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">Receita líquida por provider</h3>
            {chartData.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">Sem dados para o período.</div>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="net" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border bg-muted/50"><th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Provider</th><th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Usos</th><th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Bruto</th><th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Líquido</th></tr></thead>
              <tbody className="divide-y divide-border">
                {(data?.providers.length ?? 0) === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum dado financeiro disponível.</td></tr>}
                {data?.providers.map((provider) => (
                  <tr key={provider.code} className="transition-colors hover:bg-muted/30"><td className="px-4 py-4 font-medium text-foreground">{provider.label}</td><td className="px-4 py-4 text-right">{formatDecimalPtBr(provider.usageCount, 0)}</td><td className="px-4 py-4 text-right">{data.currency ? formatMoneyPtBr(provider.grossAmount, data.currency) : provider.grossAmount}</td><td className="px-4 py-4 text-right font-medium text-success">{data.currency ? formatMoneyPtBr(provider.netAmount, data.currency) : provider.netAmount}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
