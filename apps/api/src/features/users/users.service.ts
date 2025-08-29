import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/auth/user-principal';
import { UserSettingsRequest } from './dto/user-settings.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async upsertUser({
    id,
    email,
    name,
    avatar_url,
  }: {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
  }) {
    await this.repository.upsert(
      {
        id: id,
        name: name,
        email: email,
        profile_image_url: avatar_url,
      },
      {
        conflictPaths: ['id'],
      },
    );

    const entity = await this.repository.findOne({
      where: {
        id: id,
      },
    });
    if (!entity) {
      throw new NotFoundException('User not found');
    }
    return entity;
  }

  /**
   * @deprecated Use upsertUser instead
   */
  async registerUser({
    user_id,
    dto,
  }: {
    user_id: string;
    dto: CreateUserDto;
  }): Promise<User> {
    const existingUser = await this.repository.findOne({
      where: {
        id: user_id,
      },
    });

    if (existingUser) {
      throw new ConflictException('User already registered');
    }

    return await this.repository.save({
      id: user_id,
      name: dto.name,
      email: dto.email,
      profile_src: dto.profile_src,
    });
  }

  async findUserData(user_id: string): Promise<User | null> {
    return this.repository.findOne({
      where: {
        id: user_id,
      },
    });
  }

  async updateUser({
    user_id,
    dto,
  }: {
    user_id: string;
    dto: UpdateUserDto;
  }): Promise<User> {
    const dbEntity = await this.repository.findOne({
      where: { id: user_id },
    });

    if (dbEntity === null) {
      throw new NotFoundException();
    }

    dbEntity.email = dto.email ?? dbEntity.email;
    dbEntity.name = dto.name ?? dbEntity.name;
    dbEntity.profile_image_url = dto.profile_src ?? dbEntity.profile_image_url;

    return await this.repository.save(dbEntity);
  }

  async removeUser(
    userId: string,
    options: { deleteFromAuthService: boolean },
  ): Promise<User> {
    const user = await this.repository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`User not found: ${userId}`);
      throw new NotFoundException('User not found');
    }
    const removed = await this.repository.remove(user);
    this.logger.log(`User removed from DB: ${userId}`);

    // TODO: Remove from auth service
    if (options.deleteFromAuthService === true) {
      // Call auth service to remove user
      this.logger.log(`User removed from auth service: ${userId}`);
    }

    return removed;
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const user = await this.repository.findOne({ where: { id: userId } });
    if (user) {
      return user.roles;
    }
    this.logger.warn(`User not found: ${userId}`);
    throw new NotFoundException('User not found');
  }

  async updateUserSettings({
    userId,
    dto,
  }: {
    userId: string;
    dto: UserSettingsRequest;
  }): Promise<User> {
    const user = await this.repository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.default_currency =
      dto.currencies?.default_currency ?? user.default_currency;
    user.preferred_currencies =
      dto.currencies?.preferred_currencies ?? user.preferred_currencies;

    return await this.repository.save(user);
  }
}
