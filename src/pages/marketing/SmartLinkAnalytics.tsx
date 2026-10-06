import { ArrowLeft, ExternalLink, Link as LinkIcon, MousePointerClick, Route } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSmartLinkAnalytics } from "@/features/marketing/use-marketing";
import { formatDecimalPtBr } from "@/lib/format-money";

function TrafficBreakdown({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: Array<{ value: string; visits: string }>;
  emptyLabel: string;
}) {
  const displayValue = (value: string) => {
    if (value === "DIRECT") return "Direto / sem referrer";
    if (value === "NOT_SET") return "Não informado";
    return value;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.value}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
              >
                <span className="min-w-0 truncate text-sm text-foreground">
                  {displayValue(item.value)}
                </span>
                <Badge variant="secondary">{formatDecimalPtBr(item.visits, 0)} visitas</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SmartLinkAnalytics() {
  const { smartLinkId } = useParams<{ smartLinkId: string }>();
  const query = useSmartLinkAnalytics(smartLinkId);
  const data = query.data;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/marketing/smartlinks" aria-label="Voltar para Smart Links">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <LinkIcon className="h-4 w-4" />
              Marketing
            </div>
            <h1 className="text-2xl font-bold text-foreground">Analytics do Smart Link</h1>
            <p className="text-muted-foreground">
              {data?.title ?? "Visitas e cliques por destino."}
            </p>
          </div>
        </div>

        {query.isLoading ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Carregando analytics...
          </div>
        ) : query.isError || !data ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Não foi possível carregar os dados deste Smart Link.
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Visitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatDecimalPtBr(data.visits, 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Cliques</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatDecimalPtBr(data.clicks, 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">CTR</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatDecimalPtBr(data.clickThroughRate, 2)}%</p>
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5 text-primary" />
                  Cliques por destino
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.destinations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum destino configurado.</p>
                ) : (
                  <div className="space-y-3">
                    {data.destinations.map((destination) => (
                      <div
                        key={destination.code}
                        className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {destination.code.replace(/_/g, " ")}
                            </p>
                            <Badge variant="secondary">
                              {formatDecimalPtBr(destination.clicks, 0)} cliques
                            </Badge>
                          </div>
                          <p className="mt-1 max-w-2xl truncate text-xs text-muted-foreground">
                            {destination.url}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <a href={destination.url} target="_blank" rel="noreferrer">
                            Abrir destino
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Origem do tráfego</h2>
                  <p className="text-sm text-muted-foreground">
                    Distribuição das visitas registradas na landing pública.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TrafficBreakdown
                  title="Referrer"
                  items={data.traffic.referrers}
                  emptyLabel="Nenhuma origem registrada."
                />
                <TrafficBreakdown
                  title="UTM Source"
                  items={data.traffic.utmSources}
                  emptyLabel="Nenhuma UTM source registrada."
                />
                <TrafficBreakdown
                  title="UTM Medium"
                  items={data.traffic.utmMediums}
                  emptyLabel="Nenhuma UTM medium registrada."
                />
                <TrafficBreakdown
                  title="UTM Campaign"
                  items={data.traffic.utmCampaigns}
                  emptyLabel="Nenhuma UTM campaign registrada."
                />
              </div>
            </section>

            {data.linkType === "PRE_SAVE" && (
              <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                Estes dados representam visitas e cliques. Eles não significam pré-save confirmado.
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
