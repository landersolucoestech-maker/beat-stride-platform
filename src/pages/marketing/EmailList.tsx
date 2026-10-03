import { Mail, Users } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFanListOverview } from "@/features/marketing/use-marketing";
import { formatDecimalPtBr } from "@/lib/format-money";

export default function EmailList() {
  const query = useFanListOverview();
  const data = query.data;
  const summary = data?.summary;

  return <MainLayout><div className="space-y-6 animate-fade-in">
    <div><div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary"><Mail className="h-4 w-4" />Marketing</div><h1 className="text-2xl font-bold text-foreground">Lista de E-mails</h1><p className="text-muted-foreground">Audiência própria captada por ferramentas de marketing da Distribuição.</p></div>
    {!query.isLoading && data?.available === false && <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Nenhuma base de fãs real está conectada ao preview. E-mails e métricas fictícias foram removidos.</div>}
    <div className="grid gap-4 sm:grid-cols-3"><Card><CardHeader className="pb-2"><CardTitle className="text-sm">Contatos</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary?.totalContacts ? formatDecimalPtBr(summary.totalContacts, 0) : "—"}</p></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm">Inscritos</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary?.subscribedContacts ? formatDecimalPtBr(summary.subscribedContacts, 0) : "—"}</p></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm">Descadastrados</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary?.unsubscribedContacts ? formatDecimalPtBr(summary.unsubscribedContacts, 0) : "—"}</p></CardContent></Card></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Fontes de captação</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Fonte</TableHead><TableHead className="text-right">Contatos</TableHead></TableRow></TableHeader><TableBody>{(data?.sources.length ?? 0) === 0 && <TableRow><TableCell colSpan={2} className="py-8 text-center text-muted-foreground">Nenhuma fonte disponível.</TableCell></TableRow>}{data?.sources.map((source) => <TableRow key={source.code}><TableCell className="font-medium">{source.label}</TableCell><TableCell className="text-right">{formatDecimalPtBr(source.contacts, 0)}</TableCell></TableRow>)}</TableBody></Table>{summary?.lastUpdatedAt && <p className="mt-4 text-xs text-muted-foreground">Atualizado em {new Date(summary.lastUpdatedAt).toLocaleString("pt-BR")}</p>}</CardContent></Card>
  </div></MainLayout>;
}
