import { Module } from '@nestjs/common';
import { DiagnosticController } from './diagnostic.controller';
import { DiagnosticService } from './diagnostic.service';
import { DiagnosticRepository } from './diagnostic.repository';

@Module({
  controllers: [DiagnosticController],
  providers: [DiagnosticService, DiagnosticRepository],
  exports: [DiagnosticService, DiagnosticRepository],
})
export class DiagnosticModule {}
