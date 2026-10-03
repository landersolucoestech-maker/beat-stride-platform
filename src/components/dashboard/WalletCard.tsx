import { Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

interface WalletCardProps {
  availableAmount: string | null;
  currency: string;
}

function formatMoney(amount: string | null, currency: string): string {
  if (amount === null) return "—";

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return "—";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(numericAmount);
}

export function WalletCard({ availableAmount, currency }: WalletCardProps) {
  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Wallet className="h-5 w-5 text-foreground" />
        <h3 className="font-semibold text-foreground">Minha carteira</h3>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 p-5 mb-6">
        <div className="w-12 h-12 rounded-full bg-amber-600/30 flex items-center justify-center mb-4">
          <span className="text-xl font-bold text-amber-900">L</span>
        </div>
        <p className="text-sm text-amber-900/80 mb-1">Valor disponível para saque</p>
        <p className="text-2xl font-bold text-amber-900">{formatMoney(availableAmount, currency)}</p>
      </div>

      <Link to="/financial/wallet">
        <Button variant="outline" className="w-full justify-center border-primary text-primary hover:bg-primary/10">
          Ver meu painel financeiro
        </Button>
      </Link>
    </div>
  );
}
