import { ExternalLink, Wrench } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketingTools } from "@/features/marketing/use-marketing";

export default function ProTools() {
  const query = useMarketingTools();
  const data = query.data;

  return <MainLayout><div className="space-y-6 animate-fade-in">
    <div><div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary"><Wrench className="h-4 w-4" />Marketing</div><h1 className="text-2xl font-bold text-foreground">Ferramentas Pro</h1><p className="text-muted-foreground">Ferramentas habilitadas conforme capacidade real da plataforma e integrações contratadas.</p></div>
    {!query.isLoading && data?.available === false && <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">O catálogo real de ferramentas ainda não está conectado. Nenhum recurso premium fictício é anunciado como disponível.</div>}
    {query.isLoading ? <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">Carregando...</div> : (data?.items.length ?? 0) === 0 ? <div className="rounded-xl border border-border bg-card p-12 text-center"><Wrench className="mx-auto h-6 w-6 text-muted-foreground" /><h3 className="mt-3 text-lg font-medium">Nenhuma ferramenta disponível</h3></div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{data?.items.map((tool) => <Card key={tool.code}><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="text-base">{tool.label}</CardTitle><Badge variant="outline">{tool.available ? "Disponível" : "Indisponível"}</Badge></div></CardHeader><CardContent><p className="min-h-12 text-sm text-muted-foreground">{tool.description}</p>{tool.href && tool.available ? <Button asChild variant="outline" className="mt-4 w-full"><a href={tool.href} target="_blank" rel="noreferrer">Abrir<ExternalLink className="ml-2 h-4 w-4" /></a></Button> : <Button variant="outline" className="mt-4 w-full" disabled>Indisponível</Button>}</CardContent></Card>)}</div>}
  </div></MainLayout>;
}
