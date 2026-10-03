import { FileCheck2, KeyRound, ShieldCheck, UserCheck } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";

const cards = [
  {
    icon: UserCheck,
    title: "Representação",
    description: "Vínculos de representação e evidências válidas por artista.",
  },
  {
    icon: FileCheck2,
    title: "Autoridade",
    description: "Escopos de autoridade para distribuição, direitos, proteção e transferências.",
  },
  {
    icon: ShieldCheck,
    title: "Artist Protection",
    description: "Controle de proteção vinculado à autoridade válida da organização responsável.",
  },
  {
    icon: KeyRound,
    title: "Autorizações",
    description: "Autorizações pontuais, por release, catálogo ou Direct Authorization.",
  },
];

export default function RightsProtection() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Direitos e Proteção</h1>
          <p className="text-muted-foreground">Acompanhe representação, autoridade, proteção e autorizações do catálogo.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mt-4 font-semibold text-foreground">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-foreground">Controle baseado em autoridade</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Quando um artista estiver sob vínculo ativo e comprovado com uma empresa, a organização autorizada administra Artist Protection e Direct Authorization durante a vigência dessa autoridade. Associação ou seleção de artista, por si só, não concede controle.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              Nenhum artista selecionado
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-4 text-base font-semibold text-foreground">Nenhum estado de proteção carregado</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Os controles serão habilitados somente após a conexão com as fontes reais de Artist Identity, representação e autoridade.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
