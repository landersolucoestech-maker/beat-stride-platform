import { MainLayout } from "@/components/layout/MainLayout";
import { useDemographics } from "@/features/statistics/use-statistics";
import { formatDecimalPtBr } from "@/lib/format-money";

function DistributionList({ title, items, percentage }: { title: string; items: Array<{ label: string; value: string }>; percentage?: boolean }) {
  const max = Math.max(...items.map((item) => Number(item.value)), 1);
  return <section className="rounded-xl border border-border bg-card p-6"><h3 className="mb-4 font-semibold text-foreground">{title}</h3>{items.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">Sem dados disponíveis.</div> : <div className="space-y-4">{items.map((item, index) => <div key={item.label} className="flex items-center gap-4"><span className="w-6 text-center text-sm font-medium text-muted-foreground">{index + 1}</span><div className="flex-1"><div className="mb-1 flex items-center justify-between gap-3"><span className="font-medium text-foreground">{item.label}</span><span className="text-sm text-muted-foreground">{formatDecimalPtBr(item.value, percentage ? 2 : 0)}{percentage ? "%" : ""}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="gradient-primary h-full rounded-full" style={{ width: `${Math.min(100, Number(item.value) / max * 100)}%` }} /></div></div></div>)}</div>}</section>;
}

export default function Demographics() {
  const query = useDemographics();
  const data = query.data;
  return <MainLayout><div className="space-y-6 animate-fade-in"><div><h1 className="text-2xl font-bold text-foreground">Dados Demográficos</h1><p className="text-muted-foreground">Audiência reportada pelas fontes de analytics disponíveis.</p></div>
    {!query.isLoading && data?.available === false && <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">O preview não possui dados demográficos reais conectados. Percentuais, países e cidades fictícios foram removidos.</div>}
    <div className="grid gap-6 lg:grid-cols-2"><DistributionList title="Distribuição por Idade" items={(data?.age ?? []).map((item) => ({ label: item.label, value: item.percentage }))} percentage /><DistributionList title="Distribuição por Gênero" items={(data?.gender ?? []).map((item) => ({ label: item.label, value: item.percentage }))} percentage /><DistributionList title="Top Países" items={(data?.countries ?? []).map((item) => ({ label: item.label, value: item.metricValue }))} /><DistributionList title="Top Cidades" items={(data?.cities ?? []).map((item) => ({ label: item.label, value: item.metricValue }))} /></div>
  </div></MainLayout>;
}
