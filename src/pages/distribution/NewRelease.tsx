import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Music,
  Plus,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateReleaseDraft, useReleaseEditorReferenceData } from "@/features/release-editor/use-release-editor";
import type { ReleaseTrackDraftInput } from "@/features/release-editor/release-editor.types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Informações", description: "Dados do lançamento" },
  { id: 2, title: "Artistas", description: "Créditos artísticos" },
  { id: 3, title: "Faixas", description: "Tracklist" },
  { id: 4, title: "Áudio", description: "Masters" },
  { id: 5, title: "Capa", description: "Artwork" },
  { id: 6, title: "Metadados", description: "Dados básicos" },
  { id: 7, title: "Territórios e data", description: "Disponibilidade" },
  { id: 8, title: "Revisão", description: "Conferência final" },
] as const;

type ReleaseType = "SINGLE" | "EP" | "ALBUM";

function createTrack(): ReleaseTrackDraftInput {
  return { id: crypto.randomUUID(), title: "", explicit: false, audioFile: null };
}

export default function NewRelease() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const referenceDataQuery = useReleaseEditorReferenceData();
  const createDraftMutation = useCreateReleaseDraft();

  const [currentStep, setCurrentStep] = useState(1);
  const [releaseTitle, setReleaseTitle] = useState("");
  const [selectedArtist, setSelectedArtist] = useState("");
  const [releaseType, setReleaseType] = useState<ReleaseType>("SINGLE");
  const [releaseDate, setReleaseDate] = useState("");
  const [primaryGenre, setPrimaryGenre] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [tracks, setTracks] = useState<ReleaseTrackDraftInput[]>([createTrack()]);

  const referenceData = referenceDataQuery.data;
  const apiAvailable = referenceData?.available === true;
  const artists = referenceData?.artistIdentities ?? [];
  const selectedArtistName =
    artists.find((artist) => artist.id === selectedArtist)?.displayName ?? "Não selecionado";
  const releaseExplicit = useMemo(() => tracks.some((track) => track.explicit), [tracks]);

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setCoverFile(file);
    if (!file) {
      setCoverPreview("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const updateTrack = (id: string, updates: Partial<ReleaseTrackDraftInput>) => {
    setTracks((current) => current.map((track) => (track.id === id ? { ...track, ...updates } : track)));
  };

  const removeTrack = (id: string) => {
    setTracks((current) => (current.length > 1 ? current.filter((track) => track.id !== id) : current));
  };

  const nextStep = () => setCurrentStep((step) => Math.min(8, step + 1));
  const previousStep = () => setCurrentStep((step) => Math.max(1, step - 1));

  const submitDraft = async () => {
    if (!apiAvailable) {
      toast({
        title: "API não conectada neste preview",
        description: "Conecte o backend real para salvar o rascunho.",
        variant: "destructive",
      });
      return;
    }

    if (!releaseTitle.trim() || !selectedArtist || !releaseDate || !primaryGenre.trim()) {
      toast({
        title: "Revise os campos obrigatórios",
        description: "Título, artista principal, gênero e data precisam estar preenchidos.",
        variant: "destructive",
      });
      return;
    }

    if (tracks.some((track) => !track.title.trim())) {
      toast({
        title: "Revise as faixas",
        description: "Todas as faixas precisam ter título.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createDraftMutation.mutateAsync({
        title: releaseTitle.trim(),
        artistIdentityId: selectedArtist,
        type: releaseType,
        releaseDate,
        primaryGenre: primaryGenre.trim(),
        explicit: releaseExplicit,
        coverFile,
        tracks,
      });

      toast({
        title: "Rascunho criado",
        description: "O lançamento foi salvo como rascunho. Nenhuma distribuição foi iniciada automaticamente.",
      });
      navigate("/distribution/music");
    } catch {
      toast({
        title: "Não foi possível salvar o rascunho",
        description: "A operação real não foi concluída.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Distribuir música</h1>
            <p className="text-muted-foreground">
              Prepare o lançamento em etapas antes da validação e do envio.
            </p>
          </div>
        </div>

        {!referenceDataQuery.isLoading && !apiAvailable && (
          <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Backend real não conectado ao preview</p>
              <p className="mt-1 text-sm text-muted-foreground">
                O fluxo visual pode ser revisado, mas o rascunho só será persistido com a API disponível.
              </p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  className="flex items-center text-left"
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all",
                      currentStep > step.id
                        ? "bg-success text-success-foreground"
                        : currentStep === step.id
                          ? "gradient-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <div className="ml-2">
                    <p
                      className={cn(
                        "text-xs font-medium",
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{step.description}</p>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-3 h-0.5 w-8",
                      currentStep > step.id ? "bg-success" : "bg-muted",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Informações do lançamento</h2>
                <p className="text-sm text-muted-foreground">Defina o título e o formato do release.</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="release-title">Título do lançamento</Label>
                  <Input
                    id="release-title"
                    value={releaseTitle}
                    onChange={(event) => setReleaseTitle(event.target.value)}
                    placeholder="Nome do lançamento"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Tipo de lançamento</Label>
                  <Select value={releaseType} onValueChange={(value) => setReleaseType(value as ReleaseType)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE">Single</SelectItem>
                      <SelectItem value="EP">EP</SelectItem>
                      <SelectItem value="ALBUM">Álbum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Artistas</h2>
                <p className="text-sm text-muted-foreground">
                  O artista é definido dentro do lançamento, sem módulo separado de Artistas.
                </p>
              </div>
              <div className="max-w-xl">
                <Label>Artista principal</Label>
                <Select value={selectedArtist} onValueChange={setSelectedArtist} disabled={!apiAvailable}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={apiAvailable ? "Selecionar artista" : "API não conectada"} />
                  </SelectTrigger>
                  <SelectContent>
                    {artists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id}>{artist.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Faixas</h2>
                  <p className="text-sm text-muted-foreground">Monte a tracklist do lançamento.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setTracks((current) => [...current, createTrack()])}>
                  <Plus className="mr-2 h-4 w-4" />Adicionar faixa
                </Button>
              </div>
              <div className="space-y-3">
                {tracks.map((track, index) => (
                  <div key={track.id} className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Music className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label>Título da faixa {index + 1}</Label>
                      <Input
                        className="mt-1"
                        value={track.title}
                        onChange={(event) => updateTrack(track.id, { title: event.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <Switch
                        checked={track.explicit}
                        onCheckedChange={(checked) => updateTrack(track.id, { explicit: checked })}
                      />
                      <span className="text-xs text-muted-foreground">Explícito</span>
                    </div>
                    {tracks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-5 text-destructive hover:text-destructive"
                        onClick={() => removeTrack(track.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Upload de áudio</h2>
                <p className="text-sm text-muted-foreground">Associe o master de áudio a cada faixa.</p>
              </div>
              <div className="space-y-3">
                {tracks.map((track, index) => (
                  <div key={track.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {index + 1}. {track.title || "Faixa sem título"}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {track.audioFile?.name ?? "Nenhum arquivo associado"}
                      </p>
                    </div>
                    <label className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span><Upload className="mr-2 h-4 w-4" />Selecionar áudio</span>
                      </Button>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(event) => updateTrack(track.id, { audioFile: event.target.files?.[0] ?? null })}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Capa</h2>
                <p className="text-sm text-muted-foreground">Associe o artwork do lançamento.</p>
              </div>
              <div className="max-w-sm">
                <label className="block cursor-pointer">
                  <div
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border transition-colors hover:border-primary/50",
                      coverPreview && "border-solid border-primary",
                    )}
                  >
                    {coverPreview ? (
                      <img src={coverPreview} alt="Prévia da capa" className="h-full w-full object-cover" />
                    ) : (
                      <>
                        <Disc3 className="mb-3 h-10 w-10 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Selecionar capa</p>
                        <p className="mt-1 text-xs text-muted-foreground">3000 × 3000 px recomendado</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Metadados e direitos básicos</h2>
                <p className="text-sm text-muted-foreground">Preencha os metadados atualmente suportados pelo catálogo.</p>
              </div>
              <div className="max-w-xl">
                <Label htmlFor="primary-genre">Gênero principal</Label>
                <Input
                  id="primary-genre"
                  className="mt-1.5"
                  value={primaryGenre}
                  onChange={(event) => setPrimaryGenre(event.target.value)}
                  placeholder="Gênero musical"
                />
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Territórios e data</h2>
                <p className="text-sm text-muted-foreground">
                  Defina a data do lançamento. A seleção de territórios será adicionada quando o contrato real do catálogo estiver disponível.
                </p>
              </div>
              <div className="max-w-sm">
                <Label htmlFor="release-date">Data de lançamento</Label>
                <Input
                  id="release-date"
                  type="date"
                  className="mt-1.5"
                  value={releaseDate}
                  onChange={(event) => setReleaseDate(event.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Revisão</h2>
                <p className="text-sm text-muted-foreground">Confira os dados antes de salvar o rascunho.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lançamento</p>
                  <p className="mt-2 font-semibold text-foreground">{releaseTitle || "Título não informado"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedArtistName}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Tipo</span><p className="font-medium">{releaseType}</p></div>
                    <div><span className="text-muted-foreground">Data</span><p className="font-medium">{releaseDate || "Não definida"}</p></div>
                    <div><span className="text-muted-foreground">Gênero</span><p className="font-medium">{primaryGenre || "Não definido"}</p></div>
                    <div><span className="text-muted-foreground">Explícito</span><p className="font-medium">{releaseExplicit ? "Sim" : "Não"}</p></div>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Arquivos</p>
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Faixas</span><span className="font-medium">{tracks.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Áudios</span><span className="font-medium">{tracks.filter((track) => track.audioFile).length}/{tracks.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Capa</span><span className="font-medium">{coverFile ? "Selecionada" : "Não selecionada"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">API</span><span className={cn("font-medium", apiAvailable ? "text-success" : "text-muted-foreground")}>{apiAvailable ? "Conectada" : "Não conectada"}</span></div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
                Salvar o rascunho não envia o lançamento aos DSPs. QC, direitos e elegibilidade continuam etapas separadas.
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={previousStep} disabled={currentStep === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" />Voltar
          </Button>
          {currentStep < 8 ? (
            <Button onClick={nextStep} className="gradient-primary text-primary-foreground">
              Continuar<ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => void submitDraft()}
              disabled={createDraftMutation.isPending}
              className="gradient-primary text-primary-foreground"
            >
              {createDraftMutation.isPending ? "Salvando..." : "Salvar rascunho"}
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
