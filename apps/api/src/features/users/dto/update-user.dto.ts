import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, format: 'email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, format: 'uri' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  profile_src?: string;
}
