import { Play, TrendingUp } from "lucide-react";

import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import type { DashboardTrackPerformance } from "@/features/dashboard/dashboard.types";

interface TopStreamsProps { tracks: DashboardTrackPerformance[]; }

export function TopStreams({ tracks }: TopStreamsProps) {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div><h3 className="font-semibold text-foreground">Top Streams</h3><p className="text-sm text-muted-foreground">Suas músicas mais ouvidas</p></div>
        <TrendingUp className="h-5 w-5 text-primary" />
      </div>
      {tracks.length === 0 ? <DashboardEmptyState title="Sem dados de performance" description="O ranking será calculado a partir dos dados reais das plataformas." compact /> : (
        <div className="divide-y divide-border">
          {tracks.slice(0, 5).map((track, index) => (
            <div key={track.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{index + 1}</div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Play className="h-4 w-4 text-muted-foreground" /></div>
              <div className="flex-1 min-w-0"><h4 className="font-medium text-foreground truncate">{track.title}</h4><p className="text-sm text-muted-foreground truncate">{track.artistName}</p></div>
              <div className="text-right"><p className="font-medium text-foreground">{track.streams.toLocaleString("pt-BR")}</p>{track.trendPercent !== undefined && <p className="text-xs text-muted-foreground">{track.trendPercent >= 0 ? "+" : ""}{track.trendPercent.toFixed(1)}%</p>}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
