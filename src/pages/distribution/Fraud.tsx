import { AlertTriangle, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRiskOverview } from "@/features/risk/use-risk-overview";
import { formatDecimalPtBr } from "@/lib/format-money";

export default function FraudPage() {
  const riskQuery = useRiskOverview();
  const data = riskQuery.data;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div><h1 className="text-3xl font-bold tracking-tight">Anti-Fraude</h1><p className="text-muted-foreground">Detecção, investigação e evidência de padrões suspeitos de consumo.</p></div>

        {!riskQuery.isLoading && data?.available === false && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">O preview não possui sinais reais de risco conectados. Nenhum alerta, stream suspeito ou incidente é fabricado.</div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Em aberto</CardTitle><ShieldAlert className="h-4 w-4 text-destructive" /></CardHeader><CardContent><div className="text-2xl font-bold">{data?.openCount ?? "—"}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Em investigação</CardTitle><AlertTriangle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data?.investigatingCount ?? "—"}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Confirmados</CardTitle><ShieldX className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data?.confirmedCount ?? "—"}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Usos suspeitos</CardTitle><ShieldCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data?.suspiciousUsageCount ? formatDecimalPtBr(data.suspiciousUsageCount, 0) : "—"}</div></CardContent></Card>
        </div>

        <Card><CardHeader><CardTitle>Alertas</CardTitle></CardHeader><CardContent><div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>Detectado</TableHead><TableHead>Gravação</TableHead><TableHead>Artista</TableHead><TableHead>Destino</TableHead><TableHead>Motivo</TableHead><TableHead className="text-right">Usos</TableHead><TableHead>Severidade</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
          {riskQuery.isLoading && <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">Carregando...</TableCell></TableRow>}
          {!riskQuery.isLoading && (data?.alerts.length ?? 0) === 0 && <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">Nenhum alerta disponível.</TableCell></TableRow>}
          {data?.alerts.map((alert) => <TableRow key={alert.id}><TableCell className="text-xs text-muted-foreground">{new Date(alert.detectedAt).toLocaleDateString("pt-BR")}</TableCell><TableCell className="font-medium">{alert.recordingTitle}</TableCell><TableCell>{alert.artistName}</TableCell><TableCell>{alert.destinationLabel}</TableCell><TableCell className="max-w-xs truncate text-sm text-muted-foreground">{alert.reason}</TableCell><TableCell className="text-right">{alert.suspiciousUsageCount ? formatDecimalPtBr(alert.suspiciousUsageCount, 0) : "—"}</TableCell><TableCell><Badge variant="outline">{alert.severity}</Badge></TableCell><TableCell><Badge variant="outline">{alert.status}</Badge></TableCell></TableRow>)}
        </TableBody></Table></div></CardContent></Card>
      </div>
    </MainLayout>
  );
}
