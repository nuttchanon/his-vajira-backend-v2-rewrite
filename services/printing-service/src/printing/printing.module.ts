import { Module } from '@nestjs/common';
import { PrintingController } from './printing.controller';
import { PrintingService } from './printing.service';
import { PrintingRepository } from './printing.repository';

@Module({
	controllers: [PrintingController],
	providers: [PrintingService, PrintingRepository],
	exports: [PrintingService, PrintingRepository],
})
export class PrintingModule {}
