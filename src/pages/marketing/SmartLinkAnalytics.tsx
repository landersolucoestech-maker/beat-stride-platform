import { useState } from "react";
import { ArrowLeft, CalendarDays, ExternalLink, Link as LinkIcon, MousePointerClick, Route } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SmartLinkAnalyticsDays } from "@/features/marketing/marketing.types";
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

function formatTimelineDate(date: string, withYear = false): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}

export default function SmartLinkAnalytics() {
  const { smartLinkId } = useParams<{ smartLinkId: string }>();
  const [days, setDays] = useState<SmartLinkAnalyticsDays>(30);
  const query = useSmartLinkAnalytics(smartLinkId, days);
  const data = query.data;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-wrap items-start justify-between gap-4">
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

          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {([7, 30, 90] as SmartLinkAnalyticsDays[]).map((period) => (
              <Button
                key={period}
                type="button"
                size="sm"
                variant={days === period ? "default" : "ghost"}
                onClick={() => setDays(period)}
                disabled={query.isFetching && days === period}
              >
                {period} dias
              </Button>
            ))}
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
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Evolução — últimos {data.periodDays} dias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.timeline.map((day) => ({
                        ...day,
                        visitsValue: Number(day.visits),
                        clicksValue: Number(day.clicks),
                      }))}
                      margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        minTickGap={24}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickFormatter={(value: string) => formatTimelineDate(value)}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      />
                      <Tooltip
                        labelFormatter={(value: string) => formatTimelineDate(value, true)}
                        formatter={(value: number, name: string) => [
                          value.toLocaleString("pt-BR"),
                          name === "visitsValue" ? "Visitas" : "Cliques",
                        ]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="visitsValue"
                        name="Visitas"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="clicksValue"
                        name="Cliques"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    Visitas
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                    Cliques
                  </span>
                </div>

                <div className="overflow-hidden rounded-lg border border-border">
                  <div className="grid grid-cols-[1fr_90px_90px_90px] gap-3 border-b border-border bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
                    <span>Data</span>
                    <span className="text-right">Visitas</span>
                    <span className="text-right">Cliques</span>
                    <span className="text-right">CTR</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {[...data.timeline].reverse().map((day) => (
                      <div
                        key={day.date}
                        className="grid grid-cols-[1fr_90px_90px_90px] gap-3 border-b border-border px-4 py-2 text-sm last:border-b-0"
                      >
                        <span className="text-foreground">
                          {formatTimelineDate(day.date, true)}
                        </span>
                        <span className="text-right text-muted-foreground">
                          {formatDecimalPtBr(day.visits, 0)}
                        </span>
                        <span className="text-right text-muted-foreground">
                          {formatDecimalPtBr(day.clicks, 0)}
                        </span>
                        <span className="text-right text-muted-foreground">
                          {formatDecimalPtBr(day.clickThroughRate, 2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

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
