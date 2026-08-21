jest.mock('../../infrastructure/database/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('../../generated/prisma/client.js', () => ({
  PrismaClient: class PrismaClient {},
}));

import { AccountsService } from './accounts.service.js';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../infrastructure/database/prisma.service.js';

describe('AccountsService', () => {
  let service: AccountsService;
  let prismaMock: {
    account: { findFirst: jest.Mock };
    pixKey: { findUnique: jest.Mock; create: jest.Mock };
    ledgerEntry: { findMany: jest.Mock; count: jest.Mock };
  };

  beforeEach(() => {
    prismaMock = {
      account: { findFirst: jest.fn() },
      pixKey: { findUnique: jest.fn(), create: jest.fn() },
      ledgerEntry: { findMany: jest.fn(), count: jest.fn() },
    };
    service = new AccountsService(prismaMock as unknown as PrismaService);
  });

  it('should throw NotFoundException if account not found', async () => {
    prismaMock.account.findFirst.mockResolvedValue(null);
    await expect(service.getBalance('fake-id')).rejects.toThrow(NotFoundException);
  });
});
