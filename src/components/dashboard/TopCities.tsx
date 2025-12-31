const cityData = [
  { city: 'São Paulo', streams: 156000 },
  { city: 'Rio de Janeiro', streams: 98000 },
  { city: 'Belo Horizonte', streams: 45000 },
  { city: 'Curitiba', streams: 34000 },
  { city: 'Porto Alegre', streams: 28000 },
];

export function TopCities() {
  return (
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
  );
}
