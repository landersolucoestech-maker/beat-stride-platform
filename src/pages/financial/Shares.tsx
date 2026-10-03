import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSplitOverview } from "@/features/splits/use-split-overview";
import { formatDecimalPtBr } from "@/lib/format-money";

function formatShare(value: string): string {
  const normalized = value.trim();
  const [integer = "0", fraction = ""] = normalized.split(".");
  if (integer === "1") return "100%";
  if (integer !== "0") return `${formatDecimalPtBr(normalized, 2)}%`;
  const digits = `${fraction}000000`.slice(0, 6);
  const basisPoints = BigInt(digits) * 100n / 1_000_000n;
  const whole = basisPoints / 100n;
  const decimals = (basisPoints % 100n).toString().padStart(2, "0");
  return `${whole.toString()},${decimals}%`;
}

export default function Shares() {
  const splitQuery = useSplitOverview();
  const [search, setSearch] = useState("");
  const items = splitQuery.data?.items ?? [];
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (!term) return items;
    return items.filter((item) => item.resourceTitle.toLocaleLowerCase("pt-BR").includes(term));
  }, [items, search]);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Shares</h1>
          <p className="text-muted-foreground">Versões imutáveis de splits aplicadas a lançamentos e gravações.</p>
        </div>

        {!splitQuery.isLoading && splitQuery.data?.available === false && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            O preview não possui backend de splits conectado. Convites, percentuais e participantes fictícios foram removidos.
          </div>
        )}

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar lançamento ou gravação..." className="pl-10" disabled={splitQuery.data?.available === false} />
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Recurso</TableHead><TableHead>Tipo</TableHead><TableHead>Versão</TableHead><TableHead>Vigência</TableHead><TableHead>Participantes</TableHead><TableHead>Divisão</TableHead></TableRow></TableHeader>
            <TableBody>
              {splitQuery.isLoading && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Carregando...</TableCell></TableRow>}
              {!splitQuery.isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground"><div className="flex flex-col items-center gap-2"><Users className="h-6 w-6" /><span>Nenhum split disponível.</span></div></TableCell></TableRow>}
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.resourceTitle}</TableCell>
                  <TableCell><Badge variant="outline">{item.resourceType === "RELEASE" ? "Lançamento" : "Gravação"}</Badge></TableCell>
                  <TableCell>v{item.version}</TableCell>
                  <TableCell>{new Date(item.effectiveFrom).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{item.participants.length}</TableCell>
                  <TableCell>
                    <div className="flex max-w-lg flex-wrap gap-2">
                      {item.participants.map((participant) => (
                        <span key={participant.beneficiaryId} className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {participant.beneficiaryName} · {formatShare(participant.share)}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Alterações futuras criam uma nova versão de split. Valores já contabilizados não são reescritos sem processo explícito de ajuste ou reversão.
        </div>
      </div>
    </MainLayout>
  );
}
