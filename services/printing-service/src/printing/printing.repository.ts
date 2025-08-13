import { Injectable } from '@nestjs/common';
import { getModelForClass } from '@typegoose/typegoose';
import { BaseRepository, PaginationQueryDto, PaginationResponseDto, QueryBuilderOptions } from '@his/shared';
import { Report } from './entity/report.entity';

@Injectable()
export class PrintingRepository extends BaseRepository<Report> {
	constructor() {
		super(getModelForClass(Report));
	}

	async createReport(dto: any, context: any): Promise<Report> {
		const payload = {
			...dto,
			createdBy: context?.user?.id,
			createdByName: context?.user?.username || context?.user?.fullName,
			tenantId: context?.tenantId,
		};
		return this.create(payload);
	}

	async getReportById(id: string): Promise<Report | null> {
		return this.findById(id);
	}

	async getReports(query: PaginationQueryDto): Promise<PaginationResponseDto<Report>> {
		const options: QueryBuilderOptions = {
			search: 'name',
			sort: { createdAt: -1 },
		};
		return this.findAll(query, options);
	}

	async updateReport(id: string, updateData: any, context: any): Promise<Report | null> {
		const payload = {
			...updateData,
			updatedBy: context?.user?.id,
			updatedByName: context?.user?.username || context?.user?.fullName,
		};
		return this.update(id, payload);
	}

	async deleteReport(id: string, context: any): Promise<boolean> {
		return this.delete(id, context);
	}
}
