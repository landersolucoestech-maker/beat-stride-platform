import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Music, Users, Play, TrendingUp, Heart, Share2 } from "lucide-react";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const trendingData = [
  { sound: "Sunset Dreams", uses: 125000, artist: "Luna Silva", growth: "+45%" },
  { sound: "Noite Estrelada", uses: 89000, artist: "Pedro Santos", growth: "+32%" },
  { sound: "Amor Infinito", uses: 67000, artist: "Maria Costa", growth: "+28%" },
  { sound: "Ritmo do Verão", uses: 45000, artist: "Luna Silva", growth: "+15%" },
];

const weeklyData = [
  { day: "Seg", uses: 12000, views: 450000 },
  { day: "Ter", uses: 15000, views: 520000 },
  { day: "Qua", uses: 18000, views: 680000 },
  { day: "Qui", uses: 14000, views: 490000 },
  { day: "Sex", uses: 22000, views: 890000 },
  { day: "Sáb", uses: 28000, views: 1200000 },
  { day: "Dom", uses: 25000, views: 980000 },
];

const topVideos = [
  { creator: "@dancestar", views: 2500000, likes: 450000, shares: 89000 },
  { creator: "@musiclover", views: 1800000, likes: 320000, shares: 67000 },
  { creator: "@viralking", views: 1200000, likes: 280000, shares: 45000 },
  { creator: "@trending_br", views: 890000, likes: 156000, shares: 34000 },
];

export default function TikTokStats() {
  const [period, setPeriod] = useState("7d");

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Estatísticas TikTok</h1>
            <p className="text-muted-foreground">
              Acompanhe o desempenho dos seus sons no TikTok
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
            </SelectContent>
          </Select>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <Music className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">326K</p>
                <p className="text-sm text-muted-foreground">Usos do Som</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Play className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">45.2M</p>
                <p className="text-sm text-muted-foreground">Views Totais</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Heart className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">8.9M</p>
                <p className="text-sm text-muted-foreground">Curtidas</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">+127%</p>
                <p className="text-sm text-muted-foreground">Crescimento</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Performance */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Desempenho Semanal</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatNumber} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="uses" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Views per Day */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Views por Dia</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatNumber} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Trending Sounds & Top Videos */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trending Sounds */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Sons em Alta</h3>
            <div className="space-y-4">
              {trendingData.map((sound, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{sound.sound}</p>
                    <p className="text-sm text-muted-foreground">{sound.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatNumber(sound.uses)}</p>
                    <p className="text-sm text-green-500">{sound.growth}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Videos Using Your Sounds */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Top Vídeos com Seus Sons</h3>
            <div className="space-y-4">
              {topVideos.map((video, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {video.creator.charAt(1).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{video.creator}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        {formatNumber(video.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {formatNumber(video.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        {formatNumber(video.shares)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
