import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from "lucide-react";
import { useState } from "react";

const chartData = {
  spotify: [
    { position: 1, prevPosition: 2, title: "Sunset Dreams", artist: "Luna Silva", weeks: 12, peak: 1 },
    { position: 2, prevPosition: 1, title: "Noite Estrelada", artist: "Pedro Santos", weeks: 8, peak: 1 },
    { position: 3, prevPosition: 5, title: "Amor Infinito", artist: "Maria Costa", weeks: 6, peak: 3 },
    { position: 4, prevPosition: 4, title: "Ritmo do Verão", artist: "Luna Silva", weeks: 15, peak: 2 },
    { position: 5, prevPosition: 3, title: "Coração Partido", artist: "João Lima", weeks: 4, peak: 3 },
    { position: 6, prevPosition: 8, title: "Dança da Lua", artist: "Ana Beatriz", weeks: 3, peak: 6 },
    { position: 7, prevPosition: 6, title: "Vibes Tropicais", artist: "Pedro Santos", weeks: 10, peak: 4 },
    { position: 8, prevPosition: 10, title: "Sonhos de Verão", artist: "Maria Costa", weeks: 2, peak: 8 },
  ],
  apple: [
    { position: 1, prevPosition: 1, title: "Noite Estrelada", artist: "Pedro Santos", weeks: 10, peak: 1 },
    { position: 2, prevPosition: 3, title: "Sunset Dreams", artist: "Luna Silva", weeks: 8, peak: 1 },
    { position: 3, prevPosition: 2, title: "Amor Infinito", artist: "Maria Costa", weeks: 6, peak: 2 },
    { position: 4, prevPosition: 5, title: "Coração Partido", artist: "João Lima", weeks: 4, peak: 4 },
    { position: 5, prevPosition: 4, title: "Ritmo do Verão", artist: "Luna Silva", weeks: 12, peak: 1 },
  ],
  deezer: [
    { position: 1, prevPosition: 3, title: "Amor Infinito", artist: "Maria Costa", weeks: 4, peak: 1 },
    { position: 2, prevPosition: 1, title: "Sunset Dreams", artist: "Luna Silva", weeks: 6, peak: 1 },
    { position: 3, prevPosition: 2, title: "Noite Estrelada", artist: "Pedro Santos", weeks: 5, peak: 1 },
    { position: 4, prevPosition: 6, title: "Dança da Lua", artist: "Ana Beatriz", weeks: 2, peak: 4 },
    { position: 5, prevPosition: 4, title: "Ritmo do Verão", artist: "Luna Silva", weeks: 8, peak: 2 },
  ],
};

const countryCharts = [
  { country: "Brasil", flag: "🇧🇷", position: 1, chart: "Top 50" },
  { country: "Portugal", flag: "🇵🇹", position: 5, chart: "Top 50" },
  { country: "México", flag: "🇲🇽", position: 12, chart: "Top 100" },
  { country: "Argentina", flag: "🇦🇷", position: 8, chart: "Top 50" },
  { country: "Espanha", flag: "🇪🇸", position: 23, chart: "Top 100" },
  { country: "EUA", flag: "🇺🇸", position: 45, chart: "Top 200" },
];

export default function MusicCharts() {
  const [country, setCountry] = useState("br");
  const [chartType, setChartType] = useState("daily");

  const getTrendIcon = (current: number, prev: number) => {
    if (current < prev) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current > prev) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">{position}</span>;
  };

  const renderChartTable = (data: typeof chartData.spotify) => (
    <div className="space-y-2">
      {data.map((item) => (
        <div
          key={item.position}
          className={`flex items-center gap-4 p-3 rounded-lg ${
            item.position <= 3 ? "bg-primary/5" : "bg-muted/50"
          }`}
        >
          <div className="w-8 flex justify-center">
            {getPositionBadge(item.position)}
          </div>
          <div className="w-8 flex justify-center">
            {getTrendIcon(item.position, item.prevPosition)}
          </div>
          <div className="flex-1">
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.artist}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm">
              <span className="text-muted-foreground">Semanas:</span> {item.weeks}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Pico:</span> #{item.peak}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Charts Musicais</h1>
            <p className="text-muted-foreground">
              Acompanhe suas posições nos principais charts
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="br">🇧🇷 Brasil</SelectItem>
                <SelectItem value="pt">🇵🇹 Portugal</SelectItem>
                <SelectItem value="mx">🇲🇽 México</SelectItem>
                <SelectItem value="global">🌍 Global</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">#1 Posições</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Músicas em Charts</p>
            </div>
          </Card>
          <Card className="p-4">
            <div>
              <p className="text-2xl font-bold">6</p>
              <p className="text-sm text-muted-foreground">Países</p>
            </div>
          </Card>
          <Card className="p-4">
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Semanas no Top 10</p>
            </div>
          </Card>
        </div>

        {/* Charts by Platform */}
        <Card className="p-6">
          <Tabs defaultValue="spotify">
            <TabsList className="mb-4">
              <TabsTrigger value="spotify">Spotify</TabsTrigger>
              <TabsTrigger value="apple">Apple Music</TabsTrigger>
              <TabsTrigger value="deezer">Deezer</TabsTrigger>
            </TabsList>
            <TabsContent value="spotify">
              {renderChartTable(chartData.spotify)}
            </TabsContent>
            <TabsContent value="apple">
              {renderChartTable(chartData.apple)}
            </TabsContent>
            <TabsContent value="deezer">
              {renderChartTable(chartData.deezer)}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Country Charts */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Presença em Charts por País</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {countryCharts.map((item) => (
              <div
                key={item.country}
                className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg"
              >
                <span className="text-2xl">{item.flag}</span>
                <div className="flex-1">
                  <p className="font-medium">{item.country}</p>
                  <p className="text-sm text-muted-foreground">{item.chart}</p>
                </div>
                <Badge variant={item.position <= 10 ? "default" : "secondary"}>
                  #{item.position}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
