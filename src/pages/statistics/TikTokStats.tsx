import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTikTokStatistics } from "@/features/statistics/use-statistics";
import { formatDecimalPtBr } from "@/lib/format-money";

export default function TikTokStats() {
  const query = useTikTokStatistics();
  const data = query.data;
  const metrics = [
    ["Visualizações", data?.views],
    ["Criações de vídeos", data?.videoCreations],
    ["Curtidas", data?.likes],
    ["Compartilhamentos", data?.shares],
  ] as const;

  return <MainLayout><div className="space-y-6 animate-fade-in"><div><h1 className="text-2xl font-bold text-foreground">TikTok Stats</h1><p className="text-muted-foreground">Métricas recebidas da fonte de analytics conectada.</p></div>
    {!query.isLoading && data?.available === false && <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">A integração real de analytics do TikTok ainda não está conectada. Nenhum número de demonstração é exibido.</div>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label, value]) => <Card key={label}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{label}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{value ? formatDecimalPtBr(value, 0) : "—"}</p></CardContent></Card>)}</div>
    <Card><CardHeader><CardTitle>Faixas com atividade</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Faixa</TableHead><TableHead className="text-right">Visualizações</TableHead><TableHead className="text-right">Criações</TableHead></TableRow></TableHeader><TableBody>{(data?.topTracks.length ?? 0) === 0 && <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">Nenhum dado disponível.</TableCell></TableRow>}{data?.topTracks.map((track) => <TableRow key={track.recordingId}><TableCell className="font-medium">{track.title}</TableCell><TableCell className="text-right">{formatDecimalPtBr(track.views, 0)}</TableCell><TableCell className="text-right">{formatDecimalPtBr(track.creations, 0)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
  </div></MainLayout>;
}
