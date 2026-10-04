import { BarChart3, Copy, ExternalLink, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMarketingSmartLinks } from "@/features/marketing/use-marketing";
import { formatDecimalPtBr } from "@/lib/format-money";

export default function SmartLinks() {
  const query = useMarketingSmartLinks();
  const data = query.data;

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  };

  return <MainLayout><div className="space-y-6 animate-fade-in">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight">Smart Links</h1><p className="text-muted-foreground">Links de catálogo com destinos e métricas provenientes do backend real.</p></div><Button disabled><LinkIcon className="mr-2 h-4 w-4" />Criar Smart Link</Button></div>
    {!query.isLoading && data?.available === false && <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">O serviço real de Smart Links ainda não está conectado neste preview. URLs e métricas fictícias foram removidas.</div>}
    {query.isLoading ? <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">Carregando...</div> : (data?.items.length ?? 0) === 0 ? <div className="rounded-xl border border-border bg-card p-12 text-center"><LinkIcon className="mx-auto h-6 w-6 text-muted-foreground" /><h3 className="mt-3 text-lg font-medium">Nenhum Smart Link disponível</h3></div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{data?.items.map((link) => <Card key={link.id} className="overflow-hidden transition-shadow hover:shadow-lg"><div className="relative aspect-square bg-muted">{link.artworkUrl ? <img src={link.artworkUrl} alt={link.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><LinkIcon className="h-8 w-8 text-muted-foreground" /></div>}<div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" /><div className="absolute bottom-3 left-3 right-3"><h3 className="text-lg font-bold">{link.title}</h3><p className="text-sm text-muted-foreground">{link.destinations.length} destinos</p></div></div><CardContent className="space-y-3 p-4"><div className="flex items-center gap-2 rounded-md bg-muted p-2"><code className="flex-1 truncate text-xs">{link.publicUrl ?? "URL pública não configurada"}</code>{link.publicUrl && <><Button size="icon" variant="ghost" onClick={() => void copy(link.publicUrl!)} className="h-7 w-7"><Copy className="h-3.5 w-3.5" /></Button><Button size="icon" variant="ghost" asChild className="h-7 w-7"><a href={link.publicUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a></Button></>}</div><div className="grid grid-cols-3 gap-2 text-center"><div><div className="text-lg font-bold">{link.visits ? formatDecimalPtBr(link.visits, 0) : "—"}</div><div className="text-xs text-muted-foreground">Visitas</div></div><div><div className="text-lg font-bold">{link.conversions ? formatDecimalPtBr(link.conversions, 0) : "—"}</div><div className="text-xs text-muted-foreground">Conversões</div></div><div><div className="text-lg font-bold">{link.conversionRate ? `${formatDecimalPtBr(link.conversionRate, 2)}%` : "—"}</div><div className="text-xs text-muted-foreground">Taxa</div></div></div><div className="flex flex-wrap gap-1">{link.destinations.map((destination) => <Badge key={destination.code} variant="secondary">{destination.label}</Badge>)}</div><Button variant="outline" size="sm" className="w-full" disabled><BarChart3 className="mr-2 h-4 w-4" />Ver analytics</Button></CardContent></Card>)}</div>}
  </div></MainLayout>;
}
