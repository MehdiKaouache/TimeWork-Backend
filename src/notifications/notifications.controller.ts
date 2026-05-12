import { Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {

  constructor(private readonly notificationsService: NotificationsService) {}

  @Get(':id')
  findByUser(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.findByUser(id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }
}