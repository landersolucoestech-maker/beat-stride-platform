import { UniqueId } from "@/core/shared/domain/UniqueId";
import { FraudAlert, FraudSeverity, FraudStatus } from "../domain/FraudAlert";

export interface FraudAlertDTO {
  id: string;
  trackId: string;
  trackTitle: string;
  artistName: string;
  dsp: string;
  detectedAt: string;
  reason: string;
  suspiciousStreams: number;
  severity: FraudSeverity;
  status: FraudStatus;
}

export class FraudMapper {
  static toDTO(a: FraudAlert): FraudAlertDTO {
    return {
      id: a.id.toString(),
      trackId: a.trackId,
      trackTitle: a.trackTitle,
      artistName: a.artistName,
      dsp: a.dsp,
      detectedAt: a.detectedAt,
      reason: a.reason,
      suspiciousStreams: a.suspiciousStreams,
      severity: a.severity,
      status: a.status,
    };
  }

  static toDomain(dto: FraudAlertDTO): FraudAlert {
    return FraudAlert.create(
      {
        trackId: dto.trackId,
        trackTitle: dto.trackTitle,
        artistName: dto.artistName,
        dsp: dto.dsp,
        detectedAt: dto.detectedAt,
        reason: dto.reason,
        suspiciousStreams: dto.suspiciousStreams,
        severity: dto.severity,
        status: dto.status,
      },
      new UniqueId(dto.id),
    );
  }
}
