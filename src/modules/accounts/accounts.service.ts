import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { CreatePixKeyDto, StatementQueryDto } from './dto/accounts.dto.js';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const account = await this.prisma.account.findFirst({
      where: { userId, deletedAt: null },
      include: { pixKeys: true },
    });
    if (!account) throw new NotFoundException('Conta bancaria nao encontrada');

    return {
      accountId: account.id,
      accountNumber: account.accountNumber,
      branch: account.branch,
      balanceCents: Number(account.balance),
      balanceBrl: (Number(account.balance) / 100).toFixed(2),
      dailyPixLimitCents: Number(account.dailyPixLimit),
      dailyPixLimitBrl: (Number(account.dailyPixLimit) / 100).toFixed(2),
      status: account.status,
      pixKeys: account.pixKeys,
    };
  }

  async getStatement(userId: string, query: StatementQueryDto) {
    const account = await this.prisma.account.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!account) throw new NotFoundException('Conta bancaria nao encontrada');

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where: { accountId: account.id },
        include: { transaction: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.ledgerEntry.count({ where: { accountId: account.id } }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      entries: entries.map((e) => ({
        id: e.id,
        entryType: e.entryType,
        amountCents: Number(e.amount),
        amountBrl: (Number(e.amount) / 100).toFixed(2),
        balanceAfterCents: Number(e.balanceAfter),
        balanceAfterBrl: (Number(e.balanceAfter) / 100).toFixed(2),
        transaction: {
          id: e.transaction.id,
          type: e.transaction.type,
          status: e.transaction.status,
          description: e.transaction.description,
          createdAt: e.transaction.createdAt,
        },
        createdAt: e.createdAt,
      })),
    };
  }

  async createPixKey(userId: string, dto: CreatePixKeyDto) {
    const account = await this.prisma.account.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!account) throw new NotFoundException('Conta bancaria nao encontrada');

    const existingKey = await this.prisma.pixKey.findUnique({
      where: { keyValue: dto.keyValue },
    });
    if (existingKey) {
      throw new ConflictException('Chave PIX ja cadastrada no sistema nacional');
    }

    return this.prisma.pixKey.create({
      data: {
        accountId: account.id,
        keyType: dto.keyType,
        keyValue: dto.keyValue,
      },
    });
  }

  async deletePixKey(userId: string, keyId: string) {
    const key = await this.prisma.pixKey.findUnique({
      where: { id: keyId },
      include: { account: true },
    });
    if (!key || key.account.userId !== userId) {
      throw new NotFoundException('Chave PIX nao encontrada');
    }

    await this.prisma.pixKey.delete({ where: { id: keyId } });
    return { success: true, message: 'Chave PIX excluida com sucesso' };
  }
}
