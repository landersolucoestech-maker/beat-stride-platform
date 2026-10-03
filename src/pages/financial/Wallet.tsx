import { useMemo, useState } from "react";
import { ArrowDownToLine, Clock, ShieldCheck, Wallet as WalletIcon } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinanceOverview, useRequestPayout } from "@/features/finance/use-finance";
import type { PayoutStatus } from "@/features/finance/finance.types";
import { formatMoneyPtBr } from "@/lib/format-money";
import { toast } from "sonner";

const payoutStatusLabels: Record<PayoutStatus, string> = {
  REQUESTED: "Solicitado",
  REVIEWING: "Em análise",
  APPROVED: "Aprovado",
  PROCESSING: "Processando",
  PAID: "Pago",
  FAILED: "Falhou",
  CANCELLED: "Cancelado",
  REVERSED: "Estornado",
};

function isPositiveMoneyInput(value: string): boolean {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) return false;
  const normalized = value.replace(",", ".");
  const [integer = "0", fraction = ""] = normalized.split(".");
  const cents = BigInt(integer) * 100n + BigInt(`${fraction}00`.slice(0, 2));
  return cents > 0n;
}

export default function WalletPage() {
  const overviewQuery = useFinanceOverview();
  const requestPayout = useRequestPayout();
  const [amount, setAmount] = useState("");
  const [payoutAccountId, setPayoutAccountId] = useState("");
  const [open, setOpen] = useState(false);

  const overview = overviewQuery.data;
  const available = overview?.wallet.available ?? null;
  const eligibleAccounts = useMemo(() => overview?.payoutAccounts.filter((account) => account.eligible) ?? [], [overview]);
  const selectedAccount = overview?.payoutAccounts.find((account) => account.id === payoutAccountId) ?? null;
  const dataAvailable = overview?.available === true;

  const handlePayout = async () => {
    if (!available || !selectedAccount || !isPositiveMoneyInput(amount)) {
      toast.error("Informe um valor válido e uma conta de pagamento elegível.");
      return;
    }

    try {
      await requestPayout.mutateAsync({
        amount: amount.replace(",", "."),
        currency: available.currency,
        payoutAccountId: selectedAccount.id,
      });
      toast.success("Solicitação de saque registrada para validação.");
      setAmount("");
      setPayoutAccountId("");
      setOpen(false);
    } catch {
      toast.error("A solicitação não foi concluída. Nenhum saque foi simulado.");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Carteira</h1>
            <p className="text-muted-foreground">Projeção financeira, elegibilidade e histórico de pagamentos.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground" disabled={!dataAvailable || eligibleAccounts.length === 0 || !available}>
                <ArrowDownToLine className="mr-2 h-4 w-4" />Solicitar Saque
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Solicitar Saque</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Saldo disponível</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{available ? formatMoneyPtBr(available.amount, available.currency) : "—"}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payout-amount">Valor</Label>
                  <Input id="payout-amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" />
                </div>
                <div className="space-y-2">
                  <Label>Conta de pagamento</Label>
                  <Select value={payoutAccountId} onValueChange={setPayoutAccountId}>
                    <SelectTrigger><SelectValue placeholder="Selecione uma conta elegível" /></SelectTrigger>
                    <SelectContent>
                      {eligibleAccounts.map((account) => <SelectItem key={account.id} value={account.id}>{account.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Métodos e limites vêm do provedor real e da elegibilidade do beneficiário.</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={() => void handlePayout()} disabled={requestPayout.isPending}>{requestPayout.isPending ? "Enviando..." : "Solicitar"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {!overviewQuery.isLoading && !dataAvailable && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            O preview visual não possui backend financeiro conectado. Nenhum saldo ou pagamento fictício é exibido.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle><WalletIcon className="h-4 w-4 text-primary" /></CardHeader>
            <CardContent><div className="text-3xl font-bold">{available ? formatMoneyPtBr(available.amount, available.currency) : "—"}</div><p className="mt-2 text-xs text-muted-foreground">Valor elegível somente após regras contábeis e de compliance.</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pendente</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-3xl font-bold">{overview?.wallet.pending ? formatMoneyPtBr(overview.wallet.pending.amount, overview.wallet.pending.currency) : "—"}</div><p className="mt-2 text-xs text-muted-foreground">Receita ainda não disponível para pagamento.</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Em retenção</CardTitle><ShieldCheck className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-3xl font-bold">{overview?.wallet.held ? formatMoneyPtBr(overview.wallet.held.amount, overview.wallet.held.currency) : "—"}</div><p className="mt-2 text-xs text-muted-foreground">Valores sujeitos a retenções, risco ou compliance.</p></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Histórico de Pagamentos</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader><TableRow><TableHead>Beneficiário</TableHead><TableHead>Solicitação</TableHead><TableHead>Valor</TableHead><TableHead>Conta</TableHead><TableHead>Status</TableHead><TableHead>Conclusão</TableHead></TableRow></TableHeader>
                <TableBody>
                  {overviewQuery.isLoading && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Carregando...</TableCell></TableRow>}
                  {!overviewQuery.isLoading && (overview?.payouts.length ?? 0) === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum pagamento disponível.</TableCell></TableRow>}
                  {overview?.payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-medium">{payout.beneficiaryName}</TableCell>
                      <TableCell>{new Date(payout.requestedAt).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{formatMoneyPtBr(payout.amount.amount, payout.amount.currency)}</TableCell>
                      <TableCell>{payout.payoutAccountLabel}</TableCell>
                      <TableCell><Badge variant="outline">{payoutStatusLabels[payout.status]}</Badge></TableCell>
                      <TableCell>{payout.completedAt ? new Date(payout.completedAt).toLocaleDateString("pt-BR") : "—"}</TableCell>
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
