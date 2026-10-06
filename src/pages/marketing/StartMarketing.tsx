import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Link as LinkIcon,
  Megaphone,
  Music,
  Radio,
  Rocket,
  Users,
  Video,
} from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreatorsIntegrationOverview } from "@/features/creators-integration/use-creators-integration";
import { useMarketingOverview } from "@/features/marketing/use-marketing";

const promotionalContentTypes = [
  "Teaser",
  "Trailer",
  "Clipe",
  "Visualizer",
  "Lyric video",
  "Reel",
  "TikTok",
  "YouTube Short",
  "Story",
  "Corte vertical",
  "Bastidores",
  "Trecho de áudio",
];

export default function StartMarketing() {
  const marketingQuery = useMarketingOverview();
  const creatorsQuery = useCreatorsIntegrationOverview();
  const data = marketingQuery.data;
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null);

  const selectedRelease = useMemo(
    () => data?.releases.find((release) => release.id === selectedReleaseId) ?? null,
    [data?.releases, selectedReleaseId],
  );
  const creatorsConnected = creatorsQuery.data?.connection.status === "CONNECTED";

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Megaphone className="h-4 w-4" />
            Marketing
          </div>
          <h1 className="text-2xl font-bold text-foreground">Iniciar Marketing</h1>
          <p className="text-muted-foreground">
            Selecione um lançamento e escolha os recursos que serão usados na divulgação.
          </p>
        </div>

        {!marketingQuery.isLoading && data?.available === false && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            O backend de marketing nativo ainda não está conectado ao preview. Nenhum orçamento, campanha ou resultado fictício é exibido.
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              1. Escolha o lançamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {marketingQuery.isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
            ) : (data?.releases.length ?? 0) === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhum lançamento disponível.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {data?.releases.map((release) => {
                  const selected = release.id === selectedReleaseId;
                  return (
                    <button
                      key={release.id}
                      type="button"
                      onClick={() => setSelectedReleaseId(release.id)}
                      className={
                        "rounded-xl border p-4 text-left transition-colors " +
                        (selected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/40")
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{release.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {release.artistName || "Artista não informado"}
                          </p>
                        </div>
                        {selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />}
                      </div>
                      {release.releaseDate && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Lançamento:{" "}
                          {new Date(`${release.releaseDate}T00:00:00Z`).toLocaleDateString("pt-BR", {
                            timeZone: "UTC",
                          })}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedRelease && (
          <>
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">2. Escolha como promover</h2>
                <p className="text-sm text-muted-foreground">
                  Recursos disponíveis para <span className="font-medium text-foreground">{selectedRelease.title}</span>.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data?.actions.map((action) => (
                  <Card key={action.code}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          {action.code === "PRE_SAVE" ? (
                            <LinkIcon className="h-4 w-4 text-primary" />
                          ) : action.code === "PLAYLIST_TRACKING" ? (
                            <Radio className="h-4 w-4 text-primary" />
                          ) : (
                            <Rocket className="h-4 w-4 text-primary" />
                          )}
                          {action.label}
                        </CardTitle>
                        <Badge variant="outline">{action.enabled ? "Disponível" : "Em preparação"}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </CardContent>
                  </Card>
                ))}

                <Card className="border-primary/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Video className="h-4 w-4 text-primary" />
                        Conteúdos & Publicações
                      </CardTitle>
                      <Badge variant="outline">Planejamento</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Planeje o marketing de conteúdos audiovisuais e peças promocionais vinculadas a este release.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {promotionalContentTypes.map((type) => (
                        <Badge key={type} variant="secondary" className="font-normal">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-xs text-muted-foreground">
                        Calendário, agendamento e publicação direta serão habilitados por canal somente quando a integração autorizada do respectivo provedor estiver disponível.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {creatorsConnected && (
                  <Card className="border-primary/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Users className="h-4 w-4 text-primary" />
                          Lander Creators
                        </CardTitle>
                        <Badge variant="outline">Conectado</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Promova este lançamento com creators usando a conta conectada em Configurações → Integrações.
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Pacotes, checkout, execução, entregáveis, pagamentos e resultados permanecem autoritativos na Lander Creators.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-foreground">Conteúdo da campanha</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                O release é o contexto central. Conteúdos promocionais podem referenciar a música, um vídeo oficial ou outro ativo audiovisual sem se tornarem, por isso, um novo lançamento de distribuição.
              </p>
            </section>
          </>
        )}
      </div>
    </MainLayout>
  );
}
