import { Megaphone, Music, Rocket } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketingOverview } from "@/features/marketing/use-marketing";

export default function StartMarketing() {
  const query = useMarketingOverview();
  const data = query.data;

  return <MainLayout><div className="space-y-6 animate-fade-in">
    <div><div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary"><Megaphone className="h-4 w-4" />Marketing</div><h1 className="text-2xl font-bold text-foreground">Iniciar Marketing</h1><p className="text-muted-foreground">Ações nativas de marketing vinculadas ao catálogo da Distribuição.</p></div>
    {!query.isLoading && data?.available === false && <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">O backend de marketing nativo ainda não está conectado ao preview. Nenhum orçamento, campanha ou resultado fictício é exibido.</div>}
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Music className="h-5 w-5 text-primary" />Lançamentos elegíveis</CardTitle></CardHeader><CardContent>{query.isLoading ? <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p> : (data?.releases.length ?? 0) === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhum lançamento disponível.</p> : <div className="space-y-3">{data?.releases.map((release) => <div key={release.id} className="rounded-lg border border-border p-4"><p className="font-medium text-foreground">{release.title}</p><p className="text-sm text-muted-foreground">{release.artistName}</p>{release.releaseDate && <p className="mt-2 text-xs text-muted-foreground">{new Date(`${release.releaseDate}T00:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</p>}</div>)}</div>}</CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5 text-primary" />Ações disponíveis</CardTitle></CardHeader><CardContent>{(data?.actions.length ?? 0) === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma ação disponível.</p> : <div className="space-y-3">{data?.actions.map((action) => <div key={action.code} className="rounded-lg border border-border p-4"><div className="flex items-center justify-between gap-3"><p className="font-medium text-foreground">{action.label}</p><Badge variant="outline">{action.enabled ? "Disponível" : "Indisponível"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{action.description}</p></div>)}</div>}</CardContent></Card>
    </div>
    <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Lander Creators permanece uma integração independente em Marketing → Lander Creators. Campanhas do Creators não são duplicadas como domínio autoritativo da Distribuição.</div>
  </div></MainLayout>;
}
