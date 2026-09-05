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
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import { DeleteUserResponseDto, UserDto } from './dto/user.dto.js';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  UserSettingsDto,
  UserSettingsRequest,
} from './dto/user-settings.dto.js';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiResponse({ status: 200, type: UserDto })
  async findUserDetails(@RequestUser() user: UserPrincipal): Promise<UserDto> {
    const userProfile = await this.usersService.findUserData(user.id);
    if (userProfile) {
      return UserDto.fromDomain(userProfile);
    }

    throw new NotFoundException();
  }

  @Post()
  @ApiOperation({ summary: 'Create the current user profile' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, type: UserDto })
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
  @ApiOperation({ summary: 'Update the current user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, type: UserDto })
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
  @ApiOperation({ summary: 'Delete the current user account' })
  @ApiResponse({ status: 200, type: DeleteUserResponseDto })
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @RequestUser() user: UserPrincipal,
  ): Promise<DeleteUserResponseDto> {
    await this.usersService.removeUser(user.id, {
      deleteFromAuthService: true,
    });
    return { message: 'User deleted successfully' };
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get the current user settings' })
  @ApiResponse({ status: 200, type: UserSettingsDto })
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
  @ApiOperation({ summary: 'Update the current user settings' })
  @ApiBody({ type: UserSettingsRequest })
  @ApiResponse({ status: 200, type: UserSettingsDto })
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
