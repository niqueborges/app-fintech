import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

interface NotificationJobData {
  email: string;
  transactionId: string;
  amountCents?: number;
}

@Processor('fintech-notifications')
export class NotificationConsumer extends WorkerHost {
  private readonly logger = new Logger(NotificationConsumer.name);

  async process(
    job: Job<NotificationJobData, { processed: boolean; timestamp: string }, string>
  ): Promise<{ processed: boolean; timestamp: string }> {
    this.logger.log(`Processando job de notificacao assincrona: ${job.name} (ID: ${job.id})`);

    if (job.name === 'send-receipt') {
      this.logger.log(
        `Comprovante gerado e enviado para ${job.data.email}: Transacao ${job.data.transactionId}`
      );
    }

    return { processed: true, timestamp: new Date().toISOString() };
  }
}
