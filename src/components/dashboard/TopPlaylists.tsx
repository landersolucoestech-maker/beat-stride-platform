import { ListMusic } from "lucide-react";

const playlistsData = [
  { name: 'Top Brasil', curator: 'Spotify', streams: 234000 },
  { name: 'Hits do Momento', curator: 'Deezer', streams: 156000 },
  { name: 'Viral 50', curator: 'Spotify', streams: 98000 },
  { name: 'Pop Nacional', curator: 'Apple Music', streams: 67000 },
  { name: 'Descobertas da Semana', curator: 'Spotify', streams: 45000 },
];

export function TopPlaylists() {
  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <ListMusic className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Top Playlists</h3>
      </div>
      <div className="space-y-4">
        {playlistsData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-4">
            <span className="w-6 text-center text-sm font-medium text-muted-foreground">
              {index + 1}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">({item.curator})</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.streams.toLocaleString('pt-BR')} streams
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-chart-3"
                  style={{ width: `${(item.streams / playlistsData[0].streams) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
