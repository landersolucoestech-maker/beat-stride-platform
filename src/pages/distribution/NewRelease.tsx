import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Check, ChevronLeft, ChevronRight, Music, Plus, Trash2, Upload } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateReleaseDraft,
  useReleaseEditorReferenceData,
} from "@/features/release-editor/use-release-editor";
import type {
  ReleaseSplitDraftInput,
  ReleaseTrackDraftInput,
} from "@/features/release-editor/release-editor.types";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Informações", description: "Dados do lançamento" },
  { id: 2, title: "Faixas", description: "Arquivos e metadados" },
  { id: 3, title: "Splits", description: "Divisão de royalties" },
  { id: 4, title: "Revisão", description: "Conferir o rascunho" },
] as const;

type ReleaseType = "SINGLE" | "EP" | "ALBUM";

function createTrack(): ReleaseTrackDraftInput {
  return { id: crypto.randomUUID(), title: "", explicit: false, audioFile: null };
}

function createSplit(primary = false): ReleaseSplitDraftInput {
  return {
    id: crypto.randomUUID(),
    name: "",
    role: primary ? "PRIMARY_ARTIST" : "OTHER",
    percentage: primary ? 100 : 0,
  };
}

const splitRoleLabels: Record<ReleaseSplitDraftInput["role"], string> = {
  PRIMARY_ARTIST: "Artista principal",
  FEATURED_ARTIST: "Artista participante",
  PRODUCER: "Produtor",
  COMPOSER: "Compositor",
  OTHER: "Outro",
};

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
  const [isExplicit, setIsExplicit] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [tracks, setTracks] = useState<ReleaseTrackDraftInput[]>([createTrack()]);
  const [splits, setSplits] = useState<ReleaseSplitDraftInput[]>([createSplit(true)]);

  const referenceData = referenceDataQuery.data;
  const apiAvailable = referenceData?.available === true;
  const artists = referenceData?.artistIdentities ?? [];
  const selectedArtistName = artists.find((artist) => artist.id === selectedArtist)?.displayName ?? "Não selecionado";
  const totalPercentage = useMemo(() => splits.reduce((sum, split) => sum + split.percentage, 0), [splits]);

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

  const updateSplit = (id: string, updates: Partial<ReleaseSplitDraftInput>) => {
    setSplits((current) => current.map((split) => (split.id === id ? { ...split, ...updates } : split)));
  };

  const removeSplit = (id: string) => {
    setSplits((current) => (current.length > 1 ? current.filter((split) => split.id !== id) : current));
  };

  const nextStep = () => setCurrentStep((step) => Math.min(4, step + 1));
  const previousStep = () => setCurrentStep((step) => Math.max(1, step - 1));

  const submitDraft = async () => {
    if (!apiAvailable) {
      toast({
        title: "API não conectada neste preview",
        description: "O formulário não cria lançamentos fictícios. Conecte o backend real para salvar o rascunho.",
        variant: "destructive",
      });
      return;
    }

    if (!releaseTitle.trim() || !selectedArtist || !releaseDate || tracks.some((track) => !track.title.trim())) {
      toast({
        title: "Revise os campos obrigatórios",
        description: "Título, artista, data e título de todas as faixas precisam estar preenchidos.",
        variant: "destructive",
      });
      return;
    }

    if (totalPercentage !== 100) {
      toast({
        title: "Splits incompletos",
        description: "A divisão de royalties precisa totalizar exatamente 100%.",
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
        explicit: isExplicit,
        coverFile,
        tracks,
        splits,
      });
      toast({
        title: "Rascunho criado",
        description: "O lançamento foi salvo como rascunho. Nenhuma distribuição foi iniciada automaticamente.",
      });
      navigate("/distribution/music");
    } catch {
      toast({
        title: "Não foi possível salvar o rascunho",
        description: "A operação real não foi concluída. Nenhum status foi simulado.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Novo Lançamento</h1>
            <p className="text-muted-foreground">Prepare o lançamento para validação, QC e distribuição.</p>
          </div>
        </div>

        {!referenceDataQuery.isLoading && !apiAvailable && (
          <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Backend real não conectado ao GitHub Pages</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Você pode revisar toda a experiência visual, mas artista, upload e salvamento só serão persistidos quando a API real estiver disponível.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button type="button" className="flex items-center text-left" onClick={() => setCurrentStep(step.id)}>
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full font-medium transition-all",
                    currentStep > step.id
                      ? "bg-success text-success-foreground"
                      : currentStep === step.id
                        ? "gradient-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={cn("text-sm font-medium", currentStep >= step.id ? "text-foreground" : "text-muted-foreground")}>{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </button>
              {index < steps.length - 1 && (
                <div className={cn("mx-2 h-0.5 w-12 lg:mx-4 lg:w-24", currentStep > step.id ? "bg-success" : "bg-muted")} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Informações do Lançamento</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:row-span-3">
                  <Label>Capa do Lançamento</Label>
                  <label className="mt-2 block cursor-pointer">
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
                          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Selecionar capa</p>
                          <p className="text-xs text-muted-foreground">3000 × 3000 px recomendado</p>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="release-title">Título do Lançamento</Label>
                    <Input id="release-title" value={releaseTitle} onChange={(event) => setReleaseTitle(event.target.value)} placeholder="Nome do lançamento" className="mt-1" />
                  </div>

                  <div>
                    <Label>Artista Principal</Label>
                    <Select value={selectedArtist} onValueChange={setSelectedArtist} disabled={!apiAvailable || referenceDataQuery.isLoading}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={referenceDataQuery.isLoading ? "Carregando artistas..." : "Selecione o artista"} />
                      </SelectTrigger>
                      <SelectContent>
                        {artists.map((artist) => (
                          <SelectItem key={artist.id} value={artist.id}>{artist.displayName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!apiAvailable && !referenceDataQuery.isLoading && <p className="mt-1 text-xs text-muted-foreground">O cadastro real de Artist Identity será carregado pela API.</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo</Label>
                      <Select value={releaseType} onValueChange={(value) => setReleaseType(value as ReleaseType)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SINGLE">Single</SelectItem>
                          <SelectItem value="EP">EP</SelectItem>
                          <SelectItem value="ALBUM">Álbum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="release-date">Data</Label>
                      <Input id="release-date" type="date" value={releaseDate} onChange={(event) => setReleaseDate(event.target.value)} className="mt-1" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="primary-genre">Gênero principal</Label>
                    <Input id="primary-genre" value={primaryGenre} onChange={(event) => setPrimaryGenre(event.target.value)} placeholder="Será validado pela taxonomia de distribuição" className="mt-1" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Conteúdo explícito</Label>
                      <p className="text-xs text-muted-foreground">Marque quando o lançamento contiver linguagem explícita.</p>
                    </div>
                    <Switch checked={isExplicit} onCheckedChange={setIsExplicit} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Faixas</h2>
                  <p className="text-sm text-muted-foreground">Adicione os arquivos e metadados básicos de cada gravação.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setTracks((current) => [...current, createTrack()])}>
                  <Plus className="mr-2 h-4 w-4" />Adicionar Faixa
                </Button>
              </div>

              <div className="space-y-4">
                {tracks.map((track, index) => (
                  <div key={track.id} className="flex items-start gap-4 rounded-lg border border-border bg-muted/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Music className="h-5 w-5 text-primary" />
                    </div>
                    <div className="grid flex-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Título da Faixa {index + 1}</Label>
                        <Input value={track.title} onChange={(event) => updateTrack(track.id, { title: event.target.value })} placeholder="Nome da música" className="mt-1" />
                      </div>
                      <div>
                        <Label>Arquivo de Áudio</Label>
                        <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 transition-colors hover:bg-muted/50">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate text-sm text-muted-foreground">{track.audioFile?.name ?? "Selecionar arquivo"}</span>
                          <input type="file" accept="audio/*" onChange={(event) => updateTrack(track.id, { audioFile: event.target.files?.[0] ?? null })} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Switch checked={track.explicit} onCheckedChange={(checked) => updateTrack(track.id, { explicit: checked })} />
                      <span className="hidden text-xs text-muted-foreground lg:inline">Explícito</span>
                      {tracks.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeTrack(track.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Divisão de Royalties</h2>
                  <p className="text-sm text-muted-foreground">Defina a versão inicial dos splits do lançamento.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSplits((current) => [...current, createSplit()])}>
                  <Plus className="mr-2 h-4 w-4" />Adicionar Participante
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total distribuído</span>
                  <span className={cn("font-medium", totalPercentage === 100 ? "text-success" : totalPercentage > 100 ? "text-destructive" : "text-foreground")}>{totalPercentage}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", totalPercentage === 100 ? "bg-success" : totalPercentage > 100 ? "bg-destructive" : "gradient-primary")}
                    style={{ width: `${Math.min(Math.max(totalPercentage, 0), 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {splits.map((split) => (
                  <div key={split.id} className="grid items-end gap-4 rounded-lg border border-border bg-muted/50 p-4 md:grid-cols-[1fr_220px_120px_auto]">
                    <div>
                      <Label>Participante</Label>
                      <Input value={split.name} onChange={(event) => updateSplit(split.id, { name: event.target.value })} placeholder="Nome legal ou artístico" className="mt-1" />
                    </div>
                    <div>
                      <Label>Função</Label>
                      <Select value={split.role} onValueChange={(value) => updateSplit(split.id, { role: value as ReleaseSplitDraftInput["role"] })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(splitRoleLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Percentual</Label>
                      <div className="relative mt-1">
                        <Input type="number" min="0" max="100" step="0.01" value={split.percentage} onChange={(event) => updateSplit(split.id, { percentage: Number(event.target.value) })} className="pr-7" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" disabled={splits.length === 1} onClick={() => removeSplit(split.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Revisão do Rascunho</h2>
                <p className="text-sm text-muted-foreground">Confira antes de persistir. Criar o rascunho não significa aprovar QC nem distribuir.</p>
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
                    <div><span className="text-muted-foreground">Explícito</span><p className="font-medium">{isExplicit ? "Sim" : "Não"}</p></div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Operação</p>
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Faixas</span><span className="font-medium">{tracks.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Arquivos de áudio</span><span className="font-medium">{tracks.filter((track) => track.audioFile).length}/{tracks.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Capa</span><span className="font-medium">{coverFile ? "Selecionada" : "Não selecionada"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Splits</span><span className={cn("font-medium", totalPercentage === 100 ? "text-success" : "text-destructive")}>{totalPercentage}%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">API</span><span className={cn("font-medium", apiAvailable ? "text-success" : "text-muted-foreground")}>{apiAvailable ? "Conectada" : "Não conectada"}</span></div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
                Depois de criado, o rascunho ainda seguirá pelas validações de metadata, direitos, autoridade, QC e elegibilidade antes de qualquer entrega a providers.
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={previousStep} disabled={currentStep === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" />Voltar
          </Button>
          {currentStep < 4 ? (
            <Button onClick={nextStep} className="gradient-primary text-primary-foreground">
              Continuar<ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => void submitDraft()} disabled={createDraftMutation.isPending} className="gradient-primary text-primary-foreground">
              {createDraftMutation.isPending ? "Salvando..." : "Salvar Rascunho"}
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
