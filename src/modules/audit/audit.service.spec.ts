jest.mock('../../infrastructure/database/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('../../generated/prisma/client.js', () => ({
  PrismaClient: class PrismaClient {},
}));

import { AuditService } from './audit.service.js';
import type { PrismaService } from '../../infrastructure/database/prisma.service.js';

describe('AuditService', () => {
  let service: AuditService;
  let prismaMock: {
    auditLog: { create: jest.Mock; findMany: jest.Mock };
  };

  beforeEach(() => {
    prismaMock = {
      auditLog: { create: jest.fn(), findMany: jest.fn() },
    };
    service = new AuditService(prismaMock as unknown as PrismaService);
  });

  it('should call prisma.auditLog.create', async () => {
    await service.log({
      action: 'PIX_TRANSFER',
      resource: 'TRANSACTION',
      ipAddress: '127.0.0.1',
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalled();
  });
});
