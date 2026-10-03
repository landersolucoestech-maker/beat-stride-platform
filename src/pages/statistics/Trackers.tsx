import { Activity, PauseCircle } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTrackers } from "@/features/statistics/use-statistics";
import { formatDecimalPtBr } from "@/lib/format-money";

export default function Trackers() {
  const query = useTrackers();
  const data = query.data;
  return <MainLayout><div className="space-y-6 animate-fade-in"><div><h1 className="text-2xl font-bold text-foreground">Rastreadores</h1><p className="text-muted-foreground">Acompanhe métricas específicas do catálogo com fontes verificadas.</p></div>
    {!query.isLoading && data?.available === false && <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">O preview não possui rastreadores reais conectados. Metas e resultados fictícios foram removidos.</div>}
    <div className="overflow-hidden rounded-xl border border-border bg-card"><Table><TableHeader><TableRow><TableHead>Rastreador</TableHead><TableHead>Recurso</TableHead><TableHead>Métrica</TableHead><TableHead className="text-right">Valor atual</TableHead><TableHead>Status</TableHead><TableHead>Atualizado</TableHead></TableRow></TableHeader><TableBody>{query.isLoading && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Carregando...</TableCell></TableRow>}{!query.isLoading && (data?.items.length ?? 0) === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground"><Activity className="mx-auto mb-2 h-5 w-5" />Nenhum rastreador disponível.</TableCell></TableRow>}{data?.items.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.label}</TableCell><TableCell>{item.resourceTitle}</TableCell><TableCell>{item.metricType}</TableCell><TableCell className="text-right">{item.currentValue ? formatDecimalPtBr(item.currentValue, 0) : "—"}</TableCell><TableCell><Badge variant="outline">{item.status === "ACTIVE" ? "Ativo" : item.status === "PAUSED" ? <span className="flex items-center gap-1"><PauseCircle className="h-3 w-3" />Pausado</span> : "Erro"}</Badge></TableCell><TableCell>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("pt-BR") : "—"}</TableCell></TableRow>)}</TableBody></Table></div>
  </div></MainLayout>;
}
