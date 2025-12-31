import { Wallet, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { walletData } from "@/data/mockData";

export function WalletCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 text-primary-foreground">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm opacity-80">Saldo Disponível</p>
            <p className="text-3xl font-bold">
              R$ {walletData.available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-60">Pendente</p>
            <p className="text-sm font-medium">
              R$ {walletData.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <Button 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            Solicitar Saque
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
