import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRoyalties } from "@/hooks/useCore";
import { container } from "@/core/container";
import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type ParsedRow = {
  trackId: string;
  trackTitle: string;
  artistId: string;
  country: string;
  streams: number;
  gross: number;
};

/**
 * Tela de Importação de Royalties.
 * Faz upload mock de CSV de DSP, normaliza, mostra preview e dispara o
 * use case ImportRoyaltyReportUseCase.
 */
export default function RoyaltyImport() {
  const { data: royalties, reload } = useRoyalties();
  const [dsp, setDsp] = useState("Spotify");
  const [period, setPeriod] = useState("2024-03");
  const [feeRate, setFeeRate] = useState(0.15);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result ?? "");
      const lines = text.split(/\r?\n/).filter(Boolean);
      const [, ...body] = lines;
      const parsed: ParsedRow[] = body.map((l) => {
        const [trackId, trackTitle, artistId, country, streams, gross] = l.split(",");
        return {
          trackId: trackId?.trim(),
          trackTitle: trackTitle?.trim(),
          artistId: artistId?.trim(),
          country: country?.trim(),
          streams: Number(streams),
          gross: Number(gross),
        };
      }).filter(r => r.trackId);
      setRows(parsed);
      toast.success(`${parsed.length} linhas reconhecidas no relatório`);
    };
    reader.readAsText(file);
  };

  const loadMockSample = () => {
    setRows([
      { trackId: "track-1", trackTitle: "Neon Dreams", artistId: "artist-1", country: "BR", streams: 52000, gross: 208.0 },
      { trackId: "track-2", trackTitle: "Shadow Dance", artistId: "artist-2", country: "PT", streams: 31000, gross: 124.0 },
      { trackId: "track-6", trackTitle: "Fast Lane", artistId: "artist-3", country: "US", streams: 174000, gross: 696.0 },
    ]);
    toast.success("Amostra mock carregada");
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setImporting(true);
    const result = await container.useCases.importRoyalties.execute({
      dsp, period, rows, feeRate, currency: "BRL",
    });
    setImporting(false);
    setRows([]);
    reload();
    toast.success(`Importadas ${result.imported} linhas — Líquido R$ ${result.totalNet.toFixed(2)}`);
  };

  const totalGross = rows.reduce((s, r) => s + r.gross, 0);
  const totalNet = totalGross * (1 - feeRate);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Importação de Royalties</h1>
          <p className="text-muted-foreground">Faça upload do relatório do DSP e normalize splits automaticamente.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Novo relatório</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>DSP</Label>
                <Select value={dsp} onValueChange={setDsp}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Spotify", "Apple Music", "YouTube Music", "Deezer", "TikTok", "Amazon Music", "Tidal"].map(d =>
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Período</Label>
                <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="YYYY-MM" />
              </div>
              <div className="space-y-2">
                <Label>Taxa da plataforma</Label>
                <Input
                  type="number" step="0.01" min="0" max="1"
                  value={feeRate}
                  onChange={(e) => setFeeRate(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <Label htmlFor="csv" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-md hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Selecionar CSV</span>
                  </div>
                </Label>
                <input
                  id="csv" type="file" accept=".csv,.txt" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={loadMockSample}>
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Carregar amostra mock
              </Button>
              <Button onClick={handleImport} disabled={!rows.length || importing}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {importing ? "Importando..." : `Importar ${rows.length} linha(s)`}
              </Button>
            </div>

            {rows.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faixa</TableHead>
                      <TableHead>Artista ID</TableHead>
                      <TableHead>País</TableHead>
                      <TableHead className="text-right">Streams</TableHead>
                      <TableHead className="text-right">Bruto (R$)</TableHead>
                      <TableHead className="text-right">Líquido (R$)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{r.trackTitle}</TableCell>
                        <TableCell className="text-muted-foreground">{r.artistId}</TableCell>
                        <TableCell>{r.country}</TableCell>
                        <TableCell className="text-right">{r.streams.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right">{r.gross.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{(r.gross * (1 - feeRate)).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-semibold bg-muted/40">
                      <TableCell colSpan={4}>Totais ({(feeRate * 100).toFixed(0)}% taxa)</TableCell>
                      <TableCell className="text-right">{totalGross.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{totalNet.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de royalties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Faixa</TableHead>
                    <TableHead>DSP</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead className="text-right">Streams</TableHead>
                    <TableHead className="text-right">Líquido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {royalties?.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell><Badge variant="outline">{r.period}</Badge></TableCell>
                      <TableCell className="font-medium">{r.trackTitle}</TableCell>
                      <TableCell>{r.dsp}</TableCell>
                      <TableCell>{r.country}</TableCell>
                      <TableCell className="text-right">{r.streams.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right">R$ {r.netAmount.toFixed(2)}</TableCell>
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
