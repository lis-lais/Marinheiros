import { Embarkation } from '../../domain/entities/embarkation.entity';
import { EmbarkationResponseDto } from '../../application/dto/embarkation-response.dto';

export function presentEmbarkation(entry: Embarkation): EmbarkationResponseDto {
  return {
    id: entry.id,
    sailorId: entry.sailorId,
    vesselName: entry.vesselName,
    embarkDate: entry.period.startDate,
    disembarkDate: entry.period.endDate,
    createdAt: entry.createdAt
  };
}
