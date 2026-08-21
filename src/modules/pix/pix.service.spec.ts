jest.mock('../../infrastructure/database/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('../../generated/prisma/client.js', () => ({
  PrismaClient: class PrismaClient {},
}));

import { PixService } from './pix.service.js';
import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../../infrastructure/database/prisma.service.js';

describe('PixService', () => {
  let service: PixService;
  let prismaMock: {
    transaction: { findUnique: jest.Mock };
    account: { findFirst: jest.Mock };
    pixKey: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    prismaMock = {
      transaction: { findUnique: jest.fn() },
      account: { findFirst: jest.fn() },
      pixKey: { findUnique: jest.fn() },
      $transaction: jest.fn(),
    };
    service = new PixService(prismaMock as unknown as PrismaService);
  });

  it('should throw BadRequestException if idempotency key is missing', async () => {
    await expect(
      service.transfer('user-1', '', { pixKey: '123', amountCents: 5000 })
    ).rejects.toThrow(BadRequestException);
  });
});
