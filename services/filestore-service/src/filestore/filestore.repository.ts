import { Injectable } from '@nestjs/common';
import { getModelForClass } from '@typegoose/typegoose';
import { BaseRepository, PaginationQueryDto, PaginationResponseDto, QueryBuilderOptions } from '@his/shared';
import { StoredFile } from './entity/filestore.entity';

@Injectable()
export class FilestoreRepository extends BaseRepository<StoredFile> {
	constructor() {
		super(getModelForClass(StoredFile));
	}

	async createFile(dto: any, context: any): Promise<StoredFile> {
		const payload = {
			...dto,
			createdBy: context?.user?.id,
			createdByName: context?.user?.username || context?.user?.fullName,
			tenantId: context?.tenantId,
		};
		return this.create(payload);
	}

	async getFileById(id: string): Promise<StoredFile | null> {
		return this.findById(id);
	}

	async getFiles(query: PaginationQueryDto): Promise<PaginationResponseDto<StoredFile>> {
		const options: QueryBuilderOptions = {
			search: 'fileName',
			sort: { createdAt: -1 },
		};
		return this.findAll(query, options);
	}

	async deleteFile(id: string, context: any): Promise<boolean> {
		return this.delete(id, context);
	}
}
