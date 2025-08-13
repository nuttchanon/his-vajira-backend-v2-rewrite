import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingRepository } from './messaging.repository';

@Module({
  controllers: [MessagingController],
  providers: [MessagingService, MessagingRepository],
  exports: [MessagingService, MessagingRepository],
})
export class MessagingModule {}
