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

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async registerUser(args: {
    user_id: string;
    dto: CreateUserDto;
  }): Promise<User> {
    const existingUser = await this.repository.findOne({
      where: {
        id: args.user_id,
      },
    });

    if (existingUser) {
      throw new ConflictException('User already registered');
    }

    return await this.repository.save({
      id: args.user_id,
      name: args.dto.name,
      email: args.dto.email,
      profile_src: args.dto.profile_src,
    });
  }

  findUserData(user_id: string) {
    return this.repository.findOne({
      where: {
        id: user_id,
      },
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async deleteUserData(userId: string) {
    await this.repository.delete({ id: userId });

    // TODO: Delete User from Supabase
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const user = await this.repository.findOne({ where: { id: userId } });
    if (user) {
      return user.roles;
    }
    throw new NotFoundException('User not found');
  }
}
