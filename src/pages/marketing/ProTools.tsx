import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Link2,
  QrCode,
  BarChart3,
  Globe,
  Music,
  Palette,
  ExternalLink,
  Copy,
  Download,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const tools = [
  {
    id: "smartlink",
    name: "Smart Links",
    description: "Crie links inteligentes para suas músicas que direcionam para todas as plataformas",
    icon: Link2,
    color: "bg-purple-500/10 text-purple-500",
    stats: { created: 12, clicks: 45000 },
  },
  {
    id: "qrcode",
    name: "QR Codes",
    description: "Gere QR codes personalizados para seus links e materiais promocionais",
    icon: QrCode,
    color: "bg-blue-500/10 text-blue-500",
    stats: { created: 8, scans: 3200 },
  },
  {
    id: "presave",
    name: "Pre-Save Pages",
    description: "Crie páginas de pré-save para coletar e-mails e gerar hype antes do lançamento",
    icon: Music,
    color: "bg-green-500/10 text-green-500",
    stats: { active: 2, saves: 1850 },
  },
  {
    id: "analytics",
    name: "Link Analytics",
    description: "Acompanhe cliques, conversões e comportamento dos seus links em tempo real",
    icon: BarChart3,
    color: "bg-orange-500/10 text-orange-500",
    stats: { tracked: 20, insights: 156 },
  },
  {
    id: "epk",
    name: "EPK Builder",
    description: "Crie um Electronic Press Kit profissional para divulgar sua música",
    icon: Globe,
    color: "bg-pink-500/10 text-pink-500",
    stats: { created: 3, views: 890 },
  },
  {
    id: "artwork",
    name: "Artwork Generator",
    description: "Gere artes para redes sociais a partir da capa do seu lançamento",
    icon: Palette,
    color: "bg-yellow-500/10 text-yellow-500",
    stats: { generated: 24, downloaded: 18 },
  },
];

const recentLinks = [
  {
    id: "1",
    name: "Sunset Dreams - All Platforms",
    url: "smart.link/sunsetdreams",
    clicks: 12500,
    created: "2024-02-10",
  },
  {
    id: "2",
    name: "Luna Silva - Bio Link",
    url: "bio.link/lunasilva",
    clicks: 8900,
    created: "2024-01-15",
  },
  {
    id: "3",
    name: "Noite Estrelada - Pre-Save",
    url: "presave.link/noiteestrelada",
    clicks: 3200,
    created: "2024-02-01",
  },
];

export default function ProTools() {
  const { toast } = useToast();

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(`https://${url}`);
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para sua área de transferência.",
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Ferramentas Profissionais</h1>
          <p className="text-muted-foreground">
            Ferramentas avançadas para promover sua música
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Card key={tool.id} className="p-6 hover:border-primary/50 transition-colors">
              <div className={`p-3 rounded-lg ${tool.color} w-fit mb-4`}>
                <tool.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{tool.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  {Object.entries(tool.stats).map(([key, value]) => (
                    <span key={key} className="text-muted-foreground">
                      <span className="font-medium text-foreground">{formatNumber(value as number)}</span>{" "}
                      {key}
                    </span>
                  ))}
                </div>
                <Button size="sm">Usar</Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Links */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Links Recentes</h2>
            <Button variant="outline" size="sm">
              Criar Novo Link
            </Button>
          </div>
          <div className="space-y-3">
            {recentLinks.map((link) => (
              <div
                key={link.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{link.name}</p>
                  <p className="text-sm text-primary">{link.url}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    {formatNumber(link.clicks)} cliques
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyLink(link.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pro Tips */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
          <h3 className="font-semibold mb-2">💡 Dica Pro</h3>
          <p className="text-muted-foreground">
            Use Smart Links em todas as suas redes sociais. Isso facilita para seus fãs encontrarem
            sua música em qualquer plataforma e você ainda consegue acompanhar de onde vêm os cliques.
          </p>
        </Card>
      </div>
    </MainLayout>
  );
}
