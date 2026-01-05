import { Globe } from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const countryData = [
  { code: 'BR', country: 'Brasil', streams: 456000, iso: '076' },
  { code: 'PT', country: 'Portugal', streams: 89000, iso: '620' },
  { code: 'CH', country: 'China', streams: 67000, iso: '156' },
  { code: 'US', country: 'EUA', streams: 45000, iso: '840' },
  { code: 'FR', country: 'França', streams: 34000, iso: '250' },
];

const highlightedCountries = countryData.map(c => c.iso);

export function TopCountries() {
  const maxStreams = countryData[0].streams;

  const getCountryColor = (geo: any) => {
    const countryId = geo.id;
    const isHighlighted = highlightedCountries.includes(countryId);
    const isTopCountry = countryId === '076'; // Brazil
    
    if (isTopCountry) return 'hsl(var(--primary))';
    if (isHighlighted) return 'hsl(var(--muted-foreground) / 0.6)';
    return 'hsl(var(--muted-foreground) / 0.2)';
  };

  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground text-lg">Top territórios</h3>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Country bars */}
        <div className="space-y-3 lg:w-1/4 shrink-0">
          {countryData.map((item) => (
            <div
              key={item.code}
              className="relative h-10 rounded-lg bg-muted overflow-hidden flex items-center"
            >
              <div
                className="absolute inset-y-0 left-0 bg-primary/20 rounded-lg transition-all"
                style={{ width: `${(item.streams / maxStreams) * 100}%` }}
              />
              <span className="relative z-10 px-4 font-medium text-foreground">
                {item.code}
              </span>
            </div>
          ))}
        </div>

        {/* World Map */}
        <div className="flex-1 flex items-center justify-center min-h-[280px]">
          <ComposableMap
            projectionConfig={{
              scale: 140,
              center: [0, 20],
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryColor(geo)}
                    stroke="hsl(var(--border))"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: "hsl(var(--primary) / 0.7)" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
          </ComposableMap>
        </div>
      </div>
    </div>
  );
}
