import { ConflictException, Injectable, Logger } from '@nestjs/common';
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
