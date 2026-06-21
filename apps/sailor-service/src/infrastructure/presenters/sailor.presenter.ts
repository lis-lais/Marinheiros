import { Sailor } from '../../domain/entities/sailor.entity';
import { SailorResponseDto } from '../../application/dto/sailor-response.dto';

export function presentSailor(sailor: Sailor): SailorResponseDto {
  return {
    id: sailor.id,
    fullName: sailor.name.fullName,
    rank: sailor.rank,
    createdAt: sailor.createdAt
  };
}
