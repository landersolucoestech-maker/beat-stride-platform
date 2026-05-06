import { TrendingUp, Play } from "lucide-react";

const topTracks = [
  { id: 1, title: "Midnight Dreams", artist: "Artista", streams: 125430, trend: "+12%" },
  { id: 2, title: "Summer Vibes", artist: "Artista", streams: 98234, trend: "+8%" },
  { id: 3, title: "Lost in Time", artist: "Artista", streams: 76521, trend: "+15%" },
  { id: 4, title: "Electric Heart", artist: "Artista", streams: 54892, trend: "+5%" },
  { id: 5, title: "Neon Lights", artist: "Artista", streams: 43210, trend: "+3%" },
];

export function TopStreams() {
  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-border/60">
        <div>
          <h3 className="font-display font-semibold text-foreground">Top Streams</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Suas faixas mais ouvidas</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {topTracks.map((track, index) => (
          <div
            key={track.id}
            className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {index + 1}
            </div>
            
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
              <Play className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{track.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
            </div>
            
            <div className="text-right">
              <p className="font-medium text-foreground">{track.streams.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-emerald-500">{track.trend}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
