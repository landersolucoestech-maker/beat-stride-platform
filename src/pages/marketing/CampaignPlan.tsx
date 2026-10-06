import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  Megaphone,
  Plus,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCampaignCalendar,
  useCampaignTasks,
  useCreateCampaignTask,
  useMarketingCampaigns,
  useUpdateCampaignTaskStatus,
} from "@/features/marketing/use-marketing";
import type {
  MarketingCampaignPhase,
  MarketingCampaignTaskCategory,
  MarketingCampaignTaskStatus,
  MarketingCampaignTaskView,
} from "@/features/marketing/marketing.types";

const phases: Array<{ value: MarketingCampaignPhase; label: string }> = [
  { value: "PRE_RELEASE", label: "Pré-lançamento" },
  { value: "RELEASE_DAY", label: "Dia do lançamento" },
  { value: "POST_RELEASE", label: "Pós-lançamento" },
  { value: "ONGOING", label: "Contínuo" },
];

const categories: Array<{ value: MarketingCampaignTaskCategory; label: string }> = [
  { value: "CONTENT", label: "Conteúdo" },
  { value: "DSP", label: "DSP / Pitch" },
  { value: "SMART_LINK", label: "Smart Link / Pré-save" },
  { value: "SOCIAL", label: "Redes sociais" },
  { value: "ADS", label: "Publicidade" },
  { value: "CREATORS", label: "Creators" },
  { value: "AUDIENCE", label: "Audiência" },
  { value: "PLAYLIST", label: "Playlists" },
  { value: "OTHER", label: "Outro" },
];

const taskStatusLabels: Record<MarketingCampaignTaskStatus, string> = {
  TODO: "A fazer",
  IN_PROGRESS: "Em andamento",
  BLOCKED: "Bloqueada",
  DONE: "Concluída",
  CANCELLED: "Cancelada",
};

function TaskCard({
  campaignId,
  task,
}: {
  campaignId: string;
  task: MarketingCampaignTaskView;
}) {
  const mutation = useUpdateCampaignTaskStatus(campaignId);

  const update = async (status: MarketingCampaignTaskStatus) => {
    try {
      await mutation.mutateAsync({ taskId: task.id, status });
      toast.success("Status da tarefa atualizado.");
    } catch {
      toast.error("Não foi possível atualizar a tarefa.");
    }
  };

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{task.title}</p>
            <Badge variant="secondary">
              {categories.find((item) => item.value === task.category)?.label ?? task.category}
            </Badge>
          </div>
          {task.description && <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{taskStatusLabels[task.status]}</span>
            {task.dueAt && <span>Prazo: {new Date(task.dueAt).toLocaleString("pt-BR")}</span>}
          </div>
        </div>
        <Badge variant="outline">{taskStatusLabels[task.status]}</Badge>
      </div>

      {!["DONE", "CANCELLED"].includes(task.status) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {task.status !== "IN_PROGRESS" && (
            <Button size="sm" variant="outline" onClick={() => void update("IN_PROGRESS")} disabled={mutation.isPending}>
              <Clock3 className="mr-2 h-4 w-4" />
              Iniciar
            </Button>
          )}
          {task.status !== "BLOCKED" && (
            <Button size="sm" variant="outline" onClick={() => void update("BLOCKED")} disabled={mutation.isPending}>
              Bloquear
            </Button>
          )}
          <Button size="sm" onClick={() => void update("DONE")} disabled={mutation.isPending}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Concluir
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CampaignPlan() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const campaignsQuery = useMarketingCampaigns();
  const tasksQuery = useCampaignTasks(campaignId);
  const calendarQuery = useCampaignCalendar(campaignId);
  const createTask = useCreateCampaignTask(campaignId ?? "");

  const [phase, setPhase] = useState<MarketingCampaignPhase>("PRE_RELEASE");
  const [category, setCategory] = useState<MarketingCampaignTaskCategory>("CONTENT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");

  const campaign = useMemo(
    () => campaignsQuery.data?.items.find((item) => item.id === campaignId) ?? null,
    [campaignId, campaignsQuery.data?.items],
  );

  const tasksByPhase = useMemo(() => {
    const grouped = new Map<MarketingCampaignPhase, MarketingCampaignTaskView[]>();
    for (const item of phases) grouped.set(item.value, []);
    for (const task of tasksQuery.data?.items ?? []) grouped.get(task.phase)?.push(task);
    return grouped;
  }, [tasksQuery.data?.items]);

  const submitTask = async () => {
    if (!campaignId || !title.trim()) return;
    try {
      await createTask.mutateAsync({
        phase,
        category,
        title: title.trim(),
        description: description.trim() || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        sortOrder: tasksByPhase.get(phase)?.length ?? 0,
      });
      setTitle("");
      setDescription("");
      setDueAt("");
      toast.success("Tarefa adicionada ao plano.");
    } catch {
      toast.error("Não foi possível adicionar a tarefa.");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link to={campaignId ? `/marketing/campaigns/${campaignId}/content` : "/marketing/start"} aria-label="Voltar">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                <Megaphone className="h-4 w-4" />
                Marketing
              </div>
              <h1 className="text-2xl font-bold text-foreground">Plano da Campanha</h1>
              <p className="text-muted-foreground">
                {campaign ? campaign.name : "Planejamento operacional do lançamento."}
              </p>
            </div>
          </div>

          {campaignId && (
            <Button asChild variant="outline">
              <Link to={`/marketing/campaigns/${campaignId}/content`}>Conteúdos & Publicações</Link>
            </Button>
          )}
        </div>

        {campaign && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Lançamento</CardTitle>
              </CardHeader>
              <CardContent><p className="font-medium">{campaign.releaseTitle}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
              </CardHeader>
              <CardContent><Badge variant="outline">{campaign.status}</Badge></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Objetivo</CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm">{campaign.objective ?? "Não definido"}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Orçamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {campaign.budgetMinor !== null && campaign.budgetCurrency
                    ? `${campaign.budgetCurrency} ${(Number(campaign.budgetMinor) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                    : "Não definido"}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Nova tarefa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label>Fase</Label>
                <Select value={phase} onValueChange={(value) => setPhase(value as MarketingCampaignPhase)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {phases.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as MarketingCampaignTaskCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-task-title">Tarefa</Label>
                <Input id="campaign-task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Publicar teaser 15s" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-task-due">Prazo</Label>
                <Input id="campaign-task-due" type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-task-description">Descrição</Label>
              <Textarea id="campaign-task-description" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Instruções, contexto e resultado esperado..." />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => void submitTask()} disabled={!title.trim() || createTask.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                {createTask.isPending ? "Adicionando..." : "Adicionar tarefa"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Fases da campanha</h2>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {phases.filter((item) => item.value !== "ONGOING").map((item) => {
              const tasks = tasksByPhase.get(item.value) ?? [];
              return (
                <Card key={item.value}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-3 text-base">
                      <span>{item.label}</span>
                      <Badge variant="secondary">{tasks.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tasks.length === 0 ? (
                      <div className="py-8 text-center">
                        <Circle className="mx-auto h-5 w-5 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Nenhuma tarefa nesta fase.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasks.map((task) => <TaskCard key={task.id} campaignId={campaignId ?? ""} task={task} />)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {(tasksByPhase.get("ONGOING")?.length ?? 0) > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Contínuo</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {tasksByPhase.get("ONGOING")?.map((task) => <TaskCard key={task.id} campaignId={campaignId ?? ""} task={task} />)}
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Calendário</h2>
              <p className="text-sm text-muted-foreground">Tarefas com prazo e publicações agendadas em uma única linha do tempo.</p>
            </div>
          </div>

          {(calendarQuery.data?.items.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Nenhum item com data definida.
            </div>
          ) : (
            <div className="space-y-3">
              {calendarQuery.data?.items.map((item) => (
                <div key={`${item.sourceType}-${item.id}`} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{item.sourceType === "TASK" ? "Tarefa" : "Publicação"}</Badge>
                      {item.phase && <Badge variant="outline">{phases.find((phase) => phase.value === item.phase)?.label ?? item.phase}</Badge>}
                      {item.channel && <Badge variant="outline">{item.channel}</Badge>}
                    </div>
                    <p className="mt-2 font-medium text-foreground">{item.title}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(item.startsAt).toLocaleString("pt-BR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
