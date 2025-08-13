import { Module } from '@nestjs/common';
import { FinancialModule } from './financial/financial.module';

@Module({
  imports: [FinancialModule],
})
export class AppModule {}
