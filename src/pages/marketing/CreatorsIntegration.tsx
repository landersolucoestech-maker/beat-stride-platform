import { ArrowRight, CheckCircle2, ExternalLink, Link2, Megaphone, ShieldCheck, Users } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";

const flowSteps = [
  "Conectar a conta da Lander Creators",
  "Selecionar o lançamento",
  "Escolher pacote e configurar briefing",
  "Revisar preço e abrir checkout",
  "Acompanhar campanha e resultados",
];

export default function CreatorsIntegration() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <Megaphone className="h-4 w-4" />
              Marketing
            </div>
            <h1 className="text-2xl font-bold text-foreground">Lander Creators</h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              Conecte sua conta da Lander Creators para promover lançamentos com criadores sem sair do fluxo de distribuição.
            </p>
          </div>
          <Button disabled className="gradient-primary text-primary-foreground">
            <Link2 className="mr-2 h-4 w-4" />
            Conectar Lander Creators
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Conta não conectada</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A autenticação delegada será ativada quando o contrato real da API da Lander Creators estiver disponível.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">Não conectado</span>
            </div>

            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Conta própria e autorização explícita</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A Distribuição não recebe sua senha da Lander Creators. A conexão será revogável, limitada ao escopo autorizado e vinculada à organização correta.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground">Campanhas sincronizadas</h2>
            <div className="mt-8 flex flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Megaphone className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Nenhuma campanha</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Campanhas autorizadas aparecerão aqui após a conexão.
              </p>
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-foreground">Como funcionará</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A experiência reutiliza os dados do lançamento sem transferir a propriedade do catálogo para a Lander Creators.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {flowSteps.map((step, index) => (
              <div key={step} className="relative rounded-lg border border-border bg-background p-4">
                <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="text-sm font-medium text-foreground">{step}</p>
                {index < flowSteps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-card text-muted-foreground md:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <CheckCircle2 className="mb-3 h-5 w-5 text-primary" />
            <h3 className="font-medium text-foreground">Contexto do lançamento</h3>
            <p className="mt-1 text-sm text-muted-foreground">Artista, release, capa, data, identificadores e materiais autorizados poderão ser reutilizados no briefing.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
            <h3 className="font-medium text-foreground">Pagamento confirmado no servidor</h3>
            <p className="mt-1 text-sm text-muted-foreground">O retorno do navegador não ativa campanha. A confirmação depende do estado autoritativo da Lander Creators.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <ExternalLink className="mb-3 h-5 w-5 text-primary" />
            <h3 className="font-medium text-foreground">Operação avançada externa</h3>
            <p className="mt-1 text-sm text-muted-foreground">A gestão operacional completa continuará disponível diretamente na Lander Creators.</p>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
