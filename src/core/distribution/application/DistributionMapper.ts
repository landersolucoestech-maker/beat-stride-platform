import { UniqueId } from "@/core/shared/domain/UniqueId";
import { Delivery, DeliveryStatus } from "../domain/Delivery";

export interface DeliveryDTO {
  id: string;
  releaseId: string;
  dsp: string;
  status: DeliveryStatus;
  submittedAt: string;
  liveAt?: string;
  errorMessage?: string;
}

export class DistributionMapper {
  static toDTO(d: Delivery): DeliveryDTO {
    return {
      id: d.id.toString(),
      releaseId: d.releaseId,
      dsp: d.dsp,
      status: d.status,
      submittedAt: d.submittedAt,
      liveAt: d.liveAt,
      errorMessage: d.errorMessage,
    };
  }

  static toDomain(dto: DeliveryDTO): Delivery {
    return Delivery.create(
      {
        releaseId: dto.releaseId,
        dsp: dto.dsp,
        status: dto.status,
        submittedAt: dto.submittedAt,
        liveAt: dto.liveAt,
        errorMessage: dto.errorMessage,
      },
      new UniqueId(dto.id),
    );
  }
}
