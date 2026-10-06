import { ExternalLink, Link2, Settings2, ShieldCheck, Unplug, Users } from "lucide-react";
import { toast } from "sonner";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useCreatorsIntegrationOverview,
  useDisconnectCreatorsIntegration,
} from "@/features/creators-integration/use-creators-integration";

const connectionLabels = {
  NOT_CONNECTED: "Não conectado",
  CONNECTED: "Conectado",
  REAUTH_REQUIRED: "Reconexão necessária",
  REVOKED: "Revogado",
} as const;

export default function Integrations() {
  const overviewQuery = useCreatorsIntegrationOverview();
  const disconnectMutation = useDisconnectCreatorsIntegration();
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
      </div>
    </MainLayout>
  );
}
