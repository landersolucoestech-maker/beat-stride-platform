import { AlertTriangle, CheckCircle2, Disc3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { PrototypeDistributionPreferences } from "./ReleaseDistributionStep";
import type { PrototypeTrack } from "./ReleaseTracksStep";

interface ReleaseReviewStepProps {
  title: string;
  releaseType: string;
  mainArtist: string;
  variousArtists: boolean;
  albumArtistNames: string[];
  primaryGenre: string;
  secondaryGenre: string;
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
  primaryGenre,
  secondaryGenre,
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
  | "primaryGenre"
  | "secondaryGenre"
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
  if (!primaryGenre.trim()) issues.push("Selecione o gênero principal.");
  if (!secondaryGenre.trim()) issues.push("Selecione o gênero secundário.");
  if (!recordLabel.trim()) issues.push("Informe a gravadora ou selo.");
  if (!copyrightReleaseYear.trim()) issues.push("Informe o ano de copyright do lançamento.");
  if (!copyrightRecordingYear.trim()) issues.push("Informe o ano de copyright da gravação.");
  if (!coverFile) issues.push("Adicione a capa do lançamento.");
  if (!distribution.releaseDate) issues.push("Defina a data de lançamento.");

  tracks.forEach((track, index) => {
    if (!track.title.trim()) issues.push(`Faixa ${index + 1}: informe o título.`);
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
    primaryGenre,
    secondaryGenre,
    recordLabel,
    copyrightReleaseYear,
    copyrightRecordingYear,
    copyrightHolder,
    ownUpc,
    upc,
    coverPreview,
    tracks,
    distribution,
  } = props;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Revisão</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Confira as informações antes de criar o lançamento no protótipo.
        </p>
      </div>

      {issues.length === 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="font-medium text-foreground">
              Tudo certo! O lançamento está pronto para ser criado.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              A ação final neste momento é apenas simulada no frontend.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <p className="font-medium text-foreground">Pendências para revisar</p>
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {issues.map((issue) => <li key={issue}>{issue}</li>)}
          </ul>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt={title || "Capa do lançamento"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Disc3 className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="mt-4">
            <Badge variant="secondary">
              {RELEASE_TYPE_LABELS[releaseType] ?? releaseType}
            </Badge>
            <h4 className="mt-2 font-semibold text-foreground">
              {title || "Título não informado"}
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {variousArtists ? "Various Artists" : mainArtist || "Artista não informado"}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h4 className="font-semibold text-foreground">Resumo do lançamento</h4>

          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Artistas</p>
              <p className="mt-1 font-medium text-foreground">
                {albumArtistNames.length ? albumArtistNames.join(", ") : "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Gravadora / Selo</p>
              <p className="mt-1 font-medium text-foreground">{recordLabel || "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Gêneros</p>
              <p className="mt-1 font-medium text-foreground">
                {[primaryGenre, secondaryGenre].filter(Boolean).join(" / ") || "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Distribuidora</p>
              <p className="mt-1 font-medium text-foreground">
                {distribution.distributor
                  ? DISTRIBUTOR_LABELS[distribution.distributor] ?? distribution.distributor
                  : "Somente controle interno"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Data</p>
              <p className="mt-1 font-medium text-foreground">
                {distribution.releaseDate || "Não definida"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Hora / Fuso</p>
              <p className="mt-1 font-medium text-foreground">
                {distribution.releaseTime || "Sem hora definida"} · {distribution.timezone}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Território</p>
              <p className="mt-1 font-medium text-foreground">
                {TERRITORY_LABELS[distribution.territory] ?? distribution.territory}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">UPC</p>
              <p className="mt-1 font-medium text-foreground">
                {ownUpc ? upc || "Não informado" : "Gerado automaticamente"}
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-muted/30 p-3">
                <span className="text-muted-foreground">©</span>
                <p className="mt-1 font-medium text-foreground">
                  {copyrightReleaseYear || "—"} {copyrightHolder || recordLabel || "Titular não informado"}
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <span className="text-muted-foreground">℗</span>
                <p className="mt-1 font-medium text-foreground">
                  {copyrightRecordingYear || "—"} {copyrightHolder || recordLabel || "Titular não informado"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h4 className="font-semibold text-foreground">Faixas</h4>
        <div className="mt-4 space-y-3">
          {tracks.map((track, index) => {
            const artistName =
              track.trackArtistName ||
              [
                variousArtists ? "Various Artists" : mainArtist,
                ...track.additionalArtists.map((artist) => artist.name).filter(Boolean),
              ]
                .filter(Boolean)
                .join(", ");

            return (
              <div
                key={track.id}
                className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 md:grid-cols-[48px_1fr_auto]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-sm font-semibold text-muted-foreground">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {track.title || "Faixa sem título"}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {artistName || "Artista não informado"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>ISRC: {track.isrc || "Não informado"}</span>
                    <span>•</span>
                    <span>{EXPLICIT_LABELS[track.explicit] ?? track.explicit}</span>
                    <span>•</span>
                    <span>{track.aiUsage || "IA não informada"}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {track.audioFile?.name ?? "Sem áudio"}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {distribution.notes && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h4 className="font-semibold text-foreground">Notas de distribuição</h4>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {distribution.notes}
          </p>
        </section>
      )}
    </div>
  );
}
