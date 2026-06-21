import { Body, Controller, Get, Param, Post, NotFoundException, Inject, UseFilters } from '@nestjs/common';
import { CreateSailorDto } from '../../application/dto/create-sailor.dto';
import { SailorResponseDto } from '../../application/dto/sailor-response.dto';
import { RegisterSailorUseCase } from '../../application/use-cases/register-sailor.use-case';
import { GetSailorByIdUseCase } from '../../application/use-cases/get-sailor-by-id.use-case';
import { ListSailorsUseCase } from '../../application/use-cases/list-sailors.use-case';
import { presentSailor } from '../presenters/sailor.presenter';
import { USE_CASES } from '../constants/providers.constants';
import { DomainExceptionFilter } from '../http/domain-exception.filter';

@Controller('sailors')
@UseFilters(DomainExceptionFilter)
export class SailorController {
  constructor(
    @Inject(USE_CASES.RegisterSailor) private readonly registerSailorUseCase: RegisterSailorUseCase,
    @Inject(USE_CASES.GetSailorById) private readonly getSailorByIdUseCase: GetSailorByIdUseCase,
    @Inject(USE_CASES.ListSailors) private readonly listSailorsUseCase: ListSailorsUseCase
  ) {}

  @Post()
  async create(@Body() body: CreateSailorDto): Promise<SailorResponseDto> {
    const sailor = await this.registerSailorUseCase.execute(body.firstName, body.lastName, body.rank);
    return presentSailor(sailor);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<SailorResponseDto | { message: string }> {
    const sailor = await this.getSailorByIdUseCase.execute(id);
    if (!sailor) {
      throw new NotFoundException('Marinheiro não encontrado.');
    }
    return presentSailor(sailor);
  }

  @Get()
  async list(): Promise<SailorResponseDto[]> {
    const sailors = await this.listSailorsUseCase.execute();
    return sailors.map((sailor) => ({
      ...presentSailor(sailor)
    }));
  }
}
