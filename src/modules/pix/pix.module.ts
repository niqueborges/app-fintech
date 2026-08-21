import { Module } from '@nestjs/common';
import { PixService } from './pix.service.js';
import { PixController } from './pix.controller.js';

@Module({
  providers: [PixService],
  controllers: [PixController],
  exports: [PixService],
})
export class PixModule {}
