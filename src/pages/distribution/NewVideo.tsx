import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, Video, Music, Image } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { artists } from "@/data/mockData";

export default function NewVideo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedArtist, setSelectedArtist] = useState("");
  const [videoType, setVideoType] = useState("");
  const [platform, setPlatform] = useState("");
  const [linkedTrack, setLinkedTrack] = useState("");
  const [isExplicit, setIsExplicit] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Vídeo enviado!",
      description: "Seu vídeo foi enviado para processamento.",
    });
    navigate("/distribution/videos");
  };

  const isFormValid = title && selectedArtist && videoType && platform && videoFile;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/distribution/videos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Novo Vídeo</h1>
            <p className="text-muted-foreground">
              Faça upload de um novo vídeo para distribuição
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label>Thumbnail</Label>
            <div className="flex items-start gap-6">
              <div className="w-48 h-28 bg-muted rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-border">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <Label htmlFor="thumbnail-upload" className="cursor-pointer">
                  <Button variant="outline" className="gap-2" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
                      Upload Thumbnail
                    </span>
                  </Button>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recomendado: 1280x720 (16:9)
                </p>
              </div>
            </div>
          </div>

          {/* Video Upload */}
          <div className="space-y-2">
            <Label>Arquivo de Vídeo</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              {videoFile ? (
                <div className="flex items-center justify-center gap-3">
                  <Video className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{videoFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Arraste e solte seu vídeo aqui
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <Label htmlFor="video-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>Selecionar Arquivo</span>
                    </Button>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    MP4, MOV, AVI (máx. 5GB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do Vídeo</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Videoclipe Oficial - Nome da Música"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do vídeo..."
              rows={4}
            />
          </div>

          {/* Artist */}
          <div className="space-y-2">
            <Label>Artista</Label>
            <Select value={selectedArtist} onValueChange={setSelectedArtist}>
              <SelectTrigger>
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

          {/* Video Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Vídeo</Label>
              <Select value={videoType} onValueChange={setVideoType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="music_video">Videoclipe</SelectItem>
                  <SelectItem value="lyric_video">Lyric Video</SelectItem>
                  <SelectItem value="visualizer">Visualizer</SelectItem>
                  <SelectItem value="behind_scenes">Behind the Scenes</SelectItem>
                  <SelectItem value="live">Ao Vivo</SelectItem>
                  <SelectItem value="interview">Entrevista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plataforma</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="vevo">Vevo</SelectItem>
                  <SelectItem value="both">YouTube + Vevo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linked Track */}
          <div className="space-y-2">
            <Label>Vincular à Música (opcional)</Label>
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-muted-foreground" />
              <Select value={linkedTrack} onValueChange={setLinkedTrack}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma música" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="track1">Sunset Dreams - Luna Silva</SelectItem>
                  <SelectItem value="track2">Noite Estrelada - Pedro Santos</SelectItem>
                  <SelectItem value="track3">Amor Infinito - Maria Costa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Explicit */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Conteúdo Explícito</p>
              <p className="text-sm text-muted-foreground">
                Marque se o vídeo contém conteúdo explícito
              </p>
            </div>
            <Switch checked={isExplicit} onCheckedChange={setIsExplicit} />
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Link to="/distribution/videos" className="flex-1">
              <Button variant="outline" className="w-full">
                Cancelar
              </Button>
            </Link>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!isFormValid}
            >
              Enviar Vídeo
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
