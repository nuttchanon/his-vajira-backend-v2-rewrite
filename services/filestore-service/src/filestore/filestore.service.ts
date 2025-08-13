import { Injectable, Logger } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';
import { FilestoreRepository } from './filestore.repository';
import { StoredFile } from './entity/filestore.entity';

@Injectable()
export class FilestoreService {
	private readonly logger = new Logger(FilestoreService.name);
	public broker: any;

	constructor(private readonly filestoreRepository: FilestoreRepository) {}

	async uploadFile(dto: CreateFileDto, context: any): Promise<StoredFile> {
		try {
			this.logger.log(`Uploading file: ${dto.fileName}`);
			const file = await this.filestoreRepository.createFile(dto, context);
			if (this.broker) this.broker.emit('file.uploaded', { fileId: file._id, fileName: file.fileName });
			return file;
		} catch (error: any) {
			this.logger.error(`Error uploading file: ${error.message}`, error.stack);
			throw error;
		}
	}

	async getFileById(id: string): Promise<StoredFile | null> {
		return this.filestoreRepository.getFileById(id);
	}

	async getFiles(query: PaginationQueryDto): Promise<PaginationResponseDto<StoredFile>> {
		return this.filestoreRepository.getFiles(query);
	}

	async deleteFile(id: string, context: any): Promise<boolean> {
		return this.filestoreRepository.deleteFile(id, context);
	}
}
