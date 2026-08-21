import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PixService } from './pix.service.js';
import { PixTransferDto, ValidatePixKeyDto } from './dto/pix.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator.js';

@ApiTags('PIX Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pix')
export class PixController {
  constructor(private pixService: PixService) {}

  @Post('validate-key')
  @ApiOperation({ summary: 'Valida destinatario de chave PIX no DICT' })
  validateKey(@Body() dto: ValidatePixKeyDto) {
    return this.pixService.validateKey(dto);
  }

  @Post('transfer')
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Chave UUID de idempotencia estrita',
    required: true,
  })
  @ApiOperation({ summary: 'Executa transferencia PIX com garantia de idempotencia e livro-razao' })
  transfer(
    @CurrentUser() user: CurrentUserPayload,
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() dto: PixTransferDto
  ) {
    return this.pixService.transfer(user.id, idempotencyKey, dto);
  }
}
