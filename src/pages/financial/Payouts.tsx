import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { payouts, walletData } from "@/data/mockData";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Wallet } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Payouts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");

  const handleRequestPayout = () => {
    toast({
      title: "Solicitação enviada!",
      description: `Seu saque de R$ ${amount} via ${method} foi solicitado.`,
    });
    setIsDialogOpen(false);
    setAmount("");
    setMethod("");
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pagamentos</h1>
            <p className="text-muted-foreground">Gerencie seus saques e histórico de pagamentos</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Solicitar Saque
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitar Saque</DialogTitle>
                <DialogDescription>
                  Preencha os dados para solicitar um novo saque.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Saldo disponível</p>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {walletData.available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="amount">Valor do saque</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Método de pagamento</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleRequestPayout}
                  disabled={!amount || !method}
                  className="gradient-primary text-primary-foreground"
                >
                  Confirmar Saque
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Balance card */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl gradient-primary p-6 text-primary-foreground">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="h-5 w-5" />
              <span className="text-sm opacity-80">Saldo Disponível</span>
            </div>
            <p className="text-3xl font-bold">
              R$ {walletData.available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="rounded-xl bg-card border border-border p-6">
            <p className="text-sm text-muted-foreground">Pendente</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              R$ {walletData.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="rounded-xl bg-card border border-border p-6">
            <p className="text-sm text-muted-foreground">Último Saque</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              R$ {walletData.lastPayout.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(walletData.lastPayoutDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Histórico de Pagamentos</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Artista</th>
                  <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Valor</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Método</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 text-foreground font-medium">{payout.artistName}</td>
                    <td className="px-4 py-4 text-right text-foreground">
                      R$ {payout.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground capitalize">
                      {payout.method === 'bank_transfer' ? 'Transferência' : payout.method.toUpperCase()}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={payout.status} />
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {new Date(payout.date).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
