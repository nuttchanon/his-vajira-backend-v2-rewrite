import { Module } from '@nestjs/common';
import { FilestoreModule } from './filestore/filestore.module';

@Module({
	imports: [FilestoreModule],
})
export class AppModule {}
