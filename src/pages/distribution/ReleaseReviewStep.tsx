import { AlertTriangle, CheckCircle2, Disc3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PrototypeDistributionPreferences } from "./ReleaseDistributionStep";
import type { PrototypeTrack } from "./ReleaseTracksStep";

interface ReleaseReviewStepProps {
  title: string;
  releaseType: string;
  mainArtist: string;
  variousArtists: boolean;
  albumArtistNames: string[];
  recordLabel: string;
  copyrightReleaseYear: string;
  copyrightRecordingYear: string;
  copyrightHolder: string;
  ownUpc: boolean;
  upc: string;
  coverFile: File | null;
  coverPreview: string;
  tracks: PrototypeTrack[];
  distribution: PrototypeDistributionPreferences;
  onEditStep: (step: number) => void;
}

const RELEASE_TYPE_LABELS: Record<string, string> = {
  single: "Single",
  ep: "EP",
  album: "Álbum",
  compilation: "Coletânea",
  live: "Ao vivo",
  music_video: "Videoclipe",
  other: "Outro",
};

const DISTRIBUTOR_LABELS: Record<string, string> = {
  onerpm: "ONErpm",
  symphonic: "Symphonic",
  soundon: "SoundOn",
};

const TERRITORY_LABELS: Record<string, string> = {
  worldwide: "Mundo / Global",
  brazil: "Brasil",
  "united-states": "Estados Unidos",
  "latin-america": "América Latina",
  europe: "Europa",
};

const EXPLICIT_LABELS: Record<string, string> = {
  none: "Não",
  explicit: "Explícito",
  clean: "Versão Limpa",
};

export function getReleaseReviewIssues({
  title,
  mainArtist,
  variousArtists,
  recordLabel,
  copyrightReleaseYear,
  copyrightRecordingYear,
  coverFile,
  tracks,
  distribution,
}: Pick<
  ReleaseReviewStepProps,
  | "title"
  | "mainArtist"
  | "variousArtists"
  | "recordLabel"
  | "copyrightReleaseYear"
  | "copyrightRecordingYear"
  | "coverFile"
  | "tracks"
  | "distribution"
>) {
  const issues: string[] = [];

  if (!title.trim()) issues.push("Informe o título do lançamento.");
  if (!variousArtists && !mainArtist.trim()) issues.push("Selecione o artista principal.");
  if (!recordLabel.trim()) issues.push("Informe a gravadora ou selo.");
  if (!copyrightReleaseYear.trim()) issues.push("Informe o ano de copyright do lançamento.");
  if (!copyrightRecordingYear.trim()) issues.push("Informe o ano de copyright da gravação.");
  if (!coverFile) issues.push("Adicione a capa do lançamento.");
  if (!distribution.releaseDate) issues.push("Defina a data de lançamento.");

  tracks.forEach((track, index) => {
    if (!track.title.trim()) issues.push(`Faixa ${index + 1}: informe o título.`);
    if (!track.primaryGenre.trim()) issues.push(`Faixa ${index + 1}: selecione o gênero.`);
    if (!track.secondaryGenre.trim()) issues.push(`Faixa ${index + 1}: selecione o gênero secundário.`);
    if (!track.language.trim()) issues.push(`Faixa ${index + 1}: selecione o idioma.`);
    if (!track.aiUsage.trim()) {
      issues.push(`Faixa ${index + 1}: informe a declaração de uso de IA.`);
    }
  });

  return issues;
}

export function ReleaseReviewStep(props: ReleaseReviewStepProps) {
  const issues = getReleaseReviewIssues(props);
  const {
    title,
    releaseType,
    mainArtist,
    variousArtists,
    albumArtistNames,
    recordLabel,
    copyrightReleaseYear,
    copyrightRecordingYear,
    copyrightHolder,
    ownUpc,
    upc,
    coverPreview,
    tracks,
    distribution,
    onEditStep,
  } = props;

  const releaseArtist = variousArtists
    ? "Various Artists"
    : mainArtist || "Artista não informado";

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Revisão</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Faça a conferência final das informações antes de criar o lançamento.
        </p>
      </div>

      {issues.length === 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="font-medium text-foreground">
              Lançamento pronto para ser criado
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Todos os campos obrigatórios desta etapa de protótipo foram preenchidos.
            </p>
          </div>
        </div>
      ) : (
        <section className="rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-foreground">
                {issues.length} {issues.length === 1 ? "pendência encontrada" : "pendências encontradas"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Corrija os itens abaixo antes de criar o lançamento.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {issues.map((issue, index) => (
              <div
                key={issue}
                className="flex items-start gap-2 rounded-lg border border-warning/20 bg-background/60 px-3 py-2.5 text-sm text-muted-foreground"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning/10 text-[10px] font-semibold text-warning">
                  {index + 1}
                </span>
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/15 px-5 py-4">
          <div>
            <h4 className="font-semibold text-foreground">Lançamento</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Identidade, artistas e direitos principais.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => onEditStep(0)}>
            Editar lançamento
          </Button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
            <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt={title || "Capa do lançamento"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <Disc3 className="h-10 w-10 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground">Sem capa</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Badge variant="secondary">
                {RELEASE_TYPE_LABELS[releaseType] ?? releaseType}
              </Badge>
              <h4 className="mt-2 truncate text-base font-semibold text-foreground">
                {title || "Título não informado"}
              </h4>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {releaseArtist}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {tracks.length} {tracks.length === 1 ? "faixa" : "faixas"}
              </p>
            </div>
          </div>

          <div className="p-5">
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Artistas do lançamento
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {albumArtistNames.length
                    ? albumArtistNames.join(", ")
                    : "Não informado"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Gravadora / Selo
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {recordLabel || "Não informado"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Copyright do lançamento
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  © {copyrightReleaseYear || "—"}{" "}
                  {copyrightHolder || recordLabel || "Titular não informado"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Copyright da gravação
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  ℗ {copyrightRecordingYear || "—"}{" "}
                  {copyrightHolder || recordLabel || "Titular não informado"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  UPC
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {ownUpc
                    ? upc || "Não informado"
                    : "Gerado automaticamente"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h4 className="font-semibold text-foreground">Distribuição</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Destino, território e programação escolhidos para o lançamento.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => onEditStep(3)}>
            Editar distribuição
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/15 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Distribuidora
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {distribution.distributor
                ? DISTRIBUTOR_LABELS[distribution.distributor] ??
                  distribution.distributor
                : "Controle interno"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/15 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Território
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {TERRITORY_LABELS[distribution.territory] ??
                distribution.territory}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/15 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Data
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {distribution.releaseDate || "Não definida"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/15 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Hora / Fuso
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {distribution.releaseTime || "Sem hora"}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {distribution.timezone}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant={distribution.preOrder ? "secondary" : "outline"}>
            {distribution.preOrder ? "Pré-venda habilitada" : "Sem pré-venda"}
          </Badge>
          {distribution.preOrder && distribution.disablePreviews && (
            <Badge variant="outline">Prévia desabilitada</Badge>
          )}
          <Badge variant="outline">
            Precificação: {distribution.pricing}
          </Badge>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h4 className="font-semibold text-foreground">Faixas</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Confira metadados e arquivo de cada música.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {tracks.length} {tracks.length === 1 ? "faixa" : "faixas"}
            </Badge>
            <Button type="button" variant="outline" size="sm" onClick={() => onEditStep(1)}>
              Editar faixas
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {tracks.map((track, index) => {
            const artistName = [
              variousArtists ? "Various Artists" : mainArtist,
              ...track.additionalArtists
                .map((artist) => artist.name)
                .filter(Boolean),
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <article
                key={track.id}
                className="overflow-hidden rounded-lg border border-border"
              >
                <div className="flex items-start gap-3 bg-muted/15 px-4 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">
                        {track.title || "Faixa sem título"}
                      </p>
                      {track.alternativeVersion && track.versionName && (
                        <Badge variant="outline">{track.versionName}</Badge>
                      )}
                      {track.audioFile ? (
                        <Badge variant="secondary">Áudio anexado</Badge>
                      ) : (
                        <Badge variant="outline">Sem áudio</Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {artistName || "Artista não informado"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 px-4 py-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Gêneros
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {track.primaryGenre || "—"} / {track.secondaryGenre || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Idioma
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {track.language || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      ISRC
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {track.isrc || "Não informado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Conteúdo
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {EXPLICIT_LABELS[track.explicit] ?? track.explicit}
                    </p>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Uso de IA
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {track.aiUsage || "Não informado"}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {distribution.notes && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h4 className="font-semibold text-foreground">
            Notas de distribuição
          </h4>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {distribution.notes}
          </p>
        </section>
      )}
    </div>
  );
}
