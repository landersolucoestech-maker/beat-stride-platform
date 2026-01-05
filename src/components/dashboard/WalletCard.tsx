import { Wallet, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { walletData } from "@/data/mockData";
import { Link } from "react-router-dom";

export function WalletCard() {
  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Wallet className="h-5 w-5 text-foreground" />
        <h3 className="font-semibold text-foreground">Minha carteira</h3>
      </div>
      
      {/* Yellow/Gold Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 p-5 mb-6">
        <div className="w-12 h-12 rounded-full bg-amber-600/30 flex items-center justify-center mb-4">
          <span className="text-xl font-bold text-amber-900">L</span>
        </div>
        
        <p className="text-sm text-amber-900/80 mb-1">Valor disponível para saque</p>
        <p className="text-2xl font-bold text-amber-900">
          R$ {walletData.available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
      
      <Link to="/financial/payouts">
        <Button 
          variant="outline" 
          className="w-full justify-center border-primary text-primary hover:bg-primary/10"
        >
          Ver meu painel financeiro
        </Button>
      </Link>
    </div>
  );
}
