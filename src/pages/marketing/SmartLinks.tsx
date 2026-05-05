import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSmartLinks } from "@/hooks/useCore";
import { Copy, ExternalLink, BarChart3, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export default function SmartLinks() {
  const { data: links } = useSmartLinks();

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Smart Links</h1>
            <p className="text-muted-foreground">Um único link para todas as plataformas, com métricas em tempo real.</p>
          </div>
          <Button><LinkIcon className="h-4 w-4 mr-2" />Criar Smart Link</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links?.map(link => (
            <Card key={link.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                <img src={link.artwork} alt={link.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-bold text-lg">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.destinations.length} destinos</p>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                  <code className="text-xs flex-1 truncate">{link.url}</code>
                  <Button size="icon" variant="ghost" onClick={() => copy(link.url)} className="h-7 w-7">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" asChild className="h-7 w-7">
                    <a href={link.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-lg font-bold">{link.visits.toLocaleString("pt-BR")}</div><div className="text-xs text-muted-foreground">Visitas</div></div>
                  <div><div className="text-lg font-bold">{link.conversions.toLocaleString("pt-BR")}</div><div className="text-xs text-muted-foreground">Conversões</div></div>
                  <div><div className="text-lg font-bold">{link.conversionRate}%</div><div className="text-xs text-muted-foreground">Taxa</div></div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {link.destinations.map(d => <Badge key={d.dsp} variant="secondary">{d.dsp}</Badge>)}
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" /> Ver analytics
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
