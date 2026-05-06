import { Wallet, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { walletData } from "@/data/mockData";
import { Link } from "react-router-dom";

export function WalletCard() {
  return (
    <div className="surface-glow p-6 relative">
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-foreground">Minha carteira</h3>
        </div>
        <Link to="/financial/wallet" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          Detalhes <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Premium gold card */}
      <div className="relative overflow-hidden rounded-2xl p-6 mb-5 shadow-elegant"
        style={{ background: "linear-gradient(135deg, hsl(45 95% 60%) 0%, hsl(38 92% 48%) 50%, hsl(28 88% 42%) 100%)" }}>
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-10 w-40 h-40 rounded-full bg-black/10 blur-2xl" />

        <div className="relative flex items-center justify-between mb-8">
          <div className="w-12 h-12 rounded-xl bg-amber-950/20 backdrop-blur flex items-center justify-center ring-1 ring-amber-100/30">
            <span className="font-display text-xl font-bold text-amber-950">L</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-amber-950/70 font-medium">Saldo</span>
        </div>

        <div className="relative">
          <p className="text-xs text-amber-950/70 mb-1">Disponível para saque</p>
          <p className="font-display text-3xl font-bold text-amber-950 tracking-tight">
            R$ {walletData.available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <Link to="/financial/payouts">
        <Button className="w-full gradient-primary text-primary-foreground hover:opacity-90 shadow-elegant border-0">
          Ver painel financeiro
          <ArrowUpRight className="h-4 w-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
}
