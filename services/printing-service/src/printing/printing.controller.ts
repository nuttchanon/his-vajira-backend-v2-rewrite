import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { PrintingService } from './printing.service';
import { CreateReportDto } from './dto/create-report.dto';
import { PaginationQueryDto } from '@his/shared';

@Controller('reports')
export class PrintingController {
	constructor(private readonly printingService: PrintingService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async generateReport(@Body() dto: CreateReportDto, @Request() req: any) {
		const context = { user: req.user, tenantId: req.headers['x-tenant-id'] };
		return this.printingService.generateReport(dto, context);
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	async getReportById(@Param('id') id: string) {
		return this.printingService.getReportById(id);
	}

	@Get()
	@HttpCode(HttpStatus.OK)
	async getReports(@Query() query: PaginationQueryDto) {
		return this.printingService.getReports(query);
	}

	@Put(':id')
	@HttpCode(HttpStatus.OK)
	async updateReport(
		@Param('id') id: string,
		@Body() updateData: Partial<CreateReportDto>,
		@Request() req: any,
	) {
		const context = { user: req.user, tenantId: req.headers['x-tenant-id'] };
		return this.printingService.updateReport(id, updateData, context);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteReport(@Param('id') id: string, @Request() req: any) {
		const context = { user: req.user, tenantId: req.headers['x-tenant-id'] };
		return this.printingService.deleteReport(id, context);
	}
}
