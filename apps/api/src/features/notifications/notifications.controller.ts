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
import { NotificationsService } from './notifications.service.js';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import { NotificationDto } from './dto/notification.dto.js';
import { UpdateNotificationDto } from './dto/update-notification.dto.js';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List the current user’s notifications' })
  @ApiResponse({ status: 200, type: [NotificationDto] })
  async findAll(
    @RequestUser() user: UserPrincipal,
  ): Promise<NotificationDto[]> {
    const notifications =
      await this.notificationsService.findAllUserNotifications(user.id);
    return notifications.map((notification) =>
      NotificationDto.fromDomain(notification),
    );
  }

  @Get('unread')
  @ApiOperation({ summary: 'List the current user’s unread notifications' })
  @ApiResponse({ status: 200, type: [NotificationDto] })
  async findUnread(
    @RequestUser() user: UserPrincipal,
  ): Promise<NotificationDto[]> {
    const notifications =
      await this.notificationsService.findUnreadUserNotifications(user.id);
    return notifications.map((notification) =>
      NotificationDto.fromDomain(notification),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Notification ID' })
  @ApiResponse({ status: 200, type: NotificationDto })
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

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Notification ID' })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({ status: 200, type: NotificationDto })
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

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 201, description: 'Notifications marked as read' })
  async markAllAsRead(@RequestUser() user: UserPrincipal): Promise<void> {
    await this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Notification ID' })
  @ApiResponse({ status: 200, type: NotificationDto })
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
