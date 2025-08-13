import { Module } from '@nestjs/common';
import { PrintingModule } from './printing/printing.module';

@Module({
	imports: [PrintingModule],
})
export class AppModule {}
