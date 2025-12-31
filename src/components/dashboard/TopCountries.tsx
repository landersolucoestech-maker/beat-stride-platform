const countryData = [
  { country: 'Brasil', streams: 456000 },
  { country: 'Portugal', streams: 89000 },
  { country: 'EUA', streams: 67000 },
  { country: 'México', streams: 45000 },
  { country: 'Argentina', streams: 34000 },
];

export function TopCountries() {
  return (
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
  );
}
