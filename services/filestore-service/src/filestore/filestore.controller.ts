import { Controller, Get, Post, Delete, Body, Param, Query, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { FilestoreService } from './filestore.service';
import { CreateFileDto } from './dto/create-file.dto';
import { PaginationQueryDto } from '@his/shared';

@Controller('files')
export class FilestoreController {
	constructor(private readonly filestoreService: FilestoreService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async uploadFile(@Body() dto: CreateFileDto, @Request() req: any) {
		const context = { user: req.user, tenantId: req.headers['x-tenant-id'] };
		return this.filestoreService.uploadFile(dto, context);
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	async getFileById(@Param('id') id: string) {
		return this.filestoreService.getFileById(id);
	}

	@Get()
	@HttpCode(HttpStatus.OK)
	async getFiles(@Query() query: PaginationQueryDto) {
		return this.filestoreService.getFiles(query);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteFile(@Param('id') id: string, @Request() req: any) {
		const context = { user: req.user, tenantId: req.headers['x-tenant-id'] };
		return this.filestoreService.deleteFile(id, context);
	}
}
