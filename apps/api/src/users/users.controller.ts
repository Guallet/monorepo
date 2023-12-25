import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  RequestSession,
  RequestUser,
} from 'src/core/auth/request-user.decorator';
import { UserPrincipal } from 'src/core/auth/user-principal';
import { UserDto } from './dto/user.dto';
import { SessionContainer } from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Get('/session')
  async getSessionInformation(
    @RequestUser() user: UserPrincipal,
    @RequestSession() session: SessionContainer,
  ): Promise<any> {
    const response = await UserRoles.getRolesForUser('public', user.id);
    const roles: string[] = response.roles;

    return {
      id: user.id,
      email: user.email,
      accessTokenPayload: session.getAccessTokenPayload(),
      roles: roles,
    };
  }
}
