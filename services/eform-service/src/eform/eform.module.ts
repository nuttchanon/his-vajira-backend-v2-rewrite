import { Module } from '@nestjs/common';
import { EformController } from './eform.controller';
import { EformService } from './eform.service';
import { EformRepository } from './eform.repository';

@Module({
  controllers: [EformController],
  providers: [EformService, EformRepository],
  exports: [EformService, EformRepository],
})
export class EformModule {}
