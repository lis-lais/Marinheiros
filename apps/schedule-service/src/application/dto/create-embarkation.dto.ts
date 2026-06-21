import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateEmbarkationDto {
  @IsNotEmpty()
  @IsString()
  sailorId!: string;

  @IsNotEmpty()
  @IsString()
  vesselName!: string;

  @IsNotEmpty()
  @IsDateString()
  embarkDate!: string;

  @IsNotEmpty()
  @IsDateString()
  disembarkDate!: string;
}
