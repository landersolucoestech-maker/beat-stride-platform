import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, FileVideo, Megaphone, Plus, Send } from "lucide-react";
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
  useCampaignContents,
  useCreateCampaignContent,
  useCreatePublicationPlan,
  useMarketingCampaigns,
} from "@/features/marketing/use-marketing";
import type {
  MarketingCampaignContentView,
  MarketingContentType,
  MarketingPublicationChannel,
} from "@/features/marketing/marketing.types";

const contentTypes: Array<{ value: MarketingContentType; label: string }> = [
  { value: "TEASER", label: "Teaser" },
  { value: "TRAILER", label: "Trailer" },
  { value: "MUSIC_VIDEO", label: "Clipe" },
  { value: "VISUALIZER", label: "Visualizer" },
  { value: "LYRIC_VIDEO", label: "Lyric video" },
  { value: "SHORT_VIDEO", label: "Vídeo curto" },
  { value: "REEL", label: "Reel" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE_SHORT", label: "YouTube Short" },
  { value: "STORY", label: "Story" },
  { value: "FEED_POST", label: "Post de feed" },
  { value: "CAROUSEL", label: "Carrossel" },
  { value: "BEHIND_THE_SCENES", label: "Bastidores" },
  { value: "AUDIO_SNIPPET", label: "Trecho de áudio" },
  { value: "ANNOUNCEMENT", label: "Anúncio do lançamento" },
  { value: "OTHER", label: "Outro" },
];

const channels: Array<{ value: MarketingPublicationChannel; label: string }> = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "YOUTUBE_SHORTS", label: "YouTube Shorts" },
];

function contentTypeLabel(type: MarketingContentType): string {
  return contentTypes.find((option) => option.value === type)?.label ?? type;
}

function publicationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PLANNED: "Planejado",
    READY: "Pronto",
    SCHEDULED: "Agendado",
    PUBLISHING: "Publicando",
    PUBLISHED: "Publicado",
    FAILED: "Falhou",
    CANCELLED: "Cancelado",
  };
  return labels[status] ?? status;
}

function PublicationPlanner({
  campaignId,
  content,
}: {
  campaignId: string;
  content: MarketingCampaignContentView;
}) {
  const mutation = useCreatePublicationPlan(campaignId);
  const [channel, setChannel] = useState<MarketingPublicationChannel | "">("");
  const [scheduledFor, setScheduledFor] = useState("");

  const submit = async () => {
    if (!channel) return;
    try {
      await mutation.mutateAsync({
        contentId: content.id,
        channel,
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
      });
      setChannel("");
      setScheduledFor("");
      toast.success("Publicação adicionada ao planejamento.");
    } catch {
      toast.error("Não foi possível planejar a publicação.");
    }
  };

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium text-foreground">Planejar publicação</p>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <Select value={channel} onValueChange={(value) => setChannel(value as MarketingPublicationChannel)}>
          <SelectTrigger>
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            {channels.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="datetime-local"
          value={scheduledFor}
          onChange={(event) => setScheduledFor(event.target.value)}
          aria-label="Data e hora planejadas"
        />
        <Button onClick={() => void submit()} disabled={!channel || mutation.isPending}>
          <Send className="mr-2 h-4 w-4" />
          {mutation.isPending ? "Salvando..." : scheduledFor ? "Agendar" : "Planejar"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Esta etapa registra o plano. A publicação automática só será executada quando o canal possuir uma integração autorizada e ativa.
      </p>
    </div>
  );
}

export default function ContentCampaign() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const campaignsQuery = useMarketingCampaigns();
  const contentsQuery = useCampaignContents(campaignId);
  const createContent = useCreateCampaignContent(campaignId ?? "");
  const [contentType, setContentType] = useState<MarketingContentType>("TEASER");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const campaign = useMemo(
    () => campaignsQuery.data?.items.find((item) => item.id === campaignId) ?? null,
    [campaignId, campaignsQuery.data?.items],
  );

  const submitContent = async () => {
    if (!campaignId || !title.trim()) return;
    try {
      await createContent.mutateAsync({
        contentType,
        title: title.trim(),
        notes: notes.trim() || null,
      });
      setTitle("");
      setNotes("");
      setContentType("TEASER");
      toast.success("Conteúdo adicionado à campanha.");
    } catch {
      toast.error("Não foi possível adicionar o conteúdo.");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/marketing/start" aria-label="Voltar para Iniciar Marketing">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <Megaphone className="h-4 w-4" />
              Marketing
            </div>
            <h1 className="text-2xl font-bold text-foreground">Conteúdos & Publicações</h1>
            <p className="text-muted-foreground">
              {campaign ? `Planejamento promocional de ${campaign.releaseTitle}.` : "Planejamento de conteúdos do lançamento."}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Adicionar conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de conteúdo</Label>
                <Select value={contentType} onValueChange={(value) => setContentType(value as MarketingContentType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketing-content-title">Título da peça</Label>
                <Input
                  id="marketing-content-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex.: Teaser do refrão — 15s"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketing-content-notes">Briefing / observações</Label>
              <Textarea
                id="marketing-content-notes"
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Mensagem, trecho a destacar, orientação de edição, CTA e outras observações..."
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                O arquivo audiovisual será anexado pelo pipeline de assets da campanha; este formulário cria primeiro o item de planejamento.
              </p>
              <Button onClick={() => void submitContent()} disabled={!title.trim() || createContent.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                {createContent.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Conteúdos planejados</h2>
            <p className="text-sm text-muted-foreground">
              Organize cada peça do release e os canais onde ela deverá ser publicada.
            </p>
          </div>

          {contentsQuery.isLoading ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              Carregando conteúdos...
            </div>
          ) : (contentsQuery.data?.items.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <FileVideo className="mx-auto h-7 w-7 text-muted-foreground" />
              <h3 className="mt-3 font-medium text-foreground">Nenhum conteúdo planejado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Adicione o primeiro teaser, vídeo, Reel, TikTok, Short ou outra peça desta campanha.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contentsQuery.data?.items.map((content) => (
                <Card key={content.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">{content.title}</CardTitle>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">{contentTypeLabel(content.contentType)}</Badge>
                          <Badge variant="outline">{content.status === "DRAFT" ? "Rascunho" : content.status}</Badge>
                          {content.assetFileName && <Badge variant="outline">{content.assetFileName}</Badge>}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(content.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {content.notes && <p className="text-sm text-muted-foreground">{content.notes}</p>}

                    {content.publications.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-foreground">Publicações</p>
                        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                          {content.publications.map((publication) => (
                            <div key={publication.id} className="rounded-lg border border-border p-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium">
                                  {channels.find((channel) => channel.value === publication.channel)?.label ?? publication.channel}
                                </span>
                                <Badge variant="outline">{publicationStatusLabel(publication.status)}</Badge>
                              </div>
                              <p className="mt-2 text-xs text-muted-foreground">
                                {publication.scheduledFor
                                  ? new Date(publication.scheduledFor).toLocaleString("pt-BR")
                                  : "Sem data definida"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {campaignId && <PublicationPlanner campaignId={campaignId} content={content} />}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
