import { ExternalLink, Link2, Settings2, Share2, ShieldCheck, Unplug, Users } from "lucide-react";
import { toast } from "sonner";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useCreatorsIntegrationOverview,
  useDisconnectCreatorsIntegration,
} from "@/features/creators-integration/use-creators-integration";
import {
  useBeginMarketingChannelAuthorization,
  useDisconnectMarketingChannel,
  useMarketingChannelIntegrations,
} from "@/features/marketing-channel-integrations/use-marketing-channel-integrations";
import type { MarketingChannelProvider } from "@/features/marketing-channel-integrations/marketing-channel-integrations.types";

const connectionLabels = {
  NOT_CONNECTED: "Não conectado",
  CONNECTED: "Conectado",
  REAUTH_REQUIRED: "Reconexão necessária",
  REVOKED: "Revogado",
} as const;

export default function Integrations() {
  const overviewQuery = useCreatorsIntegrationOverview();
  const disconnectMutation = useDisconnectCreatorsIntegration();
  const channelIntegrationsQuery = useMarketingChannelIntegrations();
  const beginChannelAuthorization = useBeginMarketingChannelAuthorization();
  const disconnectChannel = useDisconnectMarketingChannel();
  const connection = overviewQuery.data?.connection;
  const connected = connection?.status === "CONNECTED";

  const disconnect = async () => {
    try {
      await disconnectMutation.mutateAsync();
      toast.success("Conexão com a Lander Creators revogada.");
    } catch {
      toast.error("Não foi possível revogar a conexão.");
    }
  };

  const connectMarketingChannel = async (provider: MarketingChannelProvider) => {
    try {
      const result = await beginChannelAuthorization.mutateAsync(provider);
      window.location.assign(result.authorizationUrl);
    } catch {
      toast.error("O provedor de autorização deste canal ainda não está configurado.");
    }
  };

  const disconnectMarketingChannel = async (provider: MarketingChannelProvider) => {
    try {
      await disconnectChannel.mutateAsync(provider);
      toast.success("Conexão do canal revogada.");
    } catch {
      toast.error("Não foi possível revogar a conexão deste canal.");
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Settings2 className="h-4 w-4" />
            Configurações
          </div>
          <h1 className="text-2xl font-bold text-foreground">Integrações</h1>
          <p className="mt-1 text-muted-foreground">
            Conecte serviços externos que poderão ser usados nos recursos da plataforma.
          </p>
        </div>

        {!overviewQuery.isLoading && connection?.available === false && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            O provedor de autorização da Lander Creators ainda não está configurado neste ambiente. Nenhuma credencial ou conexão fictícia é exibida.
          </div>
        )}

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-foreground">Lander Creators</h2>
                  <Badge variant="outline">
                    {connection ? connectionLabels[connection.status] : "Carregando"}
                  </Badge>
                </div>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Conecte sua conta para habilitar campanhas com creators dentro do fluxo de Iniciar Marketing.
                </p>
              </div>
            </div>

            {connection?.available && connection.connectUrl && !connected ? (
              <Button asChild className="gradient-primary text-primary-foreground">
                <a href={connection.connectUrl}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Entrar com Lander Creators
                </a>
              </Button>
            ) : connected ? (
              <Button
                variant="outline"
                onClick={() => void disconnect()}
                disabled={disconnectMutation.isPending}
              >
                <Unplug className="mr-2 h-4 w-4" />
                {disconnectMutation.isPending ? "Desconectando..." : "Desconectar"}
              </Button>
            ) : (
              <Button disabled className="gradient-primary text-primary-foreground">
                <Link2 className="mr-2 h-4 w-4" />
                Entrar com Lander Creators
              </Button>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Autorização delegada</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A Distribuição nunca armazena a senha da Lander Creators. A conexão usa escopos autorizados e pode ser revogada.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Link2 className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Disponível no Marketing</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Quando a conta estiver conectada, o recurso Creators será oferecido como uma opção dentro de Iniciar Marketing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {connected && connection?.connectedAt && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <p className="text-xs text-muted-foreground">
                Conectado em {new Date(connection.connectedAt).toLocaleString("pt-BR")}
              </p>
              {connection.manageUrl && (
                <Button asChild variant="ghost" size="sm">
                  <a href={connection.manageUrl} target="_blank" rel="noreferrer">
                    Abrir Lander Creators
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Canais de publicação</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Conecte os canais que poderão ser usados em Marketing → Conteúdos & Publicações. Cada conexão é independente e revogável.
            </p>
          </div>

          <div className="grid gap-4">
            {(channelIntegrationsQuery.data?.providers ?? []).map((provider) => {
              const isConnected = provider.status === "CONNECTED";
              return (
                <div key={provider.code} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Share2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">{provider.label}</h3>
                          <Badge variant="outline">
                            {provider.status === "NOT_CONNECTED"
                              ? "Não conectado"
                              : provider.status === "AUTHORIZATION_PENDING"
                                ? "Autorização pendente"
                                : provider.status === "CONNECTED"
                                  ? "Conectado"
                                  : provider.status === "REAUTH_REQUIRED"
                                    ? "Reconexão necessária"
                                    : "Revogado"}
                          </Badge>
                          {!provider.available && <Badge variant="secondary">Adapter pendente</Badge>}
                        </div>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{provider.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {provider.channels.map((channel) => (
                            <Badge key={channel} variant="secondary" className="font-normal">
                              {channel === "YOUTUBE_SHORTS" ? "YouTube Shorts" : channel.charAt(0) + channel.slice(1).toLowerCase()}
                            </Badge>
                          ))}
                        </div>
                        {provider.externalAccountName && (
                          <p className="mt-3 text-xs text-muted-foreground">
                            Conta: {provider.externalAccountName}
                          </p>
                        )}
                      </div>
                    </div>

                    {isConnected ? (
                      <Button
                        variant="outline"
                        onClick={() => void disconnectMarketingChannel(provider.code)}
                        disabled={!provider.available || disconnectChannel.isPending}
                      >
                        <Unplug className="mr-2 h-4 w-4" />
                        Desconectar
                      </Button>
                    ) : (
                      <Button
                        onClick={() => void connectMarketingChannel(provider.code)}
                        disabled={!provider.available || beginChannelAuthorization.isPending}
                        className="gradient-primary text-primary-foreground"
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Conectar
                      </Button>
                    )}
                  </div>

                  {!provider.available && (
                    <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                      O contrato da integração está preparado, mas o adapter OAuth real deste provedor ainda não está configurado. Nenhuma conta fictícia será conectada.
                    </div>
                  )}
                </div>
              );
            })}

            {!channelIntegrationsQuery.isLoading &&
              (channelIntegrationsQuery.data?.providers.length ?? 0) === 0 && (
                <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                  As integrações de publicação ainda não estão disponíveis neste ambiente.
                </div>
              )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
