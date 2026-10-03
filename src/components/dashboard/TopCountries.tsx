import { Globe } from "lucide-react";

import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import type { DashboardTerritoryPerformance } from "@/features/dashboard/dashboard.types";

interface TopCountriesProps { territories: DashboardTerritoryPerformance[]; }

export function TopCountries({ territories }: TopCountriesProps) {
  const maxStreams = territories[0]?.streams ?? 1;
  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-6"><Globe className="h-5 w-5 text-primary" /><h3 className="font-semibold text-foreground text-lg">Top territórios</h3></div>
      {territories.length === 0 ? <DashboardEmptyState title="Sem territórios disponíveis" description="Os territórios com melhor performance aparecerão após a sincronização de analytics." /> : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {territories.slice(0, 6).map((item) => (
            <div key={item.code} className="relative h-12 overflow-hidden rounded-lg bg-muted"><div className="absolute inset-y-0 left-0 bg-primary/15" style={{ width: `${(item.streams / maxStreams) * 100}%` }} /><div className="relative z-10 flex h-full items-center justify-between px-4"><span className="font-medium text-foreground">{item.country}</span><span className="text-sm text-muted-foreground">{item.streams.toLocaleString("pt-BR")}</span></div></div>
          ))}
        </div>
      )}
    </div>
  );
}
