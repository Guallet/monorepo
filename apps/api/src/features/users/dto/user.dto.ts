import { User } from '../entities/user.entity.js';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  profile_src: string;

  static fromDomain(domain: User): UserDto {
    return {
      name: domain.name,
      email: domain.email,
      profile_src: domain.profile_image_url,
    };
  }
}
