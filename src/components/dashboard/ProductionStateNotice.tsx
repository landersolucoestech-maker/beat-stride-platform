import { Database } from "lucide-react";

export function ProductionStateNotice() {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Database className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Dados reais em preparação</p>
          <p className="mt-1 text-sm text-muted-foreground">
            O painel preserva a referência visual atual. Indicadores operacionais e financeiros serão exibidos quando as fontes reais de dados forem conectadas.
          </p>
        </div>
      </div>
    </div>
  );
}
