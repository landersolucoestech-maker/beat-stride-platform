import { FileCheck2, KeyRound, ShieldCheck, UserCheck } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useRightsProtection } from "@/features/rights-protection/use-rights-protection";

export default function RightsProtection() {
  const stateQuery = useRightsProtection();
  const data = stateQuery.data;
  const available = data?.available !== false;
  const summary = data?.summary;
  const items = data?.items ?? [];

  const cards = [
    {
      icon: UserCheck,
      title: "Representação",
      description: "Vínculos de representação e evidências válidas por artista.",
      value: available && summary ? summary.activeRepresentations : null,
    },
    {
      icon: FileCheck2,
      title: "Autoridade",
      description: "Escopos de autoridade para distribuição, direitos, proteção e transferências.",
      value: available && summary ? summary.artistsWithAuthority : null,
    },
    {
      icon: ShieldCheck,
      title: "Artist Protection",
      description: "Controle de proteção vinculado à autoridade válida da organização responsável.",
      value: available && summary ? summary.protectedArtists : null,
    },
    {
      icon: KeyRound,
      title: "Autorizações",
      description: "Autorizações pontuais, por release, catálogo ou Direct Authorization.",
      value: available ? items.reduce((total, item) => total + item.activeAuthorizations, 0) : null,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Direitos e Proteção</h1>
          <p className="text-muted-foreground">Acompanhe representação, autoridade, proteção e autorizações do catálogo.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ icon: Icon, title, description, value }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-semibold text-foreground">{value ?? "—"}</span>
              </div>
              <h2 className="mt-4 font-semibold text-foreground">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="max-w-3xl">
            <h2 className="text-lg font-semibold text-foreground">Controle baseado em autoridade</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Quando um artista estiver sob vínculo ativo e comprovado com uma empresa, a organização autorizada administra Artist Protection e Direct Authorization durante a vigência dessa autoridade. Associação ou seleção de artista, por si só, não concede controle.
            </p>
          </div>
        </div>

        {stateQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : stateQuery.isError ? (
          <div className="rounded-xl border border-destructive/20 bg-card p-10 text-center">
            <h2 className="font-semibold text-foreground">Não foi possível carregar direitos e proteção</h2>
            <p className="mt-2 text-sm text-muted-foreground">A leitura real de autoridade respondeu com erro.</p>
            <Button variant="outline" className="mt-4" onClick={() => void stateQuery.refetch()}>Tentar novamente</Button>
          </div>
        ) : !available ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-4 text-base font-semibold text-foreground">Backend real não conectado neste preview</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">A interface preserva o fluxo visual sem inventar representação, autoridade, proteção ou autorizações.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-4 text-base font-semibold text-foreground">Nenhum artista associado</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Cadastre uma Artist Identity para começar a estruturar direitos, representação e autoridade.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-[minmax(180px,1.5fr)_repeat(4,minmax(120px,1fr))] gap-4 border-b border-border bg-muted/30 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>Artista</span><span>Representação</span><span>Autoridade</span><span>Proteção</span><span>Autorizações</span>
            </div>
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.artistIdentityId} className="grid grid-cols-[minmax(180px,1.5fr)_repeat(4,minmax(120px,1fr))] gap-4 px-5 py-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{item.artistName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.activeRightsDeclarations} declaração(ões) de direitos ativa(s)</p>
                  </div>
                  <span className="text-muted-foreground">{item.representation?.status ?? "Sem vínculo"}</span>
                  <span className="text-muted-foreground">{item.authorityScopes.length > 0 ? `${item.authorityScopes.length} escopo(s)` : "Não verificada"}</span>
                  <span className="text-muted-foreground">{item.protection?.status ?? "Inativa"}</span>
                  <span className="text-muted-foreground">{item.activeAuthorizations}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
