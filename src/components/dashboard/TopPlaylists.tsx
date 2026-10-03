import { ListMusic } from "lucide-react";

import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import type { DashboardPlaylistPerformance } from "@/features/dashboard/dashboard.types";

interface TopPlaylistsProps { playlists: DashboardPlaylistPerformance[]; }

export function TopPlaylists({ playlists }: TopPlaylistsProps) {
  const maxStreams = playlists[0]?.streams ?? 1;
  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-4"><ListMusic className="h-5 w-5 text-primary" /><h3 className="font-semibold text-foreground">Top Playlists</h3></div>
      {playlists.length === 0 ? <DashboardEmptyState title="Sem playlists disponíveis" description="As playlists aparecerão quando os dados reais de performance forem sincronizados." compact /> : (
        <div className="space-y-4">
          {playlists.slice(0, 5).map((item, index) => (
            <div key={item.id} className="flex items-center gap-4"><span className="w-6 text-center text-sm font-medium text-muted-foreground">{index + 1}</span><div className="flex-1"><div className="flex items-center justify-between mb-1"><div><span className="font-medium text-foreground">{item.name}</span><span className="text-xs text-muted-foreground ml-2">({item.curator})</span></div><span className="text-sm text-muted-foreground">{item.streams.toLocaleString("pt-BR")} streams</span></div><div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${(item.streams / maxStreams) * 100}%` }} /></div></div></div>
          ))}
        </div>
      )}
    </div>
  );
}
