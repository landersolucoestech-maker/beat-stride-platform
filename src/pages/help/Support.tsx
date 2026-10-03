import { BookOpen, ExternalLink, HelpCircle, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupportKnowledgeBase } from "@/features/support/use-support";

export default function Support() {
  const knowledgeQuery = useSupportKnowledgeBase();
  const data = knowledgeQuery.data;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div><h1 className="text-2xl font-bold text-foreground">Central de Suporte</h1><p className="text-muted-foreground">Documentação operacional e canais de atendimento da plataforma.</p></div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader className="flex flex-row items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><MessageSquare className="h-5 w-5 text-primary" /></div><CardTitle className="text-base">Precisa de atendimento?</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">Abra um ticket para questões de catálogo, distribuição, finanças, conta ou operação.</p><Button asChild><Link to="/help/tickets">Ver meus tickets</Link></Button></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><HelpCircle className="h-5 w-5 text-primary" /></div><CardTitle className="text-base">Status do suporte</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Prazos, horários e níveis de atendimento serão exibidos somente quando configurados no backend operacional.</p></CardContent></Card>
        </div>

        {!knowledgeQuery.isLoading && data?.available === false && <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">A base de conhecimento real ainda não está conectada neste preview. Artigos fictícios foram removidos.</div>}

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />Base de conhecimento</CardTitle></CardHeader><CardContent>
          {knowledgeQuery.isLoading ? <div className="py-8 text-center text-sm text-muted-foreground">Carregando...</div> : (data?.articles.length ?? 0) === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">Nenhum artigo disponível.</div> : <div className="grid gap-3 md:grid-cols-2">{data?.articles.map((article) => <a key={article.id} href={article.href} target="_blank" rel="noreferrer" className="rounded-lg border border-border p-4 transition-colors hover:border-primary/50"><div className="flex items-start justify-between gap-3"><div><h3 className="font-medium text-foreground">{article.title}</h3><p className="mt-1 text-sm text-muted-foreground">{article.summary}</p></div><ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" /></div></a>)}</div>}
        </CardContent></Card>
      </div>
    </MainLayout>
  );
}
