import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateSailorDto } from '../../application/dto/create-sailor.dto';
import { SailorResponseDto } from '../../application/dto/sailor-response.dto';
import { SailorService } from '../../application/services/sailor.service';

@Controller('sailors')
export class SailorController {
  constructor(private readonly sailorService: SailorService) {}

  @Post()
  async create(@Body() body: CreateSailorDto): Promise<SailorResponseDto> {
    const sailor = await this.sailorService.registerSailor(body.firstName, body.lastName, body.rank);
    return {
      id: sailor.id,
      fullName: sailor.name.fullName,
      rank: sailor.rank,
      createdAt: sailor.createdAt
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<SailorResponseDto | { message: string }> {
    const sailor = await this.sailorService.getSailorById(id);
    if (!sailor) {
      return { message: 'Marinheiro não encontrado.' };
    }
    return {
      id: sailor.id,
      fullName: sailor.name.fullName,
      rank: sailor.rank,
      createdAt: sailor.createdAt
    };
  }

  @Get()
  async list(): Promise<SailorResponseDto[]> {
    const sailors = await this.sailorService.listSailors();
    return sailors.map((sailor) => ({
      id: sailor.id,
      fullName: sailor.name.fullName,
      rank: sailor.rank,
      createdAt: sailor.createdAt
    }));
  }
}
