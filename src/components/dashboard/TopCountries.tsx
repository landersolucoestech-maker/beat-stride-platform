import { Globe } from "lucide-react";

const countryData = [
  { code: 'BR', country: 'Brasil', streams: 456000 },
  { code: 'PT', country: 'Portugal', streams: 89000 },
  { code: 'CH', country: 'China', streams: 67000 },
  { code: 'US', country: 'EUA', streams: 45000 },
  { code: 'FR', country: 'França', streams: 34000 },
];

export function TopCountries() {
  const maxStreams = countryData[0].streams;

  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground text-lg">Top territórios</h3>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Country bars */}
        <div className="space-y-3 lg:w-1/3">
          {countryData.map((item) => (
            <div
              key={item.code}
              className="relative h-10 rounded-lg bg-muted overflow-hidden flex items-center"
            >
              <div
                className="absolute inset-y-0 left-0 bg-primary/20 rounded-lg"
                style={{ width: `${(item.streams / maxStreams) * 100}%` }}
              />
              <span className="relative z-10 px-4 font-medium text-foreground">
                {item.code}
              </span>
            </div>
          ))}
        </div>

        {/* World Map SVG */}
        <div className="flex-1 flex items-center justify-center">
          <svg
            viewBox="0 0 1000 500"
            className="w-full h-auto max-h-80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Simplified world map paths */}
            {/* North America */}
            <path
              d="M150 80 L280 80 L320 120 L300 180 L260 220 L200 240 L140 200 L100 140 L120 100 Z"
              className="fill-muted-foreground/30"
            />
            {/* USA - highlighted if in top */}
            <path
              d="M140 140 L260 140 L280 180 L260 220 L180 220 L140 180 Z"
              className="fill-muted-foreground/50"
            />
            {/* South America */}
            <path
              d="M220 260 L280 260 L300 320 L280 400 L240 440 L200 400 L200 320 Z"
              className="fill-primary"
            />
            {/* Europe */}
            <path
              d="M440 80 L520 80 L540 120 L520 160 L480 160 L440 140 L420 100 Z"
              className="fill-muted-foreground/50"
            />
            {/* Africa */}
            <path
              d="M440 180 L520 180 L560 260 L540 360 L480 380 L420 340 L420 240 Z"
              className="fill-muted-foreground/30"
            />
            {/* Asia */}
            <path
              d="M560 60 L800 60 L880 140 L860 220 L780 260 L680 240 L600 180 L560 120 Z"
              className="fill-muted-foreground/30"
            />
            {/* China - highlighted if in top */}
            <path
              d="M680 120 L780 120 L800 180 L760 220 L680 200 L660 160 Z"
              className="fill-muted-foreground/50"
            />
            {/* Australia */}
            <path
              d="M780 320 L880 320 L900 380 L860 420 L800 400 L780 360 Z"
              className="fill-muted-foreground/30"
            />
            {/* Portugal */}
            <ellipse
              cx="420"
              cy="130"
              rx="8"
              ry="12"
              className="fill-muted-foreground/50"
            />
            {/* France */}
            <ellipse
              cx="460"
              cy="120"
              rx="12"
              ry="15"
              className="fill-muted-foreground/50"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
