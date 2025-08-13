import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
	@ApiProperty({ description: 'Report display name', example: 'Discharge Summary' })
	@IsString()
	name!: string;

	@ApiProperty({ description: 'Template identifier', example: 'discharge_summary_v1' })
	@IsString()
	template!: string;

	@ApiPropertyOptional({ description: 'Report parameters', example: { encounterId: '...' } })
	@IsOptional()
	@IsObject()
	parameters?: Record<string, any>;
}
