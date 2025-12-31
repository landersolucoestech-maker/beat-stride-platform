import { User } from "lucide-react";

const artistsData = [
  { name: 'Artista Principal', streams: 345000 },
  { name: 'Feat. Colaborador 1', streams: 123000 },
  { name: 'Feat. Colaborador 2', streams: 89000 },
  { name: 'Feat. Colaborador 3', streams: 56000 },
  { name: 'Feat. Colaborador 4', streams: 34000 },
];

export function TopArtists() {
  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Top Artistas</h3>
      </div>
      <div className="space-y-4">
        {artistsData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-4">
            <span className="w-6 text-center text-sm font-medium text-muted-foreground">
              {index + 1}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground">{item.name}</span>
                <span className="text-sm text-muted-foreground">
                  {item.streams.toLocaleString('pt-BR')} streams
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-chart-4"
                  style={{ width: `${(item.streams / artistsData[0].streams) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
