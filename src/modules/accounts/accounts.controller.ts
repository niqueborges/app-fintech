import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service.js';
import { CreatePixKeyDto, StatementQueryDto } from './dto/accounts.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

@ApiTags('Accounts & Ledger')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Consulta o saldo e limites da conta do usuario logado' })
  getBalance(@CurrentUser() user: CurrentUserPayload) {
    return this.accountsService.getBalance(user.id);
  }

  @Get('statement')
  @ApiOperation({ summary: 'Extrato detalhado de partidas dobradas (Ledger Entries)' })
  getStatement(@CurrentUser() user: CurrentUserPayload, @Query() query: StatementQueryDto) {
    return this.accountsService.getStatement(user.id, query);
  }

  @Post('pix-keys')
  @ApiOperation({ summary: 'Cadastra uma nova chave PIX para a conta' })
  createPixKey(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreatePixKeyDto) {
    return this.accountsService.createPixKey(user.id, dto);
  }

  @Delete('pix-keys/:id')
  @ApiOperation({ summary: 'Exclui uma chave PIX cadastrada' })
  deletePixKey(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.accountsService.deletePixKey(user.id, id);
  }
}
