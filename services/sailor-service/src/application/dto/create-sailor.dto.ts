import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSailorDto {
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @IsNotEmpty()
  @IsString()
  rank!: string;
}
