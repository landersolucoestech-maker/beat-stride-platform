import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Info, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArtistLookupField } from "./ArtistLookupField";
import { ReleaseArtworkStep } from "./ReleaseArtworkStep";
import {
  ReleaseDistributionStep,
  type PrototypeDistributionPreferences,
} from "./ReleaseDistributionStep";
import {
  getReleaseReviewIssues,
  ReleaseReviewStep,
} from "./ReleaseReviewStep";
import {
  createPrototypeTrack,
  ReleaseTracksStep,
  type PrototypeTrack,
} from "./ReleaseTracksStep";

const STEPS = [
  "Informações do lançamento",
  "Envio de faixas",
  "Capa do lançamento",
  "Preferências de distribuição",
  "Revisão",
] as const;

const RELEASE_TYPES = [
  { value: "single", label: "Single" },
  { value: "ep", label: "EP" },
  { value: "album", label: "Álbum" },
  { value: "compilation", label: "Coletânea" },
  { value: "live", label: "Ao vivo" },
  { value: "music_video", label: "Videoclipe" },
  { value: "other", label: "Outro" },
] as const;

const SECONDARY_ARTIST_ROLES = [
  "Intérprete",
  "Featuring",
  "Remixer",
] as const;

const INITIAL_MOCK_ARTISTS = [
  "Ayla Martins",
  "Caio Nunes",
  "Davi Luz",
  "Luna Reis",
  "Nilo",
] as const;

interface AdditionalArtist {
  id: string;
  name: string;
  role: string;
}

export interface PrototypeReleaseDraft {
  id: string;
  title: string;
  artistName: string;
  type: string;
  releaseDate: string | null;
  coverUrl: string | null;
  status: "SUBMITTED";
}

interface ReleaseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDraft: (draft: PrototypeReleaseDraft) => void;
}

export function ReleaseFormModal({
  open,
  onOpenChange,
  onCreateDraft,
}: ReleaseFormModalProps) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [releaseType, setReleaseType] = useState("single");
  const [variousArtists, setVariousArtists] = useState(false);
  const [mainArtist, setMainArtist] = useState("");
  const [artistBase, setArtistBase] = useState<string[]>([...INITIAL_MOCK_ARTISTS]);
  const [additionalArtists, setAdditionalArtists] = useState<AdditionalArtist[]>([]);
  const [recordLabel, setRecordLabel] = useState("");
  const [copyrightReleaseYear, setCopyrightReleaseYear] = useState("2026");
  const [copyrightRecordingYear, setCopyrightRecordingYear] = useState("2026");
  const [copyrightHolder, setCopyrightHolder] = useState("");
  const [ownUpc, setOwnUpc] = useState(false);
  const [upc, setUpc] = useState("");
  const [tracks, setTracks] = useState<PrototypeTrack[]>([createPrototypeTrack()]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [distribution, setDistribution] = useState<PrototypeDistributionPreferences>({
    distributor: "",
    territory: "worldwide",
    releaseDate: "",
    releaseTime: "",
    timezone: "America/Sao_Paulo",
    preOrder: false,
    disablePreviews: false,
    pricing: "standard",
    notes: "",
  });

  const albumArtistNames = useMemo(() => {
    const names = new Set<string>();
    if (variousArtists) names.add("Various Artists");
    if (!variousArtists && mainArtist) names.add(mainArtist);
    additionalArtists.forEach((artist) => {
      if (artist.name) names.add(artist.name);
    });
    return Array.from(names);
  }, [additionalArtists, mainArtist, variousArtists]);

  const reviewIssues = useMemo(
    () =>
      getReleaseReviewIssues({
        title,
        mainArtist,
        variousArtists,
        recordLabel,
        copyrightReleaseYear,
        copyrightRecordingYear,
        coverFile,
        tracks,
        distribution,
      }),
    [
      copyrightRecordingYear,
      copyrightReleaseYear,
      coverFile,
      distribution,
      mainArtist,
      recordLabel,
      title,
      tracks,
      variousArtists,
    ],
  );

  const addArtistToBase = (artistName: string) => {
    setArtistBase((current) =>
      current.some(
        (artist) =>
          artist.toLocaleLowerCase("pt-BR") === artistName.toLocaleLowerCase("pt-BR"),
      )
        ? current
        : [...current, artistName],
    );
  };

  const addArtist = () => {
    setAdditionalArtists((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        role: "",
      },
    ]);
  };

  const updateArtist = (id: string, updates: Partial<AdditionalArtist>) => {
    setAdditionalArtists((current) =>
      current.map((artist) => (artist.id === id ? { ...artist, ...updates } : artist)),
    );
  };

  const removeArtist = (id: string) => {
    setAdditionalArtists((current) => current.filter((artist) => artist.id !== id));
  };

  const closeModal = () => {
    setStep(0);
    onOpenChange(false);
  };

  const resetReleaseForm = () => {
    setTitle("");
    setReleaseType("single");
    setVariousArtists(false);
    setMainArtist("");
    setAdditionalArtists([]);
    setRecordLabel("");
    setCopyrightReleaseYear("2026");
    setCopyrightRecordingYear("2026");
    setCopyrightHolder("");
    setOwnUpc(false);
    setUpc("");
    setTracks([createPrototypeTrack()]);
    setCoverFile(null);
    setCoverPreview("");
    setDistribution({
      distributor: "",
      territory: "worldwide",
      releaseDate: "",
      releaseTime: "",
      timezone: "America/Sao_Paulo",
      preOrder: false,
      disablePreviews: false,
      pricing: "standard",
      notes: "",
    });
  };

  const createDraftAndClose = () => {
    const releaseTypeLabel =
      RELEASE_TYPES.find((item) => item.value === releaseType)?.label ?? releaseType;

    onCreateDraft({
      id: `prototype-${crypto.randomUUID()}`,
      title: title.trim(),
      artistName: variousArtists ? "Various Artists" : mainArtist.trim(),
      type: releaseTypeLabel,
      releaseDate: distribution.releaseDate || null,
      coverUrl: coverPreview || null,
      status: "SUBMITTED",
    });

    resetReleaseForm();
    closeModal();
  };

  const renderStepOne = () => (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            1
          </span>
          <div>
            <h3 className="font-semibold text-foreground">Dados do lançamento</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Identificação geral do Single, EP ou Álbum.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.7fr)]">
          <div>
            <Label htmlFor="release-title">Título do lançamento *</Label>
            <Input
              id="release-title"
              className="mt-1.5"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Digite o título do lançamento"
            />
          </div>

          <div>
            <Label>Tipo de lançamento *</Label>
            <Select value={releaseType} onValueChange={setReleaseType}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RELEASE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/20 p-4">
              <Checkbox
                checked={variousArtists}
                onCheckedChange={(checked) => setVariousArtists(checked === true)}
                className="mt-0.5"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  Various Artists
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Use somente quando o lançamento for uma coletânea com vários artistas principais.
                </span>
              </span>
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            2
          </span>
          <div>
            <h3 className="font-semibold text-foreground">Artistas</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Defina primeiro o artista principal e, se necessário, adicione artistas secundários.
            </p>
          </div>
        </div>

        {!variousArtists && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Label>Artista Principal *</Label>
              <Badge variant="secondary">Intérprete</Badge>
            </div>
            <ArtistLookupField
              value={mainArtist}
              artists={artistBase}
              placeholder="Selecionar artista da base"
              onChange={setMainArtist}
              onAddArtistToBase={addArtistToBase}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              O artista principal é automaticamente considerado intérprete neste lançamento.
            </p>
          </div>
        )}

        <div className={cn("mt-5 border-t border-border pt-5", variousArtists && "mt-0 border-t-0 pt-0")}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Artistas Secundários</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Cada artista secundário recebe uma função própria no lançamento.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addArtist}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar artista
            </Button>
          </div>

          {additionalArtists.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/10 px-4 py-5 text-center text-sm text-muted-foreground">
              Nenhum artista secundário adicionado.
            </div>
          ) : (
            <div className="space-y-3">
              {additionalArtists.map((artist, index) => (
                <div
                  key={artist.id}
                  className="rounded-lg border border-border bg-muted/15 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Artista secundário {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArtist(artist.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <div>
                      <Label className="text-xs">Artista</Label>
                      <div className="mt-1.5">
                        <ArtistLookupField
                          value={artist.name}
                          artists={artistBase}
                          placeholder="Selecionar artista da base"
                          onChange={(value) => updateArtist(artist.id, { name: value })}
                          onAddArtistToBase={addArtistToBase}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Função *</Label>
                      <Select
                        value={artist.role || undefined}
                        onValueChange={(value) => updateArtist(artist.id, { role: value })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Selecionar função" />
                        </SelectTrigger>
                        <SelectContent>
                          {SECONDARY_ARTIST_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            3
          </span>
          <div>
            <h3 className="font-semibold text-foreground">Direitos e identificação</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Selo, copyrights e código UPC do lançamento.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="record-label">Gravadora / Selo *</Label>
            <Input
              id="record-label"
              className="mt-1.5"
              value={recordLabel}
              onChange={(event) => setRecordLabel(event.target.value)}
              placeholder="Nome da gravadora ou selo"
            />
            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Artistas independentes podem usar o próprio nome artístico como selo.
            </p>
          </div>

          <div>
            <Label>Titular do Copyright</Label>
            <Input
              className="mt-1.5"
              value={copyrightHolder}
              onChange={(event) => setCopyrightHolder(event.target.value)}
              placeholder="Nome do titular dos direitos"
            />
          </div>

          <div>
            <Label>Ano de Copyright — Lançamento *</Label>
            <Input
              className="mt-1.5"
              maxLength={4}
              value={copyrightReleaseYear}
              onChange={(event) => setCopyrightReleaseYear(event.target.value)}
              placeholder="2026"
            />
          </div>

          <div>
            <Label>Ano de Copyright — Gravação *</Label>
            <Input
              className="mt-1.5"
              maxLength={4}
              value={copyrightRecordingYear}
              onChange={(event) => setCopyrightRecordingYear(event.target.value)}
              placeholder="2026"
            />
          </div>

          <div className="md:col-span-2 rounded-lg border border-border bg-muted/15 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-xl">
                <Label>Bar Code (UPC)</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Se você já possui um UPC, informe-o. Caso contrário, o fluxo poderá gerar um posteriormente.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={ownUpc}
                  onCheckedChange={(checked) => setOwnUpc(checked === true)}
                />
                <span className="text-sm text-foreground">Tenho meu próprio UPC</span>
              </label>
            </div>

            {ownUpc && (
              <Input
                className="mt-4 max-w-md"
                maxLength={14}
                value={upc}
                onChange={(event) => setUpc(event.target.value)}
                placeholder="Digite o código UPC"
              />
            )}
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/15 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status interno
            </span>
            <Badge variant="secondary">Incompleto</Badge>
            <span className="text-xs text-muted-foreground">
              Atualizado automaticamente conforme o preenchimento do lançamento.
            </span>
          </div>
        </div>
      </section>
    </div>
  );

  const renderPlaceholderStep = (title: string, description: string) => (
    <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 p-10 text-center">
      <div className="max-w-md">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] max-w-6xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>Distribuir Música</DialogTitle>
          <DialogDescription>
            Cadastre o lançamento seguindo as mesmas etapas do arquivo de referência.
          </DialogDescription>
        </DialogHeader>

        <div className="border-b border-border bg-muted/20 px-6 py-4">
          <div className="grid grid-cols-5 gap-2">
            {STEPS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index)}
                className={cn(
                  "rounded-lg border px-3 py-3 text-left transition-colors",
                  step === index
                    ? "border-primary bg-primary/10 text-primary"
                    : index < step
                      ? "border-border bg-background text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-background",
                )}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                      step === index
                        ? "bg-primary text-primary-foreground"
                        : index < step
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="text-xs font-semibold">{label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 0 && renderStepOne()}
          {step === 1 && (
            <ReleaseTracksStep
              tracks={tracks}
              albumArtistNames={albumArtistNames}
              artistBase={artistBase}
              onTracksChange={setTracks}
              onAddArtistToBase={addArtistToBase}
            />
          )}
          {step === 2 && (
            <ReleaseArtworkStep
              coverFile={coverFile}
              coverPreview={coverPreview}
              onCoverChange={(file, preview) => {
                setCoverFile(file);
                setCoverPreview(preview);
              }}
            />
          )}
          {step === 3 && (
            <ReleaseDistributionStep
              value={distribution}
              onChange={setDistribution}
            />
          )}
          {step === 4 && (
            <ReleaseReviewStep
              title={title}
              releaseType={releaseType}
              mainArtist={mainArtist}
              variousArtists={variousArtists}
              albumArtistNames={albumArtistNames}
              recordLabel={recordLabel}
              copyrightReleaseYear={copyrightReleaseYear}
              copyrightRecordingYear={copyrightRecordingYear}
              copyrightHolder={copyrightHolder}
              ownUpc={ownUpc}
              upc={upc}
              coverFile={coverFile}
              coverPreview={coverPreview}
              tracks={tracks}
              distribution={distribution}
              onEditStep={setStep}
            />
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-background px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => (step === 0 ? closeModal() : setStep((current) => current - 1))}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {step === 0 ? "Cancelar" : "Voltar"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep((current) => Math.min(STEPS.length - 1, current + 1))} className="gradient-primary text-primary-foreground">
              Continuar
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              className="gradient-primary text-primary-foreground"
              onClick={createDraftAndClose}
              disabled={reviewIssues.length > 0}
            >
              Enviar para aprovação
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
