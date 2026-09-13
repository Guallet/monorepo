import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false, format: 'email' })
  email?: string;

  @ApiProperty({ required: false, format: 'uri' })
  profile_src?: string;
}
