import {
  Check,
  ChevronsUpDown,
  ExternalLink,
  Search,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ArtistLookupFieldProps {
  value: string;
  artists: string[];
  placeholder: string;
  onChange: (artistName: string) => void;
  onAddArtistToBase: (artistName: string) => void;
}

type PlatformKey = "spotify" | "youtube" | "appleMusic";

interface PlatformProfile {
  id: string;
  name: string;
  handle: string;
  url: string;
  detail: string;
}

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  spotify: "Spotify",
  youtube: "YouTube",
  appleMusic: "Apple Music",
};

const PLATFORM_HINTS: Record<PlatformKey, string> = {
  spotify: "Nome do artista, URL do perfil ou Spotify Artist ID",
  youtube: "Nome do canal, @handle, URL ou Channel ID",
  appleMusic: "Nome do artista, URL do perfil ou Apple Music Artist ID",
};

function slugifyArtistName(name: string) {
  return name
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildMockResults(platform: PlatformKey, artistName: string): PlatformProfile[] {
  const cleanName = artistName.trim() || "Artista";
  const slug = slugifyArtistName(cleanName) || "artista";

  if (platform === "spotify") {
    return [
      {
        id: `spotify-${slug}-official`,
        name: cleanName,
        handle: `spotify:artist:${slug.slice(0, 10)}26`,
        url: `open.spotify.com/artist/${slug}`,
        detail: "Perfil de artista • resultado principal",
      },
      {
        id: `spotify-${slug}-alt`,
        name: `${cleanName} Oficial`,
        handle: `spotify:artist:${slug.slice(0, 8)}alt`,
        url: `open.spotify.com/artist/${slug}-oficial`,
        detail: "Perfil semelhante • confira antes de vincular",
      },
    ];
  }

  if (platform === "youtube") {
    return [
      {
        id: `youtube-${slug}-official`,
        name: cleanName,
        handle: `@${slug.replace(/-/g, "")}`,
        url: `youtube.com/@${slug.replace(/-/g, "")}`,
        detail: "Canal oficial / Artist Channel",
      },
      {
        id: `youtube-${slug}-music`,
        name: `${cleanName} - Topic`,
        handle: `UC${slug.replace(/-/g, "").slice(0, 12).toUpperCase()}26`,
        url: `youtube.com/channel/UC${slug.replace(/-/g, "").slice(0, 12).toUpperCase()}26`,
        detail: "Canal Topic • confira se corresponde ao mesmo artista",
      },
    ];
  }

  return [
    {
      id: `apple-${slug}-official`,
      name: cleanName,
      handle: `Artist ID ${Math.abs(slug.length * 104729 + 2600)}`,
      url: `music.apple.com/artist/${slug}`,
      detail: "Perfil principal no Apple Music",
    },
    {
      id: `apple-${slug}-alt`,
      name: `${cleanName} Oficial`,
      handle: `Artist ID ${Math.abs(slug.length * 130363 + 2611)}`,
      url: `music.apple.com/artist/${slug}-oficial`,
      detail: "Perfil semelhante • confira antes de vincular",
    },
  ];
}

export function ArtistLookupField({
  value,
  artists,
  placeholder,
  onChange,
  onAddArtistToBase,
}: ArtistLookupFieldProps) {
  const [baseOpen, setBaseOpen] = useState(false);
  const [baseQuery, setBaseQuery] = useState("");

  const [finderOpen, setFinderOpen] = useState(false);
  const [artistName, setArtistName] = useState("");
  const [platformQueries, setPlatformQueries] = useState<Record<PlatformKey, string>>({
    spotify: "",
    youtube: "",
    appleMusic: "",
  });
  const [platformResults, setPlatformResults] = useState<
    Partial<Record<PlatformKey, PlatformProfile[]>>
  >({});
  const [selectedProfiles, setSelectedProfiles] = useState<
    Partial<Record<PlatformKey, PlatformProfile>>
  >({});

  const normalizedBaseQuery = baseQuery.trim().toLocaleLowerCase("pt-BR");
  const filteredArtists = useMemo(
    () =>
      artists.filter((artist) =>
        artist.toLocaleLowerCase("pt-BR").includes(normalizedBaseQuery),
      ),
    [artists, normalizedBaseQuery],
  );

  const linkedProfilesCount = Object.keys(selectedProfiles).length;

  const selectArtist = (artist: string) => {
    onChange(artist);
    setBaseOpen(false);
    setBaseQuery("");
  };

  const resetFinder = () => {
    setArtistName("");
    setPlatformQueries({
      spotify: "",
      youtube: "",
      appleMusic: "",
    });
    setPlatformResults({});
    setSelectedProfiles({});
  };

  const openFinder = () => {
    resetFinder();
    setFinderOpen(true);
  };

  const handleArtistNameChange = (nextName: string) => {
    setArtistName(nextName);
    setPlatformQueries({
      spotify: nextName,
      youtube: nextName,
      appleMusic: nextName,
    });
    setPlatformResults({});
    setSelectedProfiles({});
  };

  const updatePlatformQuery = (platform: PlatformKey, query: string) => {
    setPlatformQueries((current) => ({ ...current, [platform]: query }));
    setPlatformResults((current) => ({ ...current, [platform]: undefined }));
    setSelectedProfiles((current) => {
      const next = { ...current };
      delete next[platform];
      return next;
    });
  };

  const locatePlatform = (platform: PlatformKey) => {
    const query = platformQueries[platform].trim();
    if (!query) return;

    setPlatformResults((current) => ({
      ...current,
      [platform]: buildMockResults(platform, artistName || query),
    }));
  };

  const chooseProfile = (platform: PlatformKey, profile: PlatformProfile) => {
    setSelectedProfiles((current) => ({ ...current, [platform]: profile }));
  };

  const confirmArtist = () => {
    const cleanName = artistName.trim();
    if (!cleanName || linkedProfilesCount === 0) return;

    onAddArtistToBase(cleanName);
    onChange(cleanName);
    setFinderOpen(false);
    resetFinder();
  };

  return (
    <>
      <div className="flex w-full gap-2">
        <Popover
          open={baseOpen}
          onOpenChange={(nextOpen) => {
            setBaseOpen(nextOpen);
            if (!nextOpen) setBaseQuery("");
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={baseOpen}
              className={cn(
                "min-w-0 flex-1 justify-between font-normal",
                !value && "text-muted-foreground",
              )}
            >
              <span className="truncate">{value || placeholder}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            className="w-[var(--radix-popover-trigger-width)] min-w-[340px] p-0"
          >
            <div className="border-b border-border p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  value={baseQuery}
                  onChange={(event) => setBaseQuery(event.target.value)}
                  placeholder="Buscar artista na base Lander..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto p-2">
              {filteredArtists.length > 0 ? (
                <div className="space-y-1">
                  <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Artistas cadastrados
                  </p>
                  {filteredArtists.map((artist) => (
                    <button
                      key={artist}
                      type="button"
                      onClick={() => selectArtist(artist)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <UserRound className="h-4 w-4 text-primary" />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                        {artist}
                      </span>
                      {value === artist && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-center">
                  <p className="text-sm font-medium text-foreground">
                    Nenhum artista encontrado na base
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use o botão “Buscar artista” ao lado.
                  </p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Button type="button" variant="outline" className="shrink-0" onClick={openFinder}>
          <Search className="mr-2 h-4 w-4" />
          Buscar artista
        </Button>
      </div>

      <Dialog
        open={finderOpen}
        onOpenChange={(nextOpen) => {
          setFinderOpen(nextOpen);
          if (!nextOpen) resetFinder();
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-border px-6 py-5">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div>
                <DialogTitle>Buscar e vincular artista</DialogTitle>
                <DialogDescription className="mt-1">
                  Localize os perfis corretos antes de adicionar o artista à base Lander.
                </DialogDescription>
              </div>
              <Badge variant="outline" className="shrink-0">
                {linkedProfilesCount}/3 perfis vinculados
              </Badge>
            </div>
          </DialogHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <section className="rounded-xl border border-border bg-muted/20 p-4">
              <Label htmlFor="artist-finder-name">Nome do artista *</Label>
              <Input
                id="artist-finder-name"
                className="mt-1.5"
                value={artistName}
                onChange={(event) => handleArtistNameChange(event.target.value)}
                placeholder="Digite exatamente o nome artístico"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                O mesmo nome será usado como ponto de partida nas três plataformas.
              </p>
            </section>

            <div className="space-y-4">
              {(Object.keys(PLATFORM_LABELS) as PlatformKey[]).map((platform) => {
                const results = platformResults[platform];
                const selected = selectedProfiles[platform];

                return (
                  <section
                    key={platform}
                    className="overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-border bg-muted/20 px-4 py-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {PLATFORM_LABELS[platform]}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {PLATFORM_HINTS[platform]}
                        </p>
                      </div>
                      {selected ? (
                        <Badge variant="secondary" className="gap-1">
                          <Check className="h-3 w-3" />
                          Vinculado
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="flex gap-2">
                        <Input
                          value={platformQueries[platform]}
                          onChange={(event) =>
                            updatePlatformQuery(platform, event.target.value)
                          }
                          placeholder={PLATFORM_HINTS[platform]}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="shrink-0"
                          disabled={!platformQueries[platform].trim()}
                          onClick={() => locatePlatform(platform)}
                        >
                          <Search className="mr-2 h-4 w-4" />
                          Localizar
                        </Button>
                      </div>

                      {results && (
                        <div className="space-y-2 border-t border-border pt-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Resultados encontrados
                          </p>

                          {results.map((profile) => {
                            const isSelected = selected?.id === profile.id;

                            return (
                              <button
                                key={profile.id}
                                type="button"
                                onClick={() => chooseProfile(platform, profile)}
                                className={cn(
                                  "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/40 hover:bg-muted/30",
                                )}
                              >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                  <UserRound className="h-5 w-5 text-primary" />
                                </span>

                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center gap-2">
                                    <span className="truncate text-sm font-semibold text-foreground">
                                      {profile.name}
                                    </span>
                                    {isSelected && (
                                      <Badge variant="secondary" className="gap-1">
                                        <Check className="h-3 w-3" />
                                        Selecionado
                                      </Badge>
                                    )}
                                  </span>
                                  <span className="mt-1 block text-xs text-muted-foreground">
                                    {profile.detail}
                                  </span>
                                  <span className="mt-2 block truncate text-xs font-medium text-foreground">
                                    {profile.handle}
                                  </span>
                                  <span className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                    {profile.url}
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            {linkedProfilesCount > 0 && (
              <section className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      Perfis que serão vinculados
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Revise os perfis selecionados antes de confirmar.
                    </p>
                  </div>
                  <Badge variant="secondary">{artistName || "Artista"}</Badge>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {(Object.keys(PLATFORM_LABELS) as PlatformKey[]).map((platform) => {
                    const selected = selectedProfiles[platform];

                    return (
                      <div
                        key={platform}
                        className="rounded-lg border border-border bg-background p-3"
                      >
                        <p className="text-xs font-medium text-muted-foreground">
                          {PLATFORM_LABELS[platform]}
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-foreground">
                          {selected?.handle ?? "Não vinculado"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border bg-background px-6 py-4">
            <p className="text-xs text-muted-foreground">
              Pelo menos um perfil precisa ser localizado e selecionado.
            </p>
            <Button
              type="button"
              disabled={!artistName.trim() || linkedProfilesCount === 0}
              onClick={confirmArtist}
            >
              <Check className="mr-2 h-4 w-4" />
              Confirmar e adicionar à base
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
