import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { genres, artists } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { Check, ChevronLeft, ChevronRight, Upload, Plus, Trash2, Music, X } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Informações", description: "Dados do lançamento" },
  { id: 2, title: "Faixas", description: "Upload das músicas" },
  { id: 3, title: "Splits", description: "Divisão de royalties" },
  { id: 4, title: "Revisão", description: "Confirmar e enviar" },
];

interface TrackData {
  id: string;
  title: string;
  file: File | null;
  explicit: boolean;
}

interface SplitData {
  id: string;
  name: string;
  role: string;
  percentage: number;
}

export default function NewRelease() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1 data
  const [releaseTitle, setReleaseTitle] = useState("");
  const [selectedArtist, setSelectedArtist] = useState("");
  const [releaseType, setReleaseType] = useState<"single" | "ep" | "album">("single");
  const [releaseDate, setReleaseDate] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [isExplicit, setIsExplicit] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  // Step 2 data
  const [tracks, setTracks] = useState<TrackData[]>([
    { id: "1", title: "", file: null, explicit: false },
  ]);

  // Step 3 data
  const [splits, setSplits] = useState<SplitData[]>([
    { id: "1", name: "", role: "artist", percentage: 100 },
  ]);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTrack = () => {
    setTracks([...tracks, { id: Date.now().toString(), title: "", file: null, explicit: false }]);
  };

  const removeTrack = (id: string) => {
    if (tracks.length > 1) {
      setTracks(tracks.filter((t) => t.id !== id));
    }
  };

  const updateTrack = (id: string, updates: Partial<TrackData>) => {
    setTracks(tracks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const addSplit = () => {
    setSplits([...splits, { id: Date.now().toString(), name: "", role: "collaborator", percentage: 0 }]);
  };

  const removeSplit = (id: string) => {
    if (splits.length > 1) {
      setSplits(splits.filter((s) => s.id !== id));
    }
  };

  const updateSplit = (id: string, updates: Partial<SplitData>) => {
    setSplits(splits.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0);

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Lançamento enviado!",
      description: "Seu lançamento foi enviado para revisão e será distribuído em breve.",
    });
    navigate("/distribution/music");
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Novo Lançamento</h1>
            <p className="text-muted-foreground">Distribua sua música para todas as plataformas</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all",
                    currentStep > step.id
                      ? "bg-success text-success-foreground"
                      : currentStep === step.id
                      ? "gradient-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={cn(
                    "text-sm font-medium",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 lg:w-24 h-0.5 mx-2 lg:mx-4",
                    currentStep > step.id ? "bg-success" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-xl bg-card border border-border p-6">
          {/* Step 1: Release Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Informações do Lançamento</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Cover upload */}
                <div className="md:row-span-3">
                  <Label>Capa do Lançamento</Label>
                  <div className="mt-2">
                    <label className="block cursor-pointer">
                      <div className={cn(
                        "aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center overflow-hidden",
                        coverPreview && "border-solid border-primary"
                      )}>
                        {coverPreview ? (
                          <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Clique para upload</p>
                            <p className="text-xs text-muted-foreground">3000x3000px recomendado</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título do Lançamento</Label>
                    <Input
                      id="title"
                      value={releaseTitle}
                      onChange={(e) => setReleaseTitle(e.target.value)}
                      placeholder="Ex: Neon Dreams"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Artista Principal</Label>
                    <Select value={selectedArtist} onValueChange={setSelectedArtist}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o artista" />
                      </SelectTrigger>
                      <SelectContent>
                        {artists.map((artist) => (
                          <SelectItem key={artist.id} value={artist.id}>
                            {artist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Lançamento</Label>
                      <Select value={releaseType} onValueChange={(v) => setReleaseType(v as any)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="ep">EP</SelectItem>
                          <SelectItem value="album">Álbum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="releaseDate">Data de Lançamento</Label>
                      <Input
                        id="releaseDate"
                        type="date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Gênero</Label>
                    <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Conteúdo Explícito</Label>
                      <p className="text-xs text-muted-foreground">Marque se contém linguagem explícita</p>
                    </div>
                    <Switch checked={isExplicit} onCheckedChange={setIsExplicit} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Tracks */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Faixas</h2>
                <Button variant="outline" size="sm" onClick={addTrack}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Faixa
                </Button>
              </div>

              <div className="space-y-4">
                {tracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Music className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Título da Faixa {index + 1}</Label>
                        <Input
                          value={track.title}
                          onChange={(e) => updateTrack(track.id, { title: e.target.value })}
                          placeholder="Nome da música"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Arquivo de Áudio</Label>
                        <div className="mt-1">
                          <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-muted/50 cursor-pointer transition-colors">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground truncate">
                              {track.file?.name || "Selecionar arquivo"}
                            </span>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => updateTrack(track.id, { file: e.target.files?.[0] || null })}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-2">
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
                          onClick={() => removeTrack(track.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Splits */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Divisão de Royalties</h2>
                  <p className="text-sm text-muted-foreground">Defina como os royalties serão divididos</p>
                </div>
                <Button variant="outline" size="sm" onClick={addSplit}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Participante
                </Button>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total distribuído</span>
                  <span className={cn(
                    "font-medium",
                    totalPercentage === 100 ? "text-success" : totalPercentage > 100 ? "text-destructive" : "text-foreground"
                  )}>
                    {totalPercentage}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      totalPercentage === 100 ? "bg-success" : totalPercentage > 100 ? "bg-destructive" : "gradient-primary"
                    )}
                    style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {splits.map((split, index) => (
                  <div
                    key={split.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 font-medium text-primary">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={split.name}
                          onChange={(e) => updateSplit(split.id, { name: e.target.value })}
                          placeholder="Nome do participante"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Função</Label>
                        <Select
                          value={split.role}
                          onValueChange={(v) => updateSplit(split.id, { role: v })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="artist">Artista</SelectItem>
                            <SelectItem value="producer">Produtor</SelectItem>
                            <SelectItem value="composer">Compositor</SelectItem>
                            <SelectItem value="collaborator">Colaborador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Percentual (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={split.percentage}
                          onChange={(e) => updateSplit(split.id, { percentage: Number(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {splits.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSplit(split.id)}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Revisão Final</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {coverPreview && (
                    <img src={coverPreview} alt="Cover" className="w-full aspect-square rounded-xl object-cover" />
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Título</p>
                    <p className="font-medium text-foreground">{releaseTitle || "-"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Artista</p>
                    <p className="font-medium text-foreground">
                      {artists.find((a) => a.id === selectedArtist)?.name || "-"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="font-medium text-foreground capitalize">{releaseType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gênero</p>
                      <p className="font-medium text-foreground">{selectedGenre || "-"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Lançamento</p>
                    <p className="font-medium text-foreground">
                      {releaseDate ? new Date(releaseDate).toLocaleDateString('pt-BR') : "-"}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Conteúdo Explícito</p>
                    <p className="font-medium text-foreground">{isExplicit ? "Sim" : "Não"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Faixas</p>
                    <p className="font-medium text-foreground">{tracks.filter(t => t.title).length} faixa(s)</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Participantes</p>
                    <p className="font-medium text-foreground">{splits.filter(s => s.name).length} participante(s)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          {currentStep < 4 ? (
            <Button onClick={nextStep} className="gradient-primary text-primary-foreground">
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground">
              <Check className="h-4 w-4 mr-2" />
              Enviar para Distribuição
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
