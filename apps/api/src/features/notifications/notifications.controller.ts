import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  Logger,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { NotificationDto } from './dto/notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'findAll' })
  @ApiOkResponse({ type: () => NotificationDto, isArray: true })
  @Get()
  async findAll(
    @RequestUser() user: UserPrincipal,
  ): Promise<NotificationDto[]> {
    const notifications =
      await this.notificationsService.findAllUserNotifications(user.id);
    return notifications.map((notification) =>
      NotificationDto.fromDomain(notification),
    );
  }

  @ApiOperation({ summary: 'findUnread' })
  @ApiOkResponse({ type: () => NotificationDto, isArray: true })
  @Get('unread')
  async findUnread(
    @RequestUser() user: UserPrincipal,
  ): Promise<NotificationDto[]> {
    const notifications =
      await this.notificationsService.findUnreadUserNotifications(user.id);
    return notifications.map((notification) =>
      NotificationDto.fromDomain(notification),
    );
  }

  @ApiOperation({ summary: 'findOne' })
  @ApiOkResponse({ type: () => NotificationDto })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Get(':id')
  async findOne(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<NotificationDto> {
    const notification = await this.notificationsService.findUserNotification({
      userId: user.id,
      notificationId: id,
    });

    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }

    return NotificationDto.fromDomain(notification);
  }

  @ApiOperation({ summary: 'update' })
  @ApiOkResponse({ type: () => NotificationDto })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: () => UpdateNotificationDto })
  @Patch(':id')
  async update(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationDto> {
    const updatedNotification = await this.notificationsService.update({
      userId: user.id,
      notificationId: id,
      dto: updateNotificationDto,
    });
    return NotificationDto.fromDomain(updatedNotification);
  }

  @ApiOperation({ summary: 'markAllAsRead' })
  @ApiCreatedResponse({ description: 'Request completed successfully' })
  @Post('mark-all-read')
  async markAllAsRead(@RequestUser() user: UserPrincipal): Promise<void> {
    await this.notificationsService.markAllAsRead(user.id);
  }

  @ApiOperation({ summary: 'remove' })
  @ApiOkResponse({ type: () => NotificationDto })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Delete(':id')
  async remove(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<NotificationDto> {
    const deletedNotification = await this.notificationsService.remove({
      userId: user.id,
      notificationId: id,
    });
    return NotificationDto.fromDomain(deletedNotification);
  }
}
