import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PixTransferDto {
  @ApiProperty({ example: '12345678901' })
  @IsString()
  @IsNotEmpty()
  pixKey!: string;

  @ApiProperty({ example: 10000, description: 'Valor em centavos (R$ 100,00)' })
  @IsInt()
  @Min(1)
  amountCents!: number;

  @ApiProperty({ example: 'Pagamento servico', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ValidatePixKeyDto {
  @ApiProperty({ example: 'carla@email.com' })
  @IsString()
  @IsNotEmpty()
  pixKey!: string;
}
