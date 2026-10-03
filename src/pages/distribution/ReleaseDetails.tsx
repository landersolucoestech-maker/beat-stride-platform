import { ArrowLeft, CheckCircle2, Disc3, Loader2, ShieldAlert } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCatalogRelease, useReleaseReadiness, useSubmitRelease } from "@/features/catalog/use-release-workflow";
import { useToast } from "@/hooks/use-toast";

const blockerLabels: Record<string, string> = {
  RELEASE_STATE_NOT_SUBMITTABLE: "O estado atual do lançamento não permite envio.",
  PRIMARY_ARTIST_REQUIRED: "Defina o artista principal.",
  RELEASE_DATE_REQUIRED: "Defina a data de lançamento.",
  PRIMARY_GENRE_REQUIRED: "Defina o gênero principal.",
  LANGUAGE_REQUIRED: "Defina o idioma do lançamento.",
  COPYRIGHT_LINE_REQUIRED: "Informe a linha de copyright.",
  PHONOGRAPHIC_COPYRIGHT_LINE_REQUIRED: "Informe a linha de copyright fonográfico.",
  TRACK_REQUIRED: "Adicione pelo menos uma faixa.",
  ARTWORK_UPLOAD_REQUIRED: "Finalize o envio e a validação da capa.",
  AUDIO_MASTER_UPLOAD_REQUIRED: "Finalize o envio e a validação do áudio de todas as faixas.",
  DISTRIBUTION_RIGHTS_REQUIRED: "Registre uma declaração ativa de direitos de distribuição do master.",
  DISTRIBUTION_AUTHORITY_REQUIRED: "A autoridade para enviar este artista à distribuição precisa estar verificada.",
};

export default function ReleaseDetails() {
  const { releaseId = "" } = useParams();
  const { toast } = useToast();
  const releaseQuery = useCatalogRelease(releaseId);
  const readinessQuery = useReleaseReadiness(releaseId);
  const submitMutation = useSubmitRelease(releaseId);
  const release = releaseQuery.data;
  const readiness = readinessQuery.data;
  const previewUnavailable = readiness?.available === false;

  const submit = async () => {
    if (!readiness?.available || !readiness.ready) return;
    try {
      await submitMutation.mutateAsync(readiness.version);
      toast({
        title: "Lançamento enviado para validação",
        description: "A versão atual entrou no fluxo de QC. Nenhuma entrega a DSP foi iniciada automaticamente.",
      });
    } catch {
      toast({
        title: "Não foi possível enviar o lançamento",
        description: "O estado ou os requisitos podem ter mudado. Atualize a página e revise as pendências.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/distribution/music"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-foreground">{release?.title ?? "Detalhes do lançamento"}</h1>
            <p className="text-muted-foreground">Revise a versão atual, as exigências de autoridade e a prontidão para QC.</p>
          </div>
        </div>

        {releaseQuery.isLoading ? (
          <div className="h-52 animate-pulse rounded-xl border border-border bg-card" />
        ) : releaseQuery.isError ? (
          <div className="rounded-xl border border-destructive/20 bg-card p-10 text-center">
            <ShieldAlert className="mx-auto h-7 w-7 text-destructive" />
            <h2 className="mt-3 font-semibold text-foreground">Não foi possível carregar o lançamento</h2>
          </div>
        ) : !release ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <Disc3 className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-4 font-semibold text-foreground">Dados reais indisponíveis neste preview</h2>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-5">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                  {release.coverUrl ? <img src={release.coverUrl} alt={release.title} className="h-full w-full object-cover" /> : <Disc3 className="h-8 w-8 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{release.type}</p>
                  <h2 className="mt-1 truncate text-xl font-semibold text-foreground">{release.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{release.artistName}</p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Status: {release.status}</span>
                    <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Data: {release.releaseDate ?? "não definida"}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-foreground">Prontidão para envio</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Validação prévia sem alterar o status.</p>
                </div>
                {readinessQuery.isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : readiness?.ready ? <CheckCircle2 className="h-6 w-6 text-success" /> : <ShieldAlert className="h-6 w-6 text-warning" />}
              </div>

              {previewUnavailable ? (
                <p className="mt-5 text-sm text-muted-foreground">O GitHub Pages não possui backend. Nenhum requisito é simulado como concluído.</p>
              ) : readiness?.ready ? (
                <div className="mt-5">
                  <p className="text-sm text-foreground">Todos os requisitos verificáveis estão atendidos para esta versão.</p>
                  <Button className="mt-4 w-full gradient-primary text-primary-foreground" disabled={submitMutation.isPending} onClick={() => void submit()}>
                    {submitMutation.isPending ? "Enviando..." : "Enviar para QC"}
                  </Button>
                </div>
              ) : (
                <div className="mt-5 space-y-2">
                  {(readiness?.blockers ?? []).map((blocker) => (
                    <div key={blocker.code} className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                      {blockerLabels[blocker.code] ?? blocker.message}
                    </div>
                  ))}
                  {!readinessQuery.isLoading && readiness?.available && readiness.blockers.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma avaliação disponível.</p>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
