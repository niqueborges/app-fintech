import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationProducer } from './notification.producer.js';
import { NotificationConsumer } from './notification.consumer.js';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'fintech-notifications',
    }),
  ],
  providers: [NotificationProducer, NotificationConsumer],
  exports: [NotificationProducer],
})
export class NotificationsModule {}
