import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { tickets } from "@/data/mockData";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function Tickets() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");

  const handleCreateTicket = () => {
    toast({
      title: "Ticket criado!",
      description: "Sua solicitação foi enviada para nossa equipe de suporte.",
    });
    setIsDialogOpen(false);
    setSubject("");
    setDescription("");
    setPriority("");
  };

  const priorityColors = {
    low: "text-muted-foreground",
    medium: "text-warning",
    high: "text-destructive",
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meus Tickets</h1>
            <p className="text-muted-foreground">Acompanhe suas solicitações de suporte</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Criar Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Ticket</DialogTitle>
                <DialogDescription>
                  Descreva seu problema ou dúvida para nossa equipe.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    placeholder="Ex: Problema com upload"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Prioridade</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva seu problema em detalhes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateTicket}
                  disabled={!subject || !description || !priority}
                  className="gradient-primary text-primary-foreground"
                >
                  Criar Ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-card border border-border p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{tickets.length}</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4">
            <p className="text-sm text-muted-foreground">Abertos</p>
            <p className="text-2xl font-bold text-warning">
              {tickets.filter(t => t.status === 'open').length}
            </p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4">
            <p className="text-sm text-muted-foreground">Em Andamento</p>
            <p className="text-2xl font-bold text-primary">
              {tickets.filter(t => t.status === 'in_progress').length}
            </p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4">
            <p className="text-sm text-muted-foreground">Resolvidos</p>
            <p className="text-2xl font-bold text-success">
              {tickets.filter(t => t.status === 'resolved').length}
            </p>
          </div>
        </div>

        {/* Tickets list */}
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-xl bg-card border border-border p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      <span className={cn("text-xs font-medium", priorityColors[ticket.priority])}>
                        Prioridade {ticket.priority === 'low' ? 'Baixa' : ticket.priority === 'medium' ? 'Média' : 'Alta'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <StatusBadge status={ticket.status} />
                  <Button variant="ghost" size="sm">
                    Ver detalhes
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tickets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              Nenhum ticket encontrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Crie um ticket para entrar em contato com o suporte
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
