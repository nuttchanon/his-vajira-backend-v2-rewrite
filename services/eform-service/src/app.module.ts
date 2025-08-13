import { Module } from '@nestjs/common';
import { EformModule } from './eform/eform.module';

@Module({
  imports: [EformModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
