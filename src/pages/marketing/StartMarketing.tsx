import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Target,
  Users,
  Zap,
  TrendingUp,
  Music,
  Instagram,
  Youtube,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

const campaigns = [
  {
    id: "1",
    name: "Lançamento Sunset Dreams",
    status: "active",
    type: "release",
    startDate: "2024-02-01",
    budget: 5000,
    spent: 3200,
    reach: 450000,
    engagement: 12500,
  },
  {
    id: "2",
    name: "Boost Playlist Editorial",
    status: "scheduled",
    type: "playlist",
    startDate: "2024-02-20",
    budget: 2000,
    spent: 0,
    reach: 0,
    engagement: 0,
  },
];

const quickActions = [
  {
    title: "Promover Lançamento",
    description: "Crie uma campanha para seu novo single ou álbum",
    icon: Rocket,
    color: "bg-purple-500/10 text-purple-500",
    href: "#",
  },
  {
    title: "Aumentar Seguidores",
    description: "Estratégias para crescer sua base de fãs",
    icon: Users,
    color: "bg-blue-500/10 text-blue-500",
    href: "#",
  },
  {
    title: "Pitching de Playlist",
    description: "Submeta suas músicas para playlists editoriais",
    icon: Music,
    color: "bg-green-500/10 text-green-500",
    href: "#",
  },
  {
    title: "Anúncios Sociais",
    description: "Crie anúncios no Instagram, TikTok e YouTube",
    icon: Target,
    color: "bg-orange-500/10 text-orange-500",
    href: "#",
  },
];

const platforms = [
  { name: "Instagram", icon: Instagram, connected: true, followers: "125K" },
  { name: "YouTube", icon: Youtube, connected: true, subscribers: "89K" },
  { name: "TikTok", icon: Zap, connected: false, followers: null },
];

export default function StartMarketing() {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Marketing</h1>
          <p className="text-muted-foreground">
            Promova sua música e alcance novos fãs
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">450K</p>
                <p className="text-sm text-muted-foreground">Alcance Total</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">12.5K</p>
                <p className="text-sm text-muted-foreground">Engajamento</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Rocket className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Campanhas Ativas</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ 3.2K</p>
                <p className="text-sm text-muted-foreground">Investido</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card
                key={action.title}
                className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className={`p-3 rounded-lg ${action.color} w-fit mb-3`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Active Campaigns & Platforms */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Campaigns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Campanhas</h2>
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </div>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <Badge
                          variant={campaign.status === "active" ? "default" : "secondary"}
                        >
                          {campaign.status === "active" ? "Ativa" : "Agendada"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Início: {new Date(campaign.startDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-bold">{formatNumber(campaign.reach)}</p>
                        <p className="text-xs text-muted-foreground">Alcance</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">R$ {campaign.spent}</p>
                        <p className="text-xs text-muted-foreground">de R$ {campaign.budget}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {campaign.status === "active" && (
                    <div className="mt-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Connected Platforms */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Plataformas Conectadas</h2>
            <Card className="p-4 space-y-4">
              {platforms.map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <platform.icon className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{platform.name}</p>
                      {platform.connected && (
                        <p className="text-sm text-muted-foreground">
                          {platform.followers || platform.subscribers}
                        </p>
                      )}
                    </div>
                  </div>
                  {platform.connected ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Button size="sm" variant="outline">
                      Conectar
                    </Button>
                  )}
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
