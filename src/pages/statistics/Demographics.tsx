import { MainLayout } from "@/components/layout/MainLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const ageData = [
  { age: '13-17', value: 8 },
  { age: '18-24', value: 32 },
  { age: '25-34', value: 28 },
  { age: '35-44', value: 18 },
  { age: '45-54', value: 9 },
  { age: '55+', value: 5 },
];

const genderData = [
  { name: 'Masculino', value: 54, color: 'hsl(var(--chart-1))' },
  { name: 'Feminino', value: 42, color: 'hsl(var(--chart-2))' },
  { name: 'Outro', value: 4, color: 'hsl(var(--chart-3))' },
];

const countryData = [
  { country: 'Brasil', streams: 456000 },
  { country: 'Portugal', streams: 89000 },
  { country: 'EUA', streams: 67000 },
  { country: 'México', streams: 45000 },
  { country: 'Argentina', streams: 34000 },
];

const cityData = [
  { city: 'São Paulo', streams: 156000 },
  { city: 'Rio de Janeiro', streams: 98000 },
  { city: 'Belo Horizonte', streams: 45000 },
  { city: 'Curitiba', streams: 34000 },
  { city: 'Porto Alegre', streams: 28000 },
];

export default function Demographics() {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dados Demográficos</h1>
          <p className="text-muted-foreground">Entenda melhor seu público</p>
        </div>

        {/* Age and Gender */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-card border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Distribuição por Idade</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <XAxis 
                    dataKey="age" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Percentual']}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Distribuição por Gênero</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Percentual']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {genderData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-medium text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Countries and Cities */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-card border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Top Países</h3>
            <div className="space-y-4">
              {countryData.map((item, index) => (
                <div key={item.country} className="flex items-center gap-4">
                  <span className="w-6 text-center text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{item.country}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.streams.toLocaleString('pt-BR')} streams
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-primary"
                        style={{ width: `${(item.streams / countryData[0].streams) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Top Cidades</h3>
            <div className="space-y-4">
              {cityData.map((item, index) => (
                <div key={item.city} className="flex items-center gap-4">
                  <span className="w-6 text-center text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{item.city}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.streams.toLocaleString('pt-BR')} streams
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-chart-2"
                        style={{ width: `${(item.streams / cityData[0].streams) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
