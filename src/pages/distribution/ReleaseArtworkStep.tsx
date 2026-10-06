import { CheckCircle2, ImageIcon, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface ReleaseArtworkStepProps {
  coverFile: File | null;
  coverPreview: string;
  onCoverChange: (file: File | null, preview: string) => void;
}

export function ReleaseArtworkStep({
  coverFile,
  coverPreview,
  onCoverChange,
}: ReleaseArtworkStepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");

  const clearCover = () => {
    setError("");
    onCoverChange(null, "");
    if (inputRef.current) inputRef.current.value = "";
  };

  const selectCover = (file: File | null) => {
    setError("");
    if (!file) return;

    const allowedTypes = new Set(["image/jpeg", "image/png"]);
    if (!allowedTypes.has(file.type)) {
      setError("Formato inválido. Use somente JPG ou PNG.");
      return;
    }

    if (file.size > 35 * 1024 * 1024) {
      setError("O arquivo ultrapassa o limite de 35 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;

      const image = new Image();
      image.onload = () => {
        if (image.width < 3000 || image.height < 3000) {
          setError(
            `A capa possui ${image.width} × ${image.height}px. O mínimo é 3000 × 3000px.`,
          );
          return;
        }

        onCoverChange(file, reader.result as string);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Capa do álbum</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Envie a arte final do lançamento seguindo os requisitos de distribuição.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="shrink-0">
            <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/40">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Prévia da capa do lançamento"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
              )}
            </div>
          </div>

          <div className="flex-1 space-y-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Requisitos de Upload</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>
                  Formato: <strong className="text-foreground">JPG, PNG</strong> (WebP não aceito)
                </li>
                <li>
                  Tamanho mínimo: <strong className="text-foreground">3000 × 3000 pixels</strong>
                </li>
                <li>
                  Tamanho máximo do arquivo: <strong className="text-foreground">35 MB</strong>
                </li>
                <li>
                  Modo de cor: <strong className="text-foreground">RGB</strong> (incluindo preto e branco)
                </li>
                <li>
                  Resolução: <strong className="text-foreground">72 dpi</strong>
                </li>
                <li>
                  A capa <strong className="text-foreground">não pode conter</strong> logotipos, URLs,
                  datas de lançamento ou anúncios de qualquer tipo.
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-muted-foreground/50"
            >
              {coverFile ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="max-w-[360px] truncate text-sm font-medium text-foreground">
                    {coverFile.name}
                  </span>
                </div>
              ) : (
                <>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Clique para selecionar a capa
                  </p>
                  <span className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground">
                    <Upload className="mr-2 h-4 w-4" />
                    Selecionar Capa
                  </span>
                </>
              )}
            </button>

            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="hidden"
              onChange={(event) => selectCover(event.target.files?.[0] ?? null)}
            />

            {coverFile && (
              <Button type="button" variant="outline" size="sm" onClick={clearCover}>
                <X className="mr-2 h-4 w-4" />
                Remover capa
              </Button>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        Neste protótipo, formato, tamanho do arquivo e dimensões mínimas são validados localmente.
        RGB e 72 dpi permanecem como requisitos visuais nesta fase.
      </div>
    </div>
  );
}
