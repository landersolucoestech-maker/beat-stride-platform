import { User } from "lucide-react";

import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import type { DashboardArtistPerformance } from "@/features/dashboard/dashboard.types";

interface TopArtistsProps { artists: DashboardArtistPerformance[]; }

export function TopArtists({ artists }: TopArtistsProps) {
  const maxStreams = artists[0]?.streams ?? 1;
  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-4"><User className="h-5 w-5 text-primary" /><h3 className="font-semibold text-foreground">Top Artistas</h3></div>
      {artists.length === 0 ? <DashboardEmptyState title="Sem artistas ranqueados" description="O ranking aparecerá quando houver analytics reais disponíveis." compact /> : (
        <div className="space-y-4">
          {artists.slice(0, 5).map((item, index) => (
            <div key={item.id} className="flex items-center gap-4">
              <span className="w-6 text-center text-sm font-medium text-muted-foreground">{index + 1}</span>
              <div className="flex-1"><div className="flex items-center justify-between mb-1"><span className="font-medium text-foreground">{item.name}</span><span className="text-sm text-muted-foreground">{item.streams.toLocaleString("pt-BR")} streams</span></div><div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${(item.streams / maxStreams) * 100}%` }} /></div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
