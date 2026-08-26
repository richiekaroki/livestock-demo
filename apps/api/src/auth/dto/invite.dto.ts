import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class InviteDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  county!: string;

  @IsOptional()
  @IsString()
  subCounty?: string;
}
