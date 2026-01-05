import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const storeData = [
  { name: "Spotify", streams: 2450000, revenue: 8575, color: "#1DB954", growth: 12 },
  { name: "Apple Music", streams: 1280000, revenue: 7680, color: "#FC3C44", growth: 8 },
  { name: "YouTube Music", streams: 890000, revenue: 1780, color: "#FF0000", growth: -3 },
  { name: "Deezer", streams: 456000, revenue: 2736, color: "#FEAA2D", growth: 15 },
  { name: "Amazon Music", streams: 320000, revenue: 1920, color: "#00A8E1", growth: 5 },
  { name: "Tidal", streams: 180000, revenue: 2160, color: "#000000", growth: -1 },
];

const radarData = [
  { metric: "Streams", Spotify: 100, AppleMusic: 52, YouTube: 36, Deezer: 19 },
  { metric: "Receita", Spotify: 100, AppleMusic: 90, YouTube: 21, Deezer: 32 },
  { metric: "Crescimento", Spotify: 80, AppleMusic: 53, YouTube: 30, Deezer: 100 },
  { metric: "Engajamento", Spotify: 85, AppleMusic: 70, YouTube: 90, Deezer: 45 },
  { metric: "Alcance", Spotify: 95, AppleMusic: 75, YouTube: 100, Deezer: 40 },
];

const monthlyComparison = [
  { month: "Out", Spotify: 2100000, AppleMusic: 1100000, YouTube: 750000 },
  { month: "Nov", Spotify: 2250000, AppleMusic: 1180000, YouTube: 820000 },
  { month: "Dez", Spotify: 2380000, AppleMusic: 1220000, YouTube: 860000 },
  { month: "Jan", Spotify: 2450000, AppleMusic: 1280000, YouTube: 890000 },
];

export default function StoreComparison() {
  const [period, setPeriod] = useState("30d");

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return `R$ ${num.toLocaleString("pt-BR")}`;
  };

  const getTrendIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Comparação de Lojas</h1>
            <p className="text-muted-foreground">
              Compare o desempenho entre plataformas de streaming
            </p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Store Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {storeData.map((store) => (
            <Card key={store.name} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: store.color }}
                  />
                  <span className="font-medium">{store.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(store.growth)}
                  <span className={`text-sm ${store.growth > 0 ? "text-green-500" : store.growth < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                    {store.growth > 0 ? "+" : ""}{store.growth}%
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{formatNumber(store.streams)}</p>
                <p className="text-sm text-muted-foreground">streams</p>
              </div>
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-sm">
                  Receita: <span className="font-medium">{formatCurrency(store.revenue)}</span>
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Streams by Store */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Streams por Plataforma</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storeData} layout="vertical">
                <XAxis type="number" tickFormatter={formatNumber} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => formatNumber(value)}
                />
                <Bar dataKey="streams" radius={[0, 4, 4, 0]}>
                  {storeData.map((entry, index) => (
                    <rect key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Radar Comparison */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Comparativo de Métricas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Radar name="Spotify" dataKey="Spotify" stroke="#1DB954" fill="#1DB954" fillOpacity={0.3} />
                <Radar name="Apple Music" dataKey="AppleMusic" stroke="#FC3C44" fill="#FC3C44" fillOpacity={0.3} />
                <Radar name="YouTube" dataKey="YouTube" stroke="#FF0000" fill="#FF0000" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Monthly Comparison */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Evolução Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyComparison}>
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis tickFormatter={formatNumber} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatNumber(value)}
              />
              <Legend />
              <Bar dataKey="Spotify" fill="#1DB954" radius={[4, 4, 0, 0]} />
              <Bar dataKey="AppleMusic" fill="#FC3C44" radius={[4, 4, 0, 0]} />
              <Bar dataKey="YouTube" fill="#FF0000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </MainLayout>
  );
}
