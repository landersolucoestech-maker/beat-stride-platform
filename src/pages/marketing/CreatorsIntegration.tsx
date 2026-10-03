import { ArrowRight, CheckCircle2, ExternalLink, Link2, Megaphone, ShieldCheck, Unplug, Users } from "lucide-react";
import { toast } from "sonner";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCreatorsIntegrationOverview, useDisconnectCreatorsIntegration } from "@/features/creators-integration/use-creators-integration";

const flowSteps = [
  "Conectar a conta da Lander Creators",
  "Selecionar o lançamento",
  "Escolher pacote e configurar briefing",
  "Revisar preço e abrir checkout",
  "Acompanhar campanha e resultados",
];

const connectionLabels = {
  NOT_CONNECTED: "Não conectado",
  CONNECTED: "Conectado",
  REAUTH_REQUIRED: "Reconexão necessária",
  REVOKED: "Revogado",
} as const;

export default function CreatorsIntegration() {
  const overviewQuery = useCreatorsIntegrationOverview();
  const disconnectMutation = useDisconnectCreatorsIntegration();
  const overview = overviewQuery.data;
  const connection = overview?.connection;
  const connected = connection?.status === "CONNECTED";

  const disconnect = async () => {
    try {
      await disconnectMutation.mutateAsync();
      toast.success("Conexão com a Lander Creators revogada.");
    } catch {
      toast.error("Não foi possível revogar a conexão.");
    }
  };

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
              Integração autorizada para promover lançamentos com criadores sem transferir a propriedade operacional do domínio Creators para a Distribuição.
            </p>
          </div>

          {connection?.available && connection.connectUrl && !connected ? (
            <Button asChild className="gradient-primary text-primary-foreground">
              <a href={connection.connectUrl}>
                <Link2 className="mr-2 h-4 w-4" />
                Conectar Lander Creators
              </a>
            </Button>
          ) : connected ? (
            <Button variant="outline" onClick={() => void disconnect()} disabled={disconnectMutation.isPending}>
              <Unplug className="mr-2 h-4 w-4" />
              {disconnectMutation.isPending ? "Desconectando..." : "Desconectar"}
            </Button>
          ) : (
            <Button disabled className="gradient-primary text-primary-foreground">
              <Link2 className="mr-2 h-4 w-4" />
              Conectar Lander Creators
            </Button>
          )}
        </div>

        {!overviewQuery.isLoading && connection?.available === false && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            O contrato real da integração Lander Creators ainda não está conectado a este preview. Nenhum pacote, preço, campanha ou autorização fictícia é exibido.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    {connected ? connection?.connectedOrganizationName ?? "Conta conectada" : "Conta não conectada"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {connected
                      ? "A Distribuição mantém somente a conexão autorizada, o mapeamento de organização e projeções necessárias ao fluxo de marketing."
                      : "A conexão usa autorização delegada e nunca armazena a senha da Lander Creators."}
                  </p>
                </div>
              </div>
              <Badge variant="outline">{connection ? connectionLabels[connection.status] : "Carregando"}</Badge>
            </div>

            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Conta própria e autorização explícita</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Escopos, tokens e organização vinculada são controlados pelo backend. A conexão é revogável e não concede acesso automático a outros produtos do ecossistema.
                  </p>
                </div>
              </div>
            </div>

            {connected && connection?.connectedAt && (
              <p className="mt-4 text-xs text-muted-foreground">Conectado em {new Date(connection.connectedAt).toLocaleString("pt-BR")}</p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground">Campanhas sincronizadas</h2>
            {(overview?.campaigns.length ?? 0) === 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Megaphone className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Nenhuma campanha disponível</p>
                <p className="mt-1 text-sm text-muted-foreground">Somente campanhas autorizadas e projetadas pela Lander Creators aparecem aqui.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {overview?.campaigns.map((campaign) => (
                  <div key={campaign.externalCampaignId} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{campaign.releaseTitle}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{campaign.statusLabel}</p>
                      </div>
                      {campaign.openUrl && (
                        <Button size="icon" variant="ghost" asChild>
                          <a href={campaign.openUrl} target="_blank" rel="noreferrer" aria-label="Abrir campanha na Lander Creators">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-foreground">Fluxo de integração</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A experiência reutiliza contexto autorizado do lançamento. Pacotes, preços, checkout, status e resultados permanecem autoritativos na Lander Creators.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {flowSteps.map((step, index) => (
              <div key={step} className="relative rounded-lg border border-border bg-background p-4">
                <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</div>
                <p className="text-sm font-medium text-foreground">{step}</p>
                {index < flowSteps.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-card text-muted-foreground md:block" />}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5"><CheckCircle2 className="mb-3 h-5 w-5 text-primary" /><h3 className="font-medium text-foreground">Contexto do lançamento</h3><p className="mt-1 text-sm text-muted-foreground">Somente dados e materiais necessários ao briefing são compartilhados dentro do escopo autorizado.</p></div>
          <div className="rounded-xl border border-border bg-card p-5"><ShieldCheck className="mb-3 h-5 w-5 text-primary" /><h3 className="font-medium text-foreground">Pagamento confirmado no servidor</h3><p className="mt-1 text-sm text-muted-foreground">Retorno do navegador nunca ativa uma campanha. O estado autoritativo vem da Lander Creators.</p></div>
          <div className="rounded-xl border border-border bg-card p-5"><ExternalLink className="mb-3 h-5 w-5 text-primary" /><h3 className="font-medium text-foreground">Operação avançada externa</h3><p className="mt-1 text-sm text-muted-foreground">Rede de creators, contratos, pagamentos e execução completa continuam sob propriedade operacional da Lander Creators.</p>{connection?.manageUrl && connected && <Button asChild variant="outline" size="sm" className="mt-4"><a href={connection.manageUrl} target="_blank" rel="noreferrer">Abrir Lander Creators<ExternalLink className="ml-2 h-4 w-4" /></a></Button>}</div>
        </section>
      </div>
    </MainLayout>
  );
}
