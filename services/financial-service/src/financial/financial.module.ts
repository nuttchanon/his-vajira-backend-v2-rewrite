import { Module } from '@nestjs/common';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { FinancialRepository } from './financial.repository';

@Module({
  controllers: [FinancialController],
  providers: [FinancialService, FinancialRepository],
  exports: [FinancialService, FinancialRepository],
})
export class FinancialModule {}
