import { MainLayout } from "@/components/layout/MainLayout";
import { royalties, dspData } from "@/data/mockData";
import { useState } from "react";
import { Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

export default function FinancialAnalytics() {
  const [dspFilter, setDspFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("2024-02");

  const filteredRoyalties = royalties.filter((r) => {
    const matchesDsp = dspFilter === "all" || r.dsp === dspFilter;
    const matchesPeriod = r.period === periodFilter;
    return matchesDsp && matchesPeriod;
  });

  const totalStreams = filteredRoyalties.reduce((sum, r) => sum + r.streams, 0);
  const totalGross = filteredRoyalties.reduce((sum, r) => sum + r.grossRevenue, 0);
  const totalNet = filteredRoyalties.reduce((sum, r) => sum + r.netRevenue, 0);

  const uniqueDsps = [...new Set(royalties.map((r) => r.dsp))];

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Análises Mensais</h1>
            <p className="text-muted-foreground">Acompanhe seus royalties e receitas</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-card border border-border p-6">
            <p className="text-sm text-muted-foreground">Total de Streams</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {totalStreams.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="rounded-xl bg-card border border-border p-6">
            <p className="text-sm text-muted-foreground">Receita Bruta</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              R$ {totalGross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded-xl bg-card border border-border p-6">
            <p className="text-sm text-muted-foreground">Receita Líquida</p>
            <p className="text-2xl font-bold text-success mt-1">
              R$ {totalNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-card border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Receita por Plataforma</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dspData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {dspData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Distribuição de Streams</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dspData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="streams"
                  >
                    {dspData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Streams']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {dspData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={dspFilter} onValueChange={setDspFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {uniqueDsps.map((dsp) => (
                <SelectItem key={dsp} value={dsp}>{dsp}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-02">Fevereiro 2024</SelectItem>
              <SelectItem value="2024-01">Janeiro 2024</SelectItem>
              <SelectItem value="2023-12">Dezembro 2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Faixa</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Plataforma</th>
                  <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Streams</th>
                  <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Receita Bruta</th>
                  <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Receita Líquida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRoyalties.map((royalty) => (
                  <tr key={royalty.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 text-foreground">{royalty.trackTitle}</td>
                    <td className="px-4 py-4 text-muted-foreground">{royalty.dsp}</td>
                    <td className="px-4 py-4 text-right text-foreground">
                      {royalty.streams.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-right text-muted-foreground">
                      R$ {royalty.grossRevenue.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-success">
                      R$ {royalty.netRevenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
