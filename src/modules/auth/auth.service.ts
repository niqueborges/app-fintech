import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { RegisterDto, LoginDto, VerifyMfaDto } from './dto/auth.dto.js';
import bcrypt from 'bcrypt';
import * as otplib from 'otplib';
import QRCode from 'qrcode';

interface OtplibAuthenticator {
  generateSecret(): string;
  keyuri(user: string, service: string, secret: string): string;
  verify(options: { token: string; secret: string }): boolean;
}

const authenticator = (otplib as unknown as { authenticator: OtplibAuthenticator }).authenticator;

interface UserTokenPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  accounts?: unknown;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('E-mail ja cadastrado no sistema');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          cpf: dto.cpf,
          password: passwordHash,
        },
      });

      const accountNumber = Math.floor(100000 + Math.random() * 900000).toString();
      await tx.account.create({
        data: {
          userId: user.id,
          accountNumber,
          branch: '0001',
          balance: 0n,
          dailyPixLimit: 500000n,
        },
      });

      return this.generateTokens(user);
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { accounts: true },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    if (user.mfaEnabled) {
      return {
        mfaRequired: true,
        email: user.email,
      };
    }

    return this.generateTokens(user);
  }

  async setupMfa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario nao encontrado');

    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(user.email, 'FintechMaria', secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });

    return { secret, qrCodeDataUrl };
  }

  async verifyMfa(dto: VerifyMfaDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { accounts: true },
    });
    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('Configuracao MFA inexistente');
    }

    const isValid = authenticator.verify({
      token: dto.token,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Codigo MFA invalido');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: true },
    });

    return this.generateTokens(user);
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret:
          process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-prod-super-key-987654',
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { accounts: true },
      });
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Refresh token invalido');
      }

      const isMatch = await bcrypt.compare(token, user.refreshTokenHash);
      if (!isMatch) {
        throw new UnauthorizedException('Refresh token invalido');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Refresh token expirado ou invalido');
    }
  }

  private async generateTokens(user: UserTokenPayload) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-prod-super-secure-key-123456',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret:
        process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-prod-super-key-987654',
      expiresIn: '7d',
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accounts: user.accounts,
      },
    };
  }
}
