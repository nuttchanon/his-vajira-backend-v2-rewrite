import { Module } from '@nestjs/common';
import { FilestoreController } from './filestore.controller';
import { FilestoreService } from './filestore.service';
import { FilestoreRepository } from './filestore.repository';

@Module({
	controllers: [FilestoreController],
	providers: [FilestoreService, FilestoreRepository],
	exports: [FilestoreService, FilestoreRepository],
})
export class FilestoreModule {}
