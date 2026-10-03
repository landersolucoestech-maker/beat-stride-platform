import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicCharts } from "@/features/statistics/use-statistics";

export default function MusicCharts() {
  const query = useMusicCharts();
  const data = query.data;
  return <MainLayout><div className="space-y-6 animate-fade-in"><div><h1 className="text-2xl font-bold text-foreground">Charts Musicais</h1><p className="text-muted-foreground">Posições observadas nas fontes de charts realmente conectadas.</p></div>
    {!query.isLoading && data?.available === false && <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Nenhum provedor real de charts está conectado ao preview. Rankings fictícios foram removidos.</div>}
    <div className="overflow-hidden rounded-xl border border-border bg-card"><Table><TableHeader><TableRow><TableHead>Chart</TableHead><TableHead>Território</TableHead><TableHead>Faixa</TableHead><TableHead>Artista</TableHead><TableHead>Posição</TableHead><TableHead>Movimento</TableHead><TableHead>Atualizado</TableHead></TableRow></TableHeader><TableBody>{query.isLoading && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Carregando...</TableCell></TableRow>}{!query.isLoading && (data?.items.length ?? 0) === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Nenhuma posição disponível.</TableCell></TableRow>}{data?.items.map((entry) => { const delta = entry.previousPosition === null ? null : entry.previousPosition - entry.position; return <TableRow key={entry.id}><TableCell><Badge variant="outline">{entry.chartName}</Badge></TableCell><TableCell>{entry.territoryCode ?? "Global"}</TableCell><TableCell className="font-medium">{entry.recordingTitle}</TableCell><TableCell>{entry.artistName}</TableCell><TableCell className="font-semibold">#{entry.position}</TableCell><TableCell>{delta === null ? "—" : delta > 0 ? <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" />{delta}</span> : delta < 0 ? <span className="flex items-center gap-1"><ArrowDown className="h-3 w-3" />{Math.abs(delta)}</span> : <Minus className="h-3 w-3" />}</TableCell><TableCell>{new Date(entry.observedAt).toLocaleDateString("pt-BR")}</TableCell></TableRow>; })}</TableBody></Table></div>
  </div></MainLayout>;
}
