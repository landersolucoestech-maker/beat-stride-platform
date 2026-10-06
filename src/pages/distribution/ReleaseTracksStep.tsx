import { Music, Plus, Trash2, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface PrototypeTrackArtist {
  id: string;
  name: string;
  role: string;
}

export interface PrototypeProductionCredit {
  id: string;
  name: string;
  role: string;
}

export interface PrototypeComposer {
  id: string;
  name: string;
}

export interface PrototypeMusician {
  id: string;
  name: string;
  instrument: string;
}

export interface PrototypeTrack {
  id: string;
  title: string;
  alternativeVersion: boolean;
  versionName: string;
  primaryGenre: string;
  secondaryGenre: string;
  additionalArtists: PrototypeTrackArtist[];
  productionCredits: PrototypeProductionCredit[];
  composers: PrototypeComposer[];
  musicians: PrototypeMusician[];
  aiUsage: string;
  instrumental: boolean;
  language: string;
  lyrics: string;
  explicit: string;
  isrc: string;
  trackArtistName: string;
  audioFile: File | null;
}

const ARTIST_ROLES = [
  "Artista Principal",
  "Featuring",
  "Intérprete",
  "Remixer",
  "DJ",
  "Coro",
] as const;

const PRODUCTION_ROLES = [
  "Produtor",
  "Co-Produtor",
  "Produtor Executivo",
  "Mixagem",
  "Engenheiro de Masterização",
  "Engenheiro de Gravação",
] as const;

const INSTRUMENTS = [
  "Guitarra / Violão",
  "Baixo",
  "Bateria",
  "Piano",
  "Teclado",
  "Violino",
  "Trompete",
  "Saxofone",
  "DJ",
  "Vocais",
  "Backing Vocals",
  "Percussão",
  "Cordas",
  "Outro",
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

const AI_USAGE_OPTIONS = [
  "Criação Humana, Sem IA",
  "Criação Humana, Assistida por IA",
  "Gerado por IA, Editado por Humano",
  "Gerado por IA",
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
] as const;

function createArtist(): PrototypeTrackArtist {
  return { id: crypto.randomUUID(), name: "", role: "Featuring" };
}

function createProductionCredit(): PrototypeProductionCredit {
  return { id: crypto.randomUUID(), name: "", role: "Produtor" };
}

function createComposer(): PrototypeComposer {
  return { id: crypto.randomUUID(), name: "" };
}

function createMusician(): PrototypeMusician {
  return { id: crypto.randomUUID(), name: "", instrument: "Guitarra / Violão" };
}

export function createPrototypeTrack(): PrototypeTrack {
  return {
    id: crypto.randomUUID(),
    title: "",
    alternativeVersion: false,
    versionName: "",
    primaryGenre: "",
    secondaryGenre: "",
    additionalArtists: [],
    productionCredits: [],
    composers: [],
    musicians: [],
    aiUsage: "",
    instrumental: false,
    language: "Português (Brasil)",
    lyrics: "",
    explicit: "none",
    isrc: "",
    trackArtistName: "",
    audioFile: null,
  };
}

interface ReleaseTracksStepProps {
  tracks: PrototypeTrack[];
  albumArtistNames: string[];
  onTracksChange: (tracks: PrototypeTrack[]) => void;
}

export function ReleaseTracksStep({
  tracks,
  albumArtistNames,
  onTracksChange,
}: ReleaseTracksStepProps) {
  const updateTrack = (id: string, updates: Partial<PrototypeTrack>) => {
    onTracksChange(tracks.map((track) => (track.id === id ? { ...track, ...updates } : track)));
  };

  const removeTrack = (id: string) => {
    if (tracks.length === 1) return;
    onTracksChange(tracks.filter((track) => track.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Envio de faixas</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Preencha os metadados, créditos e arquivo de áudio de cada faixa.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onTracksChange([...tracks, createPrototypeTrack()])}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Faixa
        </Button>
      </div>

      {tracks.map((track, trackIndex) => {
        const patchArtist = (artistId: string, updates: Partial<PrototypeTrackArtist>) => {
          updateTrack(track.id, {
            additionalArtists: track.additionalArtists.map((artist) =>
              artist.id === artistId ? { ...artist, ...updates } : artist,
            ),
          });
        };

        const patchProduction = (
          creditId: string,
          updates: Partial<PrototypeProductionCredit>,
        ) => {
          updateTrack(track.id, {
            productionCredits: track.productionCredits.map((credit) =>
              credit.id === creditId ? { ...credit, ...updates } : credit,
            ),
          });
        };

        const patchComposer = (composerId: string, updates: Partial<PrototypeComposer>) => {
          updateTrack(track.id, {
            composers: track.composers.map((composer) =>
              composer.id === composerId ? { ...composer, ...updates } : composer,
            ),
          });
        };

        const patchMusician = (musicianId: string, updates: Partial<PrototypeMusician>) => {
          updateTrack(track.id, {
            musicians: track.musicians.map((musician) =>
              musician.id === musicianId ? { ...musician, ...updates } : musician,
            ),
          });
        };

        return (
          <section key={track.id} className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Music className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-foreground">Faixa {trackIndex + 1}</h4>
                  <p className="truncate text-xs text-muted-foreground">
                    {track.title || "Título ainda não informado"}
                  </p>
                </div>
              </div>
              {tracks.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTrack(track.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-6 p-5">
              <div>
                <Label>Título da faixa *</Label>
                <Input
                  className="mt-1.5"
                  maxLength={200}
                  value={track.title}
                  onChange={(event) => updateTrack(track.id, { title: event.target.value })}
                  placeholder="Nome da música"
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {track.title.length}/200
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <Label>Gênero *</Label>
                  <Select
                    value={track.primaryGenre}
                    onValueChange={(value) => updateTrack(track.id, { primaryGenre: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Selecionar gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Gênero secundário *</Label>
                  <Select
                    value={track.secondaryGenre}
                    onValueChange={(value) => updateTrack(track.id, { secondaryGenre: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Selecionar gênero secundário" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Idioma da música *</Label>
                  <Select
                    value={track.language}
                    onValueChange={(value) => updateTrack(track.id, { language: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Selecionar idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox
                    checked={track.alternativeVersion}
                    onCheckedChange={(checked) =>
                      updateTrack(track.id, { alternativeVersion: checked === true })
                    }
                  />
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      Marcar como versão alternativa do lançamento original
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Use para remix, ao vivo, acústico, instrumental, edição de rádio e outras versões.
                    </span>
                  </span>
                </label>

                {track.alternativeVersion && (
                  <div className="mt-4 max-w-xl">
                    <Label>Versão da faixa *</Label>
                    <Input
                      className="mt-1.5"
                      value={track.versionName}
                      onChange={(event) =>
                        updateTrack(track.id, { versionName: event.target.value })
                      }
                      placeholder="Ex.: Remix, Ao Vivo, Acústico, Radio Edit..."
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Informe exatamente o nome da versão que deve acompanhar o título da faixa.
                      O protótipo não força uma lista fechada.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label>Artistas do álbum</Label>
                <div className="mt-2 flex min-h-11 flex-wrap gap-2 rounded-lg border border-border bg-muted/20 p-3">
                  {albumArtistNames.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      Nenhum artista definido na etapa anterior.
                    </span>
                  ) : (
                    albumArtistNames.map((artist) => (
                      <Badge key={artist} variant="secondary">{artist}</Badge>
                    ))
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Estes artistas são herdados do nível do lançamento.
                </p>
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Artistas ou colaboradores da faixa</p>
                    <p className="text-xs text-muted-foreground">Adicione participações específicas desta faixa.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateTrack(track.id, {
                        additionalArtists: [...track.additionalArtists, createArtist()],
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>

                {track.additionalArtists.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum colaborador específico.</p>
                ) : (
                  <div className="space-y-2">
                    {track.additionalArtists.map((artist) => (
                      <div key={artist.id} className="grid gap-2 md:grid-cols-[1fr_220px_auto]">
                        <Select
                          value={artist.name}
                          onValueChange={(value) => patchArtist(artist.id, { name: value })}
                        >
                          <SelectTrigger><SelectValue placeholder="Selecionar artista" /></SelectTrigger>
                          <SelectContent>
                            {MOCK_ARTISTS.map((item) => (
                              <SelectItem key={item} value={item}>{item}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={artist.role}
                          onValueChange={(value) => patchArtist(artist.id, { role: value })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ARTIST_ROLES.map((role) => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            updateTrack(track.id, {
                              additionalArtists: track.additionalArtists.filter(
                                (item) => item.id !== artist.id,
                              ),
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Produtores & Engenharia</p>
                    <p className="text-xs text-muted-foreground">Créditos técnicos e de produção.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateTrack(track.id, {
                        productionCredits: [
                          ...track.productionCredits,
                          createProductionCredit(),
                        ],
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>

                {track.productionCredits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum crédito informado.</p>
                ) : (
                  <div className="space-y-2">
                    {track.productionCredits.map((credit) => (
                      <div key={credit.id} className="grid gap-2 md:grid-cols-[1fr_240px_auto]">
                        <Input
                          value={credit.name}
                          onChange={(event) =>
                            patchProduction(credit.id, { name: event.target.value })
                          }
                          placeholder="Nome"
                        />
                        <Select
                          value={credit.role}
                          onValueChange={(value) => patchProduction(credit.id, { role: value })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PRODUCTION_ROLES.map((role) => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            updateTrack(track.id, {
                              productionCredits: track.productionCredits.filter(
                                (item) => item.id !== credit.id,
                              ),
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Compositores</p>
                    <p className="text-xs text-muted-foreground">
                      Cadastre cada compositor individualmente.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateTrack(track.id, {
                        composers: [...track.composers, createComposer()],
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>

                {track.composers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum compositor informado.</p>
                ) : (
                  <div className="space-y-2">
                    {track.composers.map((composer) => (
                      <div key={composer.id} className="flex gap-2">
                        <Input
                          value={composer.name}
                          onChange={(event) =>
                            patchComposer(composer.id, { name: event.target.value })
                          }
                          placeholder="Nome do compositor"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-destructive hover:text-destructive"
                          onClick={() =>
                            updateTrack(track.id, {
                              composers: track.composers.filter(
                                (item) => item.id !== composer.id,
                              ),
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Músicos</p>
                    <p className="text-xs text-muted-foreground">Informe músico e instrumento.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateTrack(track.id, {
                        musicians: [...track.musicians, createMusician()],
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>

                {track.musicians.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum músico informado.</p>
                ) : (
                  <div className="space-y-2">
                    {track.musicians.map((musician) => (
                      <div key={musician.id} className="grid gap-2 md:grid-cols-[1fr_220px_auto]">
                        <Input
                          value={musician.name}
                          onChange={(event) =>
                            patchMusician(musician.id, { name: event.target.value })
                          }
                          placeholder="Nome do músico"
                        />
                        <Select
                          value={musician.instrument}
                          onValueChange={(value) =>
                            patchMusician(musician.id, { instrument: value })
                          }
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {INSTRUMENTS.map((instrument) => (
                              <SelectItem key={instrument} value={instrument}>
                                {instrument}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            updateTrack(track.id, {
                              musicians: track.musicians.filter(
                                (item) => item.id !== musician.id,
                              ),
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label>Materiais com Uso de IA *</Label>
                  <Select
                    value={track.aiUsage}
                    onValueChange={(value) => updateTrack(track.id, { aiUsage: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Selecionar declaração" />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_USAGE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Conteúdo explícito *</Label>
                  <Select
                    value={track.explicit}
                    onValueChange={(value) => updateTrack(track.id, { explicit: value })}
                  >
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não</SelectItem>
                      <SelectItem value="explicit">Sim (Explícito)</SelectItem>
                      <SelectItem value="clean">Versão Limpa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={track.instrumental}
                    onCheckedChange={(checked) =>
                      updateTrack(track.id, { instrumental: checked === true })
                    }
                  />
                  <span className="text-sm font-medium text-foreground">
                    Faixa instrumental (sem letra)
                  </span>
                </label>

                {!track.instrumental && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label>Letra</Label>
                      <Textarea
                        className="mt-1.5 min-h-44"
                        value={track.lyrics}
                        onChange={(event) => updateTrack(track.id, { lyrics: event.target.value })}
                        placeholder="Cole ou digite a letra da faixa"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label>ISRC</Label>
                  <Input
                    className="mt-1.5 uppercase"
                    value={track.isrc}
                    onChange={(event) =>
                      updateTrack(track.id, { isrc: event.target.value.toUpperCase() })
                    }
                    placeholder="BR-ABC-26-00001"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Opcional no protótipo.
                  </p>
                </div>

                <div>
                  <Label>Nome do Artista na Faixa</Label>
                  <Input
                    className="mt-1.5"
                    value={track.trackArtistName}
                    onChange={(event) =>
                      updateTrack(track.id, { trackArtistName: event.target.value })
                    }
                    placeholder="Use somente se diferir do artista principal"
                  />
                </div>
              </div>

              <div>
                <Label>Arquivo de Áudio</Label>
                <label className="mt-1.5 flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-4 transition-colors hover:border-primary/50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {track.audioFile?.name ?? "Selecionar arquivo de áudio"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      WAV recomendado ou MP3 • máximo 25 MB
                    </p>
                  </div>
                  <Upload className="h-5 w-5 shrink-0 text-primary" />
                  <input
                    type="file"
                    accept=".wav,.mp3,audio/wav,audio/mpeg"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      if (file && file.size > 25 * 1024 * 1024) return;
                      updateTrack(track.id, { audioFile: file });
                    }}
                  />
                </label>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
