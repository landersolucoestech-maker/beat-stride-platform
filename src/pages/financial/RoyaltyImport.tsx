import { useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useImportStatement, useRoyalties, useStatementImportOptions } from "@/features/finance/use-finance";
import { formatMoneyPtBr } from "@/lib/format-money";
import { toast } from "sonner";

export default function RoyaltyImport() {
  const optionsQuery = useStatementImportOptions();
  const royaltiesQuery = useRoyalties({});
  const importMutation = useImportStatement();
  const [providerCode, setProviderCode] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const options = optionsQuery.data;
  const dataAvailable = options?.available === true;
  const selectedProvider = options?.providers.find((provider) => provider.code === providerCode) ?? null;

  const importStatement = async () => {
    if (!providerCode || !file) {
      toast.error("Selecione o provider e o arquivo do statement.");
      return;
    }

    try {
      const result = await importMutation.mutateAsync({ providerCode, file });
      toast.success(`Statement recebido com status ${result.status}. A normalização será processada no backend.`);
      setFile(null);
    } catch {
      toast.error("O statement não foi importado. Nenhum royalty foi criado localmente.");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Importar Royalties</h1>
          <p className="text-muted-foreground">Ingestão de statements oficiais, normalização, matching e reconciliação.</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Novo statement</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {!optionsQuery.isLoading && !dataAvailable && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                Os formatos aceitos e providers disponíveis serão carregados do backend real. O preview não inventa DSPs, taxas ou layouts de arquivo.
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={providerCode} onValueChange={setProviderCode} disabled={!dataAvailable}>
                  <SelectTrigger><SelectValue placeholder="Selecione o provider" /></SelectTrigger>
                  <SelectContent>
                    {options?.providers.map((provider) => <SelectItem key={provider.code} value={provider.code}>{provider.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {selectedProvider && <p className="text-xs text-muted-foreground">Formatos aceitos: {selectedProvider.acceptedFileTypes.join(", ") || "definidos pelo provider"}</p>}
              </div>

              <div className="space-y-2">
                <Label>Arquivo do statement</Label>
                <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-dashed border-input bg-background px-4 py-2 transition-colors hover:bg-muted/50">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate text-sm text-muted-foreground">{file?.name ?? "Selecionar arquivo"}</span>
                  <input type="file" className="hidden" onChange={(event) => setFile(event.target.files?.[0] ?? null)} disabled={!dataAvailable} />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <div><p className="text-sm font-medium text-foreground">Processamento server-side</p><p className="text-xs text-muted-foreground">Arquivo bruto preservado; parsing, matching, comissões, splits e reconciliação não dependem do navegador.</p></div>
              </div>
              <Button onClick={() => void importStatement()} disabled={!file || !providerCode || importMutation.isPending}>
                {importMutation.isPending ? "Enviando..." : "Importar Statement"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Royalties normalizados</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader><TableRow><TableHead>Período</TableHead><TableHead>Faixa</TableHead><TableHead>Provider</TableHead><TableHead>Território</TableHead><TableHead className="text-right">Usos</TableHead><TableHead className="text-right">Bruto</TableHead><TableHead className="text-right">Líquido</TableHead><TableHead>Matching</TableHead></TableRow></TableHeader>
                <TableBody>
                  {royaltiesQuery.isLoading && <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">Carregando...</TableCell></TableRow>}
                  {!royaltiesQuery.isLoading && (royaltiesQuery.data?.items.length ?? 0) === 0 && <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">Nenhuma linha de royalty disponível.</TableCell></TableRow>}
                  {royaltiesQuery.data?.items.map((royalty) => (
                    <TableRow key={royalty.id}>
                      <TableCell><Badge variant="outline">{royalty.period}</Badge></TableCell>
                      <TableCell className="font-medium">{royalty.trackTitle}</TableCell>
                      <TableCell>{royalty.providerLabel}</TableCell>
                      <TableCell>{royalty.territoryCode ?? "—"}</TableCell>
                      <TableCell className="text-right">{royalty.usageCount ?? "—"}</TableCell>
                      <TableCell className="text-right">{formatMoneyPtBr(royalty.grossAmount.amount, royalty.grossAmount.currency)}</TableCell>
                      <TableCell className="text-right">{royalty.netAmount ? formatMoneyPtBr(royalty.netAmount.amount, royalty.netAmount.currency) : "—"}</TableCell>
                      <TableCell><Badge variant={royalty.matched ? "default" : "outline"}>{royalty.matched ? "Conciliado" : "Pendente"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
