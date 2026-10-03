import { AlertTriangle, CheckCircle2, FileSearch, Scale } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAccountingOverview } from "@/features/accounting/use-accounting-overview";
import { formatMoneyPtBr } from "@/lib/format-money";

export default function Payouts() {
  const overviewQuery = useAccountingOverview();
  const overview = overviewQuery.data;
  const available = overview?.available === true;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contabilidade</h1>
          <p className="text-muted-foreground">Reconciliação, ledger e integridade dos lançamentos financeiros.</p>
        </div>

        {!overviewQuery.isLoading && !available && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            O preview visual não está conectado ao backend contábil. Nenhum saldo, exceção ou lançamento fictício é criado.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Ledger</CardTitle><Scale className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><p className="text-2xl font-bold">{overview?.ledgerBalanced === null || overview?.ledgerBalanced === undefined ? "—" : overview.ledgerBalanced ? "Balanceado" : "Divergência"}</p><p className="mt-1 text-xs text-muted-foreground">Débitos e créditos devem permanecer balanceados.</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Exceções de reconciliação</CardTitle><AlertTriangle className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><p className="text-2xl font-bold">{overview?.openReconciliationExceptions ?? "—"}</p><p className="mt-1 text-xs text-muted-foreground">Itens que exigem revisão antes do fechamento.</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Receita não conciliada</CardTitle><FileSearch className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><p className="text-2xl font-bold">{overview?.unmatchedRoyaltyLines ?? "—"}</p><p className="mt-1 text-xs text-muted-foreground">Linhas preservadas até o matching ser resolvido.</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Último período fechado</CardTitle><CheckCircle2 className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><p className="text-2xl font-bold">{overview?.lastClosedPeriod ?? "—"}</p><p className="mt-1 text-xs text-muted-foreground">Períodos fechados não são reescritos.</p></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Lançamentos recentes no ledger</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Referência</TableHead><TableHead>Descrição</TableHead><TableHead>Débito</TableHead><TableHead>Crédito</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
                <TableBody>
                  {overviewQuery.isLoading && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Carregando...</TableCell></TableRow>}
                  {!overviewQuery.isLoading && (overview?.recentPostings.length ?? 0) === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum lançamento contábil disponível.</TableCell></TableRow>}
                  {overview?.recentPostings.map((posting) => (
                    <TableRow key={posting.id}>
                      <TableCell>{new Date(posting.occurredAt).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell><Badge variant="outline">{posting.reference}</Badge></TableCell>
                      <TableCell className="font-medium">{posting.description}</TableCell>
                      <TableCell>{posting.debitAccount}</TableCell>
                      <TableCell>{posting.creditAccount}</TableCell>
                      <TableCell className="text-right">{formatMoneyPtBr(posting.amount, posting.currency)}</TableCell>
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
