import { User } from '../entities/user.entity';

export class UserDto {
  name: string;
  email: string;
  profile_src: string;

  static fromDomain(domain: User): UserDto {
    return {
      name: domain.name,
      email: domain.email,
      profile_src: domain.profile_image_url,
    };
  }
}
