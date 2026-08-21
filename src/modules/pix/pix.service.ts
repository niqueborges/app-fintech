import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { PixTransferDto, ValidatePixKeyDto } from './dto/pix.dto.js';
import { TransactionType, TransactionStatus, EntryType } from '../../generated/prisma/client.js';

@Injectable()
export class PixService {
  constructor(private prisma: PrismaService) {}

  async validateKey(dto: ValidatePixKeyDto) {
    const key = await this.prisma.pixKey.findUnique({
      where: { keyValue: dto.pixKey },
      include: { account: { include: { user: true } } },
    });

    if (!key) throw new NotFoundException('Chave PIX nao encontrada no DICT');

    return {
      pixKey: key.keyValue,
      keyType: key.keyType,
      recipientName: key.account.user.name,
      maskedCpf: key.account.user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**'),
      accountNumber: key.account.accountNumber,
      branch: key.account.branch,
    };
  }

  async transfer(userId: string, idempotencyKey: string, dto: PixTransferDto) {
    if (!idempotencyKey) {
      throw new BadRequestException('Cabecalho Idempotency-Key obrigatorio');
    }

    // 1. Checagem de Idempotencia estrita
    const existingTx = await this.prisma.transaction.findUnique({
      where: { idempotencyKey },
    });
    if (existingTx) {
      return {
        idempotent: true,
        message: 'Transacao recuperada por chave de idempotencia',
        transaction: {
          id: existingTx.id,
          status: existingTx.status,
          amountCents: Number(existingTx.amount),
          amountBrl: (Number(existingTx.amount) / 100).toFixed(2),
          createdAt: existingTx.createdAt,
        },
      };
    }

    // 2. Localizar contas de origem e destino
    const sourceAccount = await this.prisma.account.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!sourceAccount) throw new NotFoundException('Conta de origem nao encontrada');

    const destKey = await this.prisma.pixKey.findUnique({
      where: { keyValue: dto.pixKey },
      include: { account: true },
    });
    if (!destKey) throw new NotFoundException('Chave PIX de destino inexistente');

    if (sourceAccount.id === destKey.accountId) {
      throw new BadRequestException('Transferencia para a mesma conta nao permitida');
    }

    const amountBig = BigInt(dto.amountCents);

    if (sourceAccount.balance < amountBig) {
      throw new BadRequestException('Saldo insuficiente para a transferencia');
    }

    if (amountBig > sourceAccount.dailyPixLimit) {
      throw new BadRequestException('Valor excede o limite diario de PIX disponivel');
    }

    // 3. Execucao Atomica no Livro-Razao com Partidas Dobradas ($transaction)
    const result = await this.prisma.$transaction(async (tx) => {
      // Debita origem
      const updatedSource = await tx.account.update({
        where: { id: sourceAccount.id },
        data: { balance: { decrement: amountBig } },
      });

      // Credita destino
      const updatedDest = await tx.account.update({
        where: { id: destKey.accountId },
        data: { balance: { increment: amountBig } },
      });

      // Registra a Transacao
      const transaction = await tx.transaction.create({
        data: {
          idempotencyKey,
          sourceAccountId: sourceAccount.id,
          destinationAccountId: destKey.accountId,
          amount: amountBig,
          type: TransactionType.PIX_TRANSFER,
          status: TransactionStatus.COMPLETED,
          description: dto.description || 'Transferencia PIX instantanea',
          pixKeyUsed: dto.pixKey,
        },
      });

      // Livro-Razao: Partida 1 - Debito
      await tx.ledgerEntry.create({
        data: {
          transactionId: transaction.id,
          accountId: sourceAccount.id,
          entryType: EntryType.DEBIT,
          amount: amountBig,
          balanceAfter: updatedSource.balance,
        },
      });

      // Livro-Razao: Partida 2 - Credito
      await tx.ledgerEntry.create({
        data: {
          transactionId: transaction.id,
          accountId: destKey.accountId,
          entryType: EntryType.CREDIT,
          amount: amountBig,
          balanceAfter: updatedDest.balance,
        },
      });

      return transaction;
    });

    return {
      success: true,
      message: 'PIX realizado com sucesso',
      transaction: {
        id: result.id,
        status: result.status,
        amountCents: Number(result.amount),
        amountBrl: (Number(result.amount) / 100).toFixed(2),
        pixKeyUsed: result.pixKeyUsed,
        createdAt: result.createdAt,
      },
    };
  }
}
