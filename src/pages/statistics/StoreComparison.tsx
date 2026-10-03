import { MainLayout } from "@/components/layout/MainLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStoreComparison } from "@/features/statistics/use-statistics";
import { formatDecimalPtBr } from "@/lib/format-money";

export default function StoreComparison() {
  const query = useStoreComparison();
  const data = query.data;
  return <MainLayout><div className="space-y-6 animate-fade-in"><div><h1 className="text-2xl font-bold text-foreground">Comparação de Lojas</h1><p className="text-muted-foreground">Compare métricas reportadas pelos destinos conectados.</p></div>
    {!query.isLoading && data?.available === false && <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">O preview não possui métricas reais por DSP. Nenhuma loja, stream ou ouvinte fictício é exibido.</div>}
    <div className="overflow-hidden rounded-xl border border-border bg-card"><Table><TableHeader><TableRow><TableHead>Destino</TableHead><TableHead className="text-right">Streams</TableHead><TableHead className="text-right">Saves</TableHead><TableHead className="text-right">Ouvintes</TableHead></TableRow></TableHeader><TableBody>{query.isLoading && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Carregando...</TableCell></TableRow>}{!query.isLoading && (data?.items.length ?? 0) === 0 && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Nenhum dado disponível.</TableCell></TableRow>}{data?.items.map((item) => <TableRow key={item.destinationCode}><TableCell className="font-medium">{item.destinationLabel}</TableCell><TableCell className="text-right">{item.streams ? formatDecimalPtBr(item.streams, 0) : "—"}</TableCell><TableCell className="text-right">{item.saves ? formatDecimalPtBr(item.saves, 0) : "—"}</TableCell><TableCell className="text-right">{item.listeners ? formatDecimalPtBr(item.listeners, 0) : "—"}</TableCell></TableRow>)}</TableBody></Table></div>
  </div></MainLayout>;
}
