import { UseCase } from "@/core/shared/application/UseCase";
import { Money } from "@/core/shared/domain/Money";
import { RoyaltyLine } from "../domain/RoyaltyLine";
import { RoyaltyRepository } from "../domain/RoyaltyRepository";

export interface ImportRoyaltyReportInput {
  dsp: string;
  period: string;
  rows: Array<{
    trackId: string;
    trackTitle: string;
    artistId: string;
    country: string;
    streams: number;
    gross: number;
  }>;
  feeRate?: number; // taxa da plataforma (0..1)
  currency?: string;
}

export interface ImportRoyaltyReportOutput {
  imported: number;
  totalGross: number;
  totalNet: number;
  currency: string;
}

/**
 * Importa um relatório DSP, calcula valor líquido aplicando a taxa
 * e persiste linhas no repositório.
 */
export class ImportRoyaltyReportUseCase
  implements UseCase<ImportRoyaltyReportInput, ImportRoyaltyReportOutput> {
  constructor(private readonly repo: RoyaltyRepository) {}

  async execute(input: ImportRoyaltyReportInput): Promise<ImportRoyaltyReportOutput> {
    const fee = input.feeRate ?? 0.15;
    const currency = input.currency ?? "BRL";

    const lines = input.rows.map((r) =>
      RoyaltyLine.create({
        trackId: r.trackId,
        trackTitle: r.trackTitle,
        artistId: r.artistId,
        dsp: input.dsp,
        country: r.country,
        streams: r.streams,
        gross: new Money(r.gross, currency),
        net: new Money(r.gross * (1 - fee), currency),
        period: input.period,
      }),
    );

    await this.repo.saveBatch(lines);

    const totalGross = lines.reduce((s, l) => s + l.gross.amount, 0);
    const totalNet = lines.reduce((s, l) => s + l.net.amount, 0);

    return { imported: lines.length, totalGross, totalNet, currency };
  }
}
