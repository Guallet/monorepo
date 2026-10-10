import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateInstitutionRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ required: false, nullable: true, type: String, format: 'uri' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  image_src?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;
}
