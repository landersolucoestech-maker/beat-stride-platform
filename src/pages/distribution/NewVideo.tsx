import { useMemo, useState } from "react";
import { ArrowLeft, Image, Music, Upload, Video } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateVideoDraft, useVideoReferenceData } from "@/features/videos/use-videos";
import { useToast } from "@/hooks/use-toast";

export default function NewVideo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const referenceQuery = useVideoReferenceData();
  const createDraft = useCreateVideoDraft();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [artistIdentityId, setArtistIdentityId] = useState("");
  const [videoTypeCode, setVideoTypeCode] = useState("");
  const [destinationCode, setDestinationCode] = useState("");
  const [recordingId, setRecordingId] = useState("");
  const [explicit, setExplicit] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const referenceData = referenceQuery.data;
  const apiAvailable = referenceData?.available === true;
  const formValid = useMemo(
    () => Boolean(title.trim() && artistIdentityId && videoTypeCode && destinationCode && videoFile),
    [artistIdentityId, destinationCode, title, videoFile, videoTypeCode],
  );

  const handleThumbnail = (file: File | null) => {
    setThumbnailFile(file);
    if (!file) {
      setThumbnailPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setThumbnailPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!apiAvailable) {
      toast({ title: "API não conectada neste preview", description: "O vídeo não será enviado nem terá status simulado.", variant: "destructive" });
      return;
    }
    if (!formValid || !videoFile) {
      toast({ title: "Revise os campos obrigatórios", description: "Título, artista, tipo, destino e arquivo de vídeo são obrigatórios.", variant: "destructive" });
      return;
    }

    try {
      const result = await createDraft.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        artistIdentityId,
        videoTypeCode,
        destinationCodes: [destinationCode],
        recordingId: recordingId || null,
        explicit,
        videoFile,
        thumbnailFile,
      });
      toast({
        title: result.status === "UPLOADING" ? "Upload iniciado" : "Rascunho criado",
        description: "O ativo seguirá processamento, QC e elegibilidade antes de qualquer entrega.",
      });
      navigate("/distribution/videos");
    } catch {
      toast({ title: "Não foi possível criar o vídeo", description: "A operação real falhou e nenhum status foi fabricado.", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link to="/distribution/videos"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div><h1 className="text-2xl font-bold">Novo Vídeo</h1><p className="text-muted-foreground">Prepare um ativo audiovisual para processamento e distribuição.</p></div>
        </div>

        {!referenceQuery.isLoading && !apiAvailable && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">O GitHub Pages é somente frontend. Artistas, destinos, tipos de vídeo e gravações vinculáveis serão carregados da API real.</div>
        )}

        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label>Thumbnail</Label>
            <div className="flex items-start gap-6">
              <div className="flex h-28 w-48 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted">
                {thumbnailPreview ? <img src={thumbnailPreview} alt="Prévia da thumbnail" className="h-full w-full object-cover" /> : <Image className="h-8 w-8 text-muted-foreground" />}
              </div>
              <div className="flex-1 space-y-2">
                <label className="inline-flex cursor-pointer"><Button variant="outline" className="gap-2" asChild><span><Upload className="h-4 w-4" />Selecionar Thumbnail</span></Button><input type="file" accept="image/*" className="hidden" onChange={(event) => handleThumbnail(event.target.files?.[0] ?? null)} /></label>
                <p className="text-sm text-muted-foreground">Especificações finais serão validadas pelo pipeline de assets/QC.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Arquivo de Vídeo</Label>
            <label className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:bg-muted/30">
              {videoFile ? <div className="flex items-center justify-center gap-3"><Video className="h-8 w-8 text-primary" /><div className="text-left"><p className="font-medium">{videoFile.name}</p><p className="text-sm text-muted-foreground">{(videoFile.size / 1_048_576).toFixed(2)} MB</p></div></div> : <><Video className="mx-auto mb-3 h-10 w-10 text-muted-foreground" /><p className="text-sm text-muted-foreground">Selecionar arquivo de vídeo</p></>}
              <input type="file" accept="video/*" className="hidden" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} />
            </label>
          </div>

          <div className="space-y-2"><Label htmlFor="video-title">Título do Vídeo</Label><Input id="video-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título do conteúdo audiovisual" /></div>
          <div className="space-y-2"><Label htmlFor="video-description">Descrição</Label><Textarea id="video-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição do vídeo..." rows={4} /></div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Artista</Label><Select value={artistIdentityId} onValueChange={setArtistIdentityId} disabled={!apiAvailable}><SelectTrigger><SelectValue placeholder="Selecione o artista" /></SelectTrigger><SelectContent>{referenceData?.artistIdentities.map((artist) => <SelectItem key={artist.id} value={artist.id}>{artist.displayName}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Tipo de Vídeo</Label><Select value={videoTypeCode} onValueChange={setVideoTypeCode} disabled={!apiAvailable}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{referenceData?.videoTypes.map((type) => <SelectItem key={type.code} value={type.code}>{type.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Destino</Label><Select value={destinationCode} onValueChange={setDestinationCode} disabled={!apiAvailable}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{referenceData?.destinationOptions.map((destination) => <SelectItem key={destination.code} value={destination.code}>{destination.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Vincular à gravação</Label><div className="flex items-center gap-2"><Music className="h-4 w-4 text-muted-foreground" /><Select value={recordingId} onValueChange={setRecordingId} disabled={!apiAvailable}><SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger><SelectContent>{referenceData?.recordingOptions.map((recording) => <SelectItem key={recording.id} value={recording.id}>{recording.title} — {recording.artistName}</SelectItem>)}</SelectContent></Select></div></div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4"><div><p className="font-medium">Conteúdo Explícito</p><p className="text-sm text-muted-foreground">Marque quando o conteúdo exigir classificação explícita.</p></div><Switch checked={explicit} onCheckedChange={setExplicit} /></div>

          <div className="flex gap-4 pt-2"><Link to="/distribution/videos" className="flex-1"><Button variant="outline" className="w-full">Cancelar</Button></Link><Button className="flex-1" onClick={() => void submit()} disabled={!formValid || createDraft.isPending}>{createDraft.isPending ? "Enviando..." : "Salvar e Enviar Arquivo"}</Button></div>
        </div>
      </div>
    </MainLayout>
  );
}
