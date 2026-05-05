import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFraudAlerts } from "@/hooks/useCore";
import { AlertTriangle, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

const severityStyle: Record<string, string> = {
  low: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  medium: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  high: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  critical: "bg-red-500/15 text-red-700 dark:text-red-400",
};

const statusStyle: Record<string, string> = {
  open: "bg-red-500/15 text-red-700 dark:text-red-400",
  investigating: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  confirmed: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  dismissed: "bg-muted text-muted-foreground",
};

export default function FraudPage() {
  const { data: alerts } = useFraudAlerts();
  const open = alerts?.filter(a => a.status === "open").length ?? 0;
  const investigating = alerts?.filter(a => a.status === "investigating").length ?? 0;
  const confirmed = alerts?.filter(a => a.status === "confirmed").length ?? 0;
  const totalSuspicious = alerts?.reduce((s, a) => s + a.suspiciousStreams, 0) ?? 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Anti-Fraude</h1>
          <p className="text-muted-foreground">Detecção de streams artificiais e padrões suspeitos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Em aberto</CardTitle>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{open}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Em investigação</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{investigating}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Confirmadas</CardTitle>
              <ShieldX className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{confirmed}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Streams suspeitos</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalSuspicious.toLocaleString("pt-BR")}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Alertas</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Detectado</TableHead>
                    <TableHead>Faixa</TableHead>
                    <TableHead>Artista</TableHead>
                    <TableHead>DSP</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead className="text-right">Streams</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts?.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs text-muted-foreground">{new Date(a.detectedAt).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="font-medium">{a.trackTitle}</TableCell>
                      <TableCell>{a.artistName}</TableCell>
                      <TableCell>{a.dsp}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{a.reason}</TableCell>
                      <TableCell className="text-right">{a.suspiciousStreams.toLocaleString("pt-BR")}</TableCell>
                      <TableCell><Badge className={severityStyle[a.severity]}>{a.severity}</Badge></TableCell>
                      <TableCell><Badge className={statusStyle[a.status]}>{a.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost">Investigar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
