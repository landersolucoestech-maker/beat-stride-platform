import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useArtists, useWallet, useWithdrawals } from "@/hooks/useCore";
import { container } from "@/core/container";
import { Wallet as WalletIcon, ArrowDownToLine, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  processing: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  completed: "bg-green-500/15 text-green-700 dark:text-green-400",
  failed: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export default function WalletPage() {
  const { data: artists } = useArtists();
  const [selectedArtistId, setSelectedArtistId] = useState("artist-1");
  const { data: wallet, reload: reloadWallet } = useWallet(selectedArtistId);
  const { data: withdrawals, reload: reloadWithdrawals } = useWithdrawals();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"pix" | "bank_transfer" | "paypal" | "wise">("pix");
  const [open, setOpen] = useState(false);

  const selectedArtist = artists?.find(a => a.id === selectedArtistId);

  const handleWithdraw = async () => {
    if (!selectedArtist) return;
    const value = Number(amount);
    if (!value || value <= 0) { toast.error("Valor inválido"); return; }
    try {
      await container.useCases.requestWithdrawal.execute({
        artistId: selectedArtist.id, artistName: selectedArtist.name,
        amount: value, currency: "BRL", method,
      });
      toast.success("Retirada solicitada");
      setAmount(""); setOpen(false);
      reloadWallet(); reloadWithdrawals();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao solicitar retirada");
    }
  };

  const filtered = withdrawals?.filter(w => w.artistId === selectedArtistId) ?? [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Carteira</h1>
            <p className="text-muted-foreground">Saldo, retiradas e histórico financeiro do artista.</p>
          </div>
          <Select value={selectedArtistId} onValueChange={setSelectedArtistId}>
            <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {artists?.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-600/5 border-yellow-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
              <WalletIcon className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ {wallet?.available.toFixed(2) ?? "0,00"}</div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="mt-3" disabled={!wallet}>
                    <ArrowDownToLine className="h-4 w-4 mr-2" /> Solicitar Retirada
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Nova Retirada</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Valor (R$)</Label>
                      <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
                      <p className="text-xs text-muted-foreground">Disponível: R$ {wallet?.available.toFixed(2)}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Método</Label>
                      <Select value={method} onValueChange={(v) => setMethod(v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="wise">Wise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleWithdraw}>Confirmar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ {wallet?.pending.toFixed(2) ?? "0,00"}</div>
              <p className="text-xs text-muted-foreground mt-2">Liberação em até 45 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ {wallet?.lifetimeEarnings.toFixed(2) ?? "0,00"}</div>
              <p className="text-xs text-muted-foreground mt-2">Histórico desde o início</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Histórico de Retiradas</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Concluído em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma retirada para este artista</TableCell></TableRow>
                  )}
                  {filtered.map(w => (
                    <TableRow key={w.id}>
                      <TableCell>{new Date(w.requestedAt).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="font-medium">R$ {w.amount.toFixed(2)}</TableCell>
                      <TableCell className="uppercase text-xs">{w.method}</TableCell>
                      <TableCell><Badge className={statusColors[w.status]}>{w.status}</Badge></TableCell>
                      <TableCell>{w.completedAt ? new Date(w.completedAt).toLocaleDateString("pt-BR") : "—"}</TableCell>
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
