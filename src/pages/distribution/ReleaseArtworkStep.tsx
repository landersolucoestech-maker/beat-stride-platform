import { CheckCircle2, ImageIcon, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
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
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Capa do lançamento</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Envie a arte final que será utilizada nas plataformas de distribuição.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="border-b border-border bg-muted/15 p-5 lg:border-b-0 lg:border-r">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Prévia da capa</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Formato quadrado do lançamento
                </p>
              </div>
              {coverFile && <Badge variant="secondary">Capa adicionada</Badge>}
            </div>

            <div className="aspect-square overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Prévia da capa do lançamento"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <ImageIcon className="h-7 w-7 text-muted-foreground/50" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Nenhuma capa selecionada
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      A prévia aparecerá aqui
                    </p>
                  </div>
                </div>
              )}
            </div>

            {coverFile && (
              <div className="mt-3 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {coverFile.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {(coverFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          <div className="space-y-5 p-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Arquivo da capa</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Selecione a arte final antes de seguir para a distribuição.
              </p>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full items-center justify-between gap-4 rounded-xl border-2 border-dashed border-border bg-muted/10 p-5 text-left transition-colors hover:border-primary/50 hover:bg-primary/[0.02]"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  {coverFile ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Upload className="h-5 w-5 text-primary" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {coverFile ? coverFile.name : "Selecionar arquivo da capa"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG ou PNG • mínimo 3000 × 3000 px • máximo 35 MB
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground">
                {coverFile ? "Substituir" : "Selecionar"}
              </span>
            </button>

            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="hidden"
              onChange={(event) => selectCover(event.target.files?.[0] ?? null)}
            />

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {coverFile && (
              <div className="flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={clearCover}>
                  <X className="mr-2 h-4 w-4" />
                  Remover capa
                </Button>
              </div>
            )}

            <div className="border-t border-border pt-5">
              <div className="mb-3">
                <p className="text-sm font-semibold text-foreground">
                  Requisitos da arte
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Confira estes pontos antes de enviar a capa final.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/15 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Formato
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    JPG ou PNG
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    WebP não aceito
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-muted/15 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Dimensões
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    3000 × 3000 px
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tamanho mínimo
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-muted/15 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Arquivo
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    Até 35 MB
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Modo de cor RGB
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-muted/15 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Resolução
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    72 dpi
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Inclusive preto e branco
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-border bg-muted/15 p-3 text-xs text-muted-foreground">
                A capa não pode conter logotipos, URLs, datas de lançamento ou anúncios de qualquer tipo.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-lg border border-border bg-muted/15 px-4 py-3 text-xs text-muted-foreground">
        Neste protótipo, formato, tamanho do arquivo e dimensões mínimas são validados localmente.
        RGB e 72 dpi permanecem como requisitos visuais nesta fase.
      </div>
    </div>
  );
}
