import { useMemo, useState } from "react";
import { Clock, MessageSquare, Plus } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSupportTicket, useSupportTickets } from "@/features/support/use-support";
import type { SupportPriority, SupportTicketStatus } from "@/features/support/support.types";
import { useToast } from "@/hooks/use-toast";

const priorityLabels: Record<SupportPriority, string> = { LOW: "Baixa", MEDIUM: "Média", HIGH: "Alta", URGENT: "Urgente" };
const statusLabels: Record<SupportTicketStatus, string> = { OPEN: "Aberto", IN_PROGRESS: "Em andamento", WAITING_CUSTOMER: "Aguardando você", RESOLVED: "Resolvido", CLOSED: "Fechado" };

export default function Tickets() {
  const ticketsQuery = useSupportTickets();
  const createTicket = useCreateSupportTicket();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<SupportPriority | "">("");
  const tickets = ticketsQuery.data?.items ?? [];

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "OPEN").length,
    progress: tickets.filter((ticket) => ticket.status === "IN_PROGRESS" || ticket.status === "WAITING_CUSTOMER").length,
    resolved: tickets.filter((ticket) => ticket.status === "RESOLVED" || ticket.status === "CLOSED").length,
  }), [tickets]);

  const submit = async () => {
    if (!priority || !subject.trim() || !description.trim()) return;
    try {
      await createTicket.mutateAsync({ subject: subject.trim(), description: description.trim(), priority });
      toast({ title: "Ticket criado", description: "Sua solicitação foi registrada no suporte." });
      setOpen(false); setSubject(""); setDescription(""); setPriority("");
    } catch {
      toast({ title: "Não foi possível criar o ticket", description: "Nenhuma solicitação fictícia foi registrada.", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-2xl font-bold text-foreground">Meus Tickets</h1><p className="text-muted-foreground">Acompanhe suas solicitações de suporte.</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gradient-primary text-primary-foreground" disabled={ticketsQuery.data?.available === false}><Plus className="mr-2 h-4 w-4" />Criar Ticket</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>Criar Novo Ticket</DialogTitle><DialogDescription>Descreva a solicitação para a equipe de suporte.</DialogDescription></DialogHeader>
              <div className="space-y-4 py-4"><div><Label htmlFor="subject">Assunto</Label><Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1" /></div><div><Label>Prioridade</Label><Select value={priority} onValueChange={(value) => setPriority(value as SupportPriority)}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="LOW">Baixa</SelectItem><SelectItem value="MEDIUM">Média</SelectItem><SelectItem value="HIGH">Alta</SelectItem><SelectItem value="URGENT">Urgente</SelectItem></SelectContent></Select></div><div><Label htmlFor="description">Descrição</Label><Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="mt-1" /></div></div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={() => void submit()} disabled={!subject.trim() || !description.trim() || !priority || createTicket.isPending}>{createTicket.isPending ? "Enviando..." : "Criar Ticket"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {!ticketsQuery.isLoading && ticketsQuery.data?.available === false && <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">O preview não possui suporte conectado. Nenhum ticket de demonstração é exibido.</div>}

        <div className="grid gap-4 sm:grid-cols-4">{[["Total", stats.total], ["Abertos", stats.open], ["Em andamento", stats.progress], ["Resolvidos", stats.resolved]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold text-foreground">{ticketsQuery.data?.available ? value : "—"}</p></div>)}</div>

        <div className="space-y-4">
          {ticketsQuery.isLoading && <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">Carregando...</div>}
          {!ticketsQuery.isLoading && tickets.length === 0 && <div className="rounded-xl border border-border bg-card p-12 text-center"><MessageSquare className="mx-auto h-6 w-6 text-muted-foreground" /><h3 className="mt-3 text-lg font-medium">Nenhum ticket disponível</h3></div>}
          {tickets.map((ticket) => <article key={ticket.id} className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-start gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><MessageSquare className="h-5 w-5 text-primary" /></div><div><h3 className="font-semibold text-foreground">{ticket.subject}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ticket.description}</p><div className="mt-3 flex items-center gap-4"><span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{new Date(ticket.createdAt).toLocaleDateString("pt-BR")}</span><span className="text-xs text-muted-foreground">Prioridade {priorityLabels[ticket.priority]}</span></div></div></div><Badge variant="outline">{statusLabels[ticket.status]}</Badge></div></article>)}
        </div>
      </div>
    </MainLayout>
  );
}
