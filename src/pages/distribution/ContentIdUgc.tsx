import { ListChecks, ShieldCheck, Video } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useContentIdOverview } from "@/features/content-id/use-content-id-overview";

export default function ContentIdUgc() {
  const overviewQuery = useContentIdOverview();
  const overview = overviewQuery.data;
  const available = overview?.available !== false;
  const activeEnrollments = overview?.enrollments.filter((item) => item.status === "ACTIVE").length ?? 0;
  const activeAllowlist = overview?.allowlist.filter((item) => item.status === "ACTIVE").length ?? 0;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content ID e UGC</h1>
          <p className="text-muted-foreground">Gerencie elegibilidade, monetização e allowlist de conteúdo gerado por usuários.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Content ID ativo</p>
                <p className="text-xl font-semibold text-foreground">{available ? activeEnrollments : "—"}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ListChecks className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Allowlist ativa</p>
                <p className="text-xl font-semibold text-foreground">{available ? activeAllowlist : "—"}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Regra operacional</p>
            <p className="mt-2 text-sm font-medium text-foreground">Proteção e allowlist são controles separados.</p>
          </div>
        </div>

        {overviewQuery.isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : overviewQuery.isError ? (
          <div className="rounded-xl border border-destructive/20 bg-card p-10 text-center">
            <h2 className="text-lg font-semibold text-foreground">Não foi possível carregar Content ID e UGC</h2>
            <p className="mt-2 text-sm text-muted-foreground">A fonte real respondeu com erro.</p>
            <Button variant="outline" className="mt-4" onClick={() => void overviewQuery.refetch()}>Tentar novamente</Button>
          </div>
        ) : !available ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Video className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold text-foreground">Content ID ainda não está conectado neste preview</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              A interface já usa a fronteira real do domínio e não inventa inscrições, reivindicações, plataformas ou resultados.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border p-5">
                <h2 className="font-semibold text-foreground">Inscrições Content ID</h2>
                <p className="mt-1 text-sm text-muted-foreground">Status por gravação elegível.</p>
              </div>
              {overview?.enrollments.length ? (
                <div className="divide-y divide-border">
                  {overview.enrollments.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{item.recordingTitle}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.artistName}</p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{item.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma inscrição disponível.</div>
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border p-5">
                <h2 className="font-semibold text-foreground">UGC Allowlist</h2>
                <p className="mt-1 text-sm text-muted-foreground">Canais autorizados sem alterar o controle de proteção.</p>
              </div>
              {overview?.allowlist.length ? (
                <div className="divide-y divide-border">
                  {overview.allowlist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{item.recordingTitle}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.platformCode} · {item.channelReference}</p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{item.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma entrada de allowlist disponível.</div>
              )}
            </section>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
