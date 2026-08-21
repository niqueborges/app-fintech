jest.mock('../../infrastructure/database/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('../../generated/prisma/client.js', () => ({
  PrismaClient: class PrismaClient {},
}));

jest.mock('otplib', () => ({
  authenticator: {
    generateSecret: jest.fn().mockReturnValue('mock-secret'),
    keyuri: jest.fn().mockReturnValue('otpauth://...'),
    verify: jest.fn().mockReturnValue(true),
  },
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock-qr-code'),
}));

import { AuthService } from './auth.service.js';
import { UnauthorizedException } from '@nestjs/common';
import type { PrismaService } from '../../infrastructure/database/prisma.service.js';
import type { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaMock: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    account: {
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let jwtMock: {
    sign: jest.Mock;
    verify: jest.Mock;
  };

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      account: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    jwtMock = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };
    authService = new AuthService(
      prismaMock as unknown as PrismaService,
      jwtMock as unknown as JwtService
    );
  });

  it('should throw UnauthorizedException on invalid login', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(authService.login({ email: 'fake@email.com', password: '123' })).rejects.toThrow(
      UnauthorizedException
    );
  });
});
