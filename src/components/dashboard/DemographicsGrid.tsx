import { ListMusic, User } from "lucide-react";

const countryData = [
  { country: 'Brasil', streams: 456000 },
  { country: 'Portugal', streams: 89000 },
  { country: 'EUA', streams: 67000 },
  { country: 'México', streams: 45000 },
  { country: 'Argentina', streams: 34000 },
];

const cityData = [
  { city: 'São Paulo', streams: 156000 },
  { city: 'Rio de Janeiro', streams: 98000 },
  { city: 'Belo Horizonte', streams: 45000 },
  { city: 'Curitiba', streams: 34000 },
  { city: 'Porto Alegre', streams: 28000 },
];

const playlistsData = [
  { name: 'Top Brasil', curator: 'Spotify', streams: 234000 },
  { name: 'Hits do Momento', curator: 'Deezer', streams: 156000 },
  { name: 'Viral 50', curator: 'Spotify', streams: 98000 },
  { name: 'Pop Nacional', curator: 'Apple Music', streams: 67000 },
  { name: 'Descobertas da Semana', curator: 'Spotify', streams: 45000 },
];

const artistsData = [
  { name: 'Artista Principal', streams: 345000 },
  { name: 'Feat. Colaborador 1', streams: 123000 },
  { name: 'Feat. Colaborador 2', streams: 89000 },
  { name: 'Feat. Colaborador 3', streams: 56000 },
  { name: 'Feat. Colaborador 4', streams: 34000 },
];

export function DemographicsGrid() {
  return (
    <div className="space-y-6">
      {/* Countries and Cities */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-card border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Top Países</h3>
          <div className="space-y-4">
            {countryData.map((item, index) => (
              <div key={item.country} className="flex items-center gap-4">
                <span className="w-6 text-center text-sm font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{item.country}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.streams.toLocaleString('pt-BR')} streams
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-primary"
                      style={{ width: `${(item.streams / countryData[0].streams) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Top Cidades</h3>
          <div className="space-y-4">
            {cityData.map((item, index) => (
              <div key={item.city} className="flex items-center gap-4">
                <span className="w-6 text-center text-sm font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{item.city}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.streams.toLocaleString('pt-BR')} streams
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-chart-2"
                      style={{ width: `${(item.streams / cityData[0].streams) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Playlists and Top Artists */}
      <div className="grid lg:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
}
