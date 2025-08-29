import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Logger,
  NotFoundException,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { UserDto } from './dto/user.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserSettingsDto, UserSettingsRequest } from './dto/user-settings.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findUserDetails(@RequestUser() user: UserPrincipal) {
    const userProfile = await this.usersService.findUserData(user.id);
    if (userProfile) {
      return UserDto.fromDomain(userProfile);
    }

    throw new NotFoundException();
  }

  @Post()
  async registerUser(
    @RequestUser() user: UserPrincipal,
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserDto> {
    const entity = await this.usersService.registerUser({
      user_id: user.id,
      dto: createUserDto,
    });
    return UserDto.fromDomain(entity);
  }

  @Patch()
  async updateUser(
    @RequestUser() user: UserPrincipal,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    const userEntity = await this.usersService.updateUser({
      user_id: user.id,
      dto: updateUserDto,
    });
    return UserDto.fromDomain(userEntity);
  }

  @Delete()
  @HttpCode(202)
  async deleteUser(@RequestUser() user: UserPrincipal) {
    await this.usersService.removeUser(user.id, {
      deleteFromAuthService: true,
    });
    return { message: 'User deleted successfully' };
  }

  @Get('settings')
  async getUserSettings(
    @RequestUser() user: UserPrincipal,
  ): Promise<UserSettingsDto> {
    const userEntity = await this.usersService.findUserData(user.id);
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }
    return UserSettingsDto.fromDomain(userEntity);
  }

  @Patch('settings')
  async updateUserSettings(
    @RequestUser() user: UserPrincipal,
    @Body() requestDto: UserSettingsRequest,
  ): Promise<UserSettingsDto> {
    const userEntity = await this.usersService.updateUserSettings({
      userId: user.id,
      dto: requestDto,
    });

    return UserSettingsDto.fromDomain(userEntity);
  }
}
