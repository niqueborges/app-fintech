import { IsEnum, IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PixKeyType } from '../../../generated/prisma/client.js';
import { Type } from 'class-transformer';

export class CreatePixKeyDto {
  @ApiProperty({ enum: PixKeyType, example: PixKeyType.CPF })
  @IsEnum(PixKeyType)
  keyType!: PixKeyType;

  @ApiProperty({ example: '12345678901' })
  @IsString()
  @IsNotEmpty()
  keyValue!: string;
}

export class StatementQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
