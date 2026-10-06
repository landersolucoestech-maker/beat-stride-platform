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
  "Informações do álbum",
  "Envio de faixas",
  "Capa do álbum",
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

const GENRES = [
  "Afrobeats",
  "Alternativo",
  "Eletrônica",
  "Funk",
  "Gospel",
  "Hip-Hop / Rap",
  "MPB",
  "Pagode",
  "Pop",
  "Reggae",
  "Rock",
  "Sertanejo",
] as const;

const LANGUAGES = [
  "Português (Brasil)",
  "Português",
  "Inglês",
  "Espanhol",
  "Francês",
  "Italiano",
  "Alemão",
  "Japonês",
  "Coreano",
  "Chinês",
  "Árabe",
] as const;

const MOCK_ARTISTS = [
  "Ayla Martins",
  "Caio Nunes",
  "Davi Luz",
  "Luna Reis",
  "Nilo",
  "Various Artists",
] as const;

const MOCK_PROJECTS = [
  {
    id: "project-1",
    label: "Projeto — Noite Inteira",
    title: "Noite Inteira",
    releaseType: "single",
    mainArtist: "Luna Reis",
    primaryGenre: "Pop",
    secondaryGenre: "Eletrônica",
    language: "Português (Brasil)",
    recordLabel: "Luna Reis",
  },
  {
    id: "project-2",
    label: "Projeto — Horizonte",
    title: "Horizonte",
    releaseType: "ep",
    mainArtist: "Davi Luz",
    primaryGenre: "MPB",
    secondaryGenre: "Alternativo",
    language: "Português (Brasil)",
    recordLabel: "Lander Records",
  },
] as const;

interface AdditionalArtist {
  id: string;
  name: string;
  role: string;
}

interface ReleaseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReleaseFormModal({ open, onOpenChange }: ReleaseFormModalProps) {
  const [step, setStep] = useState(0);
  const [projectId, setProjectId] = useState("none");
  const [title, setTitle] = useState("");
  const [releaseType, setReleaseType] = useState("single");
  const [variousArtists, setVariousArtists] = useState(false);
  const [mainArtist, setMainArtist] = useState("");
  const [additionalArtists, setAdditionalArtists] = useState<AdditionalArtist[]>([]);
  const [primaryGenre, setPrimaryGenre] = useState("");
  const [secondaryGenre, setSecondaryGenre] = useState("");
  const [language, setLanguage] = useState("Português (Brasil)");
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

  const selectedProject = useMemo(
    () => MOCK_PROJECTS.find((project) => project.id === projectId),
    [projectId],
  );

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
        primaryGenre,
        secondaryGenre,
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
      primaryGenre,
      recordLabel,
      secondaryGenre,
      title,
      tracks,
      variousArtists,
    ],
  );

  const applyProject = (value: string) => {
    setProjectId(value);
    const project = MOCK_PROJECTS.find((item) => item.id === value);
    if (!project) return;

    setTitle(project.title);
    setReleaseType(project.releaseType);
    setVariousArtists(false);
    setMainArtist(project.mainArtist);
    setPrimaryGenre(project.primaryGenre);
    setSecondaryGenre(project.secondaryGenre);
    setLanguage(project.language);
    setRecordLabel(project.recordLabel);

    if (project.id === "project-1") {
      setTracks([
        {
          ...createPrototypeTrack(),
          title: "Noite Inteira",
          aiUsage: "Criação Humana, Sem IA",
          language: "Português (Brasil)",
          lyrics: "Hoje eu só quero dançar até o dia clarear...",
          isrc: "BR-LND-26-00001",
          composers: [{ id: crypto.randomUUID(), name: "Luna Reis" }],
          productionCredits: [
            { id: crypto.randomUUID(), name: "Caio Nunes", role: "Produtor" },
          ],
        },
      ]);
    }

    if (project.id === "project-2") {
      setTracks([
        {
          ...createPrototypeTrack(),
          title: "Horizonte",
          aiUsage: "Criação Humana, Assistida por IA",
          language: "Português (Brasil)",
          lyrics: "No horizonte eu vejo a estrada se abrir...",
          isrc: "BR-LND-26-00011",
          composers: [{ id: crypto.randomUUID(), name: "Davi Luz" }],
          productionCredits: [
            { id: crypto.randomUUID(), name: "Nilo", role: "Produtor" },
          ],
        },
        {
          ...createPrototypeTrack(),
          title: "Depois da Chuva",
          aiUsage: "Criação Humana, Sem IA",
          language: "Português (Brasil)",
          lyrics: "Depois da chuva a cidade volta a respirar...",
          isrc: "BR-LND-26-00012",
          composers: [{ id: crypto.randomUUID(), name: "Davi Luz" }],
        },
      ]);
    }
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

  const resetAndClose = () => {
    setStep(0);
    onOpenChange(false);
  };

  const renderStepOne = () => (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-muted/20 p-5">
        <div className="mb-4">
          <h3 className="font-semibold text-foreground">Vincular a um Projeto</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Opcional. No protótipo, selecionar um projeto demonstra o preenchimento automático dos dados do lançamento.
          </p>
        </div>

        <Select value={projectId} onValueChange={applyProject}>
          <SelectTrigger className="max-w-xl bg-background">
            <SelectValue placeholder="Selecionar projeto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Não vincular a projeto</SelectItem>
            {MOCK_PROJECTS.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedProject && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-4 w-4 text-primary" />
            Dados preenchidos a partir de {selectedProject.label}.
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5">
          <h3 className="font-semibold text-foreground">Informações do lançamento</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Dados principais que identificam o álbum, single ou EP.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="release-title">Título do Álbum / Single / EP *</Label>
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
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RELEASE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-3">
              <Checkbox
                checked={variousArtists}
                onCheckedChange={(checked) => setVariousArtists(checked === true)}
              />
              <span>
                <span className="block text-sm font-medium text-foreground">Various Artists</span>
                <span className="block text-xs text-muted-foreground">
                  Use para coletâneas com 5 ou mais artistas principais diferentes.
                </span>
              </span>
            </label>
          </div>

          {!variousArtists && (
            <div className="md:col-span-2">
              <Label>Artista Principal *</Label>
              <Select value={mainArtist} onValueChange={setMainArtist}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecionar artista principal" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_ARTISTS.filter((artist) => artist !== "Various Artists").map((artist) => (
                    <SelectItem key={artist} value={artist}>{artist}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">Intérprete</Badge>
                <span>O Artista Principal já entra automaticamente como intérprete.</span>
              </div>
            </div>
          )}

          <div>
            <Label>Gênero principal *</Label>
            <Select value={primaryGenre} onValueChange={setPrimaryGenre}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecionar gênero" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((genre) => <SelectItem key={genre} value={genre}>{genre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Gênero secundário *</Label>
            <Select value={secondaryGenre} onValueChange={setSecondaryGenre}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecionar gênero" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((genre) => <SelectItem key={genre} value={genre}>{genre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label>Idioma *</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecionar idioma" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground">Artistas Secundários</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Adicione um ou mais artistas secundários e defina a função de cada um no lançamento.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addArtist}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar artista secundário
          </Button>
        </div>

        {additionalArtists.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
            Nenhum artista secundário informado.
          </div>
        ) : (
          <div className="space-y-3">
            {additionalArtists.map((artist) => (
              <div key={artist.id} className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 md:grid-cols-[1fr_220px_auto]">
                <Select value={artist.name} onValueChange={(value) => updateArtist(artist.id, { name: value })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar artista secundário" /></SelectTrigger>
                  <SelectContent>
                    {MOCK_ARTISTS.filter((item) => item !== "Various Artists").map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={artist.role || undefined}
                  onValueChange={(value) => updateArtist(artist.id, { role: value })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecionar função" /></SelectTrigger>
                  <SelectContent>
                    {SECONDARY_ARTIST_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button type="button" variant="ghost" size="icon" onClick={() => removeArtist(artist.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5">
          <h3 className="font-semibold text-foreground">Direitos autorais</h3>
        </div>

        <div className="space-y-5">
          <div>
            <Label htmlFor="record-label">Gravadora / Selo *</Label>
            <div className="mt-2 flex gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Se você é um artista independente, pode usar seu nome artístico como selo.
            </div>
            <Input
              id="record-label"
              className="mt-2"
              value={recordLabel}
              onChange={(event) => setRecordLabel(event.target.value)}
              placeholder="Nome da gravadora ou selo"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Ano de Copyright — Lançamento *</Label>
              <Input
                className="mt-1.5"
                maxLength={4}
                value={copyrightReleaseYear}
                onChange={(event) => setCopyrightReleaseYear(event.target.value)}
                placeholder="Ex: 2026"
              />
            </div>
            <div>
              <Label>Ano de Copyright — Gravação *</Label>
              <Input
                className="mt-1.5"
                maxLength={4}
                value={copyrightRecordingYear}
                onChange={(event) => setCopyrightRecordingYear(event.target.value)}
                placeholder="Ex: 2026"
              />
            </div>
          </div>

          <div>
            <Label>Titular do Copyright</Label>
            <Input
              className="mt-1.5"
              value={copyrightHolder}
              onChange={(event) => setCopyrightHolder(event.target.value)}
              placeholder="© 2026 Nome do detentor"
            />
          </div>

          <div>
            <Label>Bar Code (UPC)</Label>
            <div className="mt-2 flex gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Se você não tiver um código UPC, o fluxo poderá gerar um automaticamente.
            </div>

            <label className="mt-3 flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={ownUpc}
                onCheckedChange={(checked) => setOwnUpc(checked === true)}
              />
              <span className="text-sm text-foreground">Tenho meu próprio UPC</span>
            </label>

            {ownUpc && (
              <Input
                className="mt-3"
                maxLength={14}
                value={upc}
                onChange={(event) => setUpc(event.target.value)}
                placeholder="Digite o código UPC"
              />
            )}
          </div>

          <div>
            <Label>Status interno</Label>
            <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
              <Badge variant="secondary">Incompleto</Badge>
              <span className="text-xs text-muted-foreground">
                Controlado pelo sistema no produto final.
              </span>
            </div>
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
              onTracksChange={setTracks}
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
              primaryGenre={primaryGenre}
              secondaryGenre={secondaryGenre}
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
            />
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-background px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => (step === 0 ? resetAndClose() : setStep((current) => current - 1))}
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
              onClick={resetAndClose}
              disabled={reviewIssues.length > 0}
            >
              Criar Lançamento
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
