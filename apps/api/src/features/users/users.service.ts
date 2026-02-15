import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/auth/user-principal';
import { UserSettingsRequest } from './dto/user-settings.dto';
import {
  USER_CREATED_EVENT,
  USER_EVENTS_QUEUE,
  UserCreatedEventPayload,
} from './users-events.constants';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  // Allowed date formats for user preference
  private static readonly ALLOWED_DATE_FORMATS = [
    'MM/DD/YYYY',
    'DD/MM/YYYY',
    'YYYY/MM/DD',
  ];

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectQueue(USER_EVENTS_QUEUE)
    private readonly userEventsQueue: Queue<UserCreatedEventPayload>,
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
    const existingUser = await this.repository.findOne({
      where: {
        id: id,
      },
    });

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

    if (!existingUser) {
      await this.enqueueUserCreatedEvent(entity.id);
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

    const createdUser = await this.repository.save({
      id: user_id,
      name: dto.name,
      email: dto.email,
      profile_src: dto.profile_src,
    });

    await this.enqueueUserCreatedEvent(createdUser.id);

    return createdUser;
  }

  async enqueueUserCreatedEvent(userId: string): Promise<void> {
    try {
      await this.userEventsQueue.add(
        USER_CREATED_EVENT,
        {
          userId,
        },
        {
          attempts: 3,
          removeOnComplete: 100,
          removeOnFail: 100,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish ${USER_CREATED_EVENT} for user ${userId}`,
        error,
      );
    }
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

    if (dto.date_format !== undefined && dto.date_format !== null) {
      const value = dto.date_format;
      if (!UsersService.ALLOWED_DATE_FORMATS.includes(value)) {
        throw new BadRequestException(
          `Invalid date_format. Allowed values: ${UsersService.ALLOWED_DATE_FORMATS.join(', ')}`,
        );
      }
      user.date_format = value;
    }

    return await this.repository.save(user);
  }
}
