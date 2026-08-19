import { IsOptional, IsString } from 'class-validator';

export class AnimalQueryDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  health?: string;

  @IsOptional()
  @IsString()
  county?: string;
}
