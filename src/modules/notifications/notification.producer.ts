import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationProducer {
  constructor(@InjectQueue('fintech-notifications') private queue: Queue) {}

  async queueReceipt(data: { email: string; transactionId: string; amountCents: number }) {
    await this.queue.add('send-receipt', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }
}
