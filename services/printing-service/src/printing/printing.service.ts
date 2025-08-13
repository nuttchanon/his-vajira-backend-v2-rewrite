import { Injectable, Logger } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';
import { PrintingRepository } from './printing.repository';
import { Report } from './entity/report.entity';

@Injectable()
export class PrintingService {
	private readonly logger = new Logger(PrintingService.name);
	public broker: any;

	constructor(private readonly printingRepository: PrintingRepository) {}

	async generateReport(dto: CreateReportDto, context: any): Promise<Report> {
		try {
			this.logger.log(`Generating report: ${dto.template}`);
			const report = await this.printingRepository.createReport(dto, context);
			if (this.broker) this.broker.emit('report.created', { reportId: report._id });
			return report;
		} catch (error: any) {
			this.logger.error(`Error generating report: ${error.message}`, error.stack);
			throw error;
		}
	}

	async getReportById(id: string): Promise<Report | null> {
		return this.printingRepository.getReportById(id);
	}

	async getReports(query: PaginationQueryDto): Promise<PaginationResponseDto<Report>> {
		return this.printingRepository.getReports(query);
	}

	async updateReport(id: string, updateData: Partial<CreateReportDto>, context: any): Promise<Report | null> {
		return this.printingRepository.updateReport(id, updateData, context);
	}

	async deleteReport(id: string, context: any): Promise<boolean> {
		return this.printingRepository.deleteReport(id, context);
	}
}
