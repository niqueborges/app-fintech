import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId?: string;
    userEmail?: string;
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress: string;
    userAgent?: string;
    payload?: unknown;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          userEmail: data.userEmail,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          payload: data.payload ? JSON.stringify(data.payload) : undefined,
        },
      });
    } catch (err: unknown) {
      this.logger.error(
        'Falha ao registrar log de auditoria WORM',
        err instanceof Error ? err.stack : String(err)
      );
    }
  }

  async listLogs(limit = 50) {
    return this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
