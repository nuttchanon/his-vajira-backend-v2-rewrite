import { IsString, IsNumber, IsEnum, IsOptional, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFileDto {
	@ApiProperty({ description: 'Stored file name', example: 'a1b2c3.pdf' })
	@IsString()
	fileName!: string;

	@ApiProperty({ description: 'Original file name', example: 'invoice.pdf' })
	@IsString()
	originalName!: string;

	@ApiProperty({ description: 'File size in bytes', example: 123456 })
	@IsNumber()
	@Min(0)
	fileSize!: number;

	@ApiProperty({ description: 'MIME type', example: 'application/pdf' })
	@IsString()
	mimeType!: string;

	@ApiProperty({ description: 'File path', example: '/uploads/2024/08/a1b2c3.pdf' })
	@IsString()
	filePath!: string;

	@ApiProperty({ description: 'File type', enum: ['document', 'image', 'video', 'audio', 'other'], example: 'document' })
	@IsEnum(['document', 'image', 'video', 'audio', 'other'])
	fileType!: string;

	@ApiPropertyOptional({ description: 'Additional metadata' })
	@IsOptional()
	@IsObject()
	metadata?: Record<string, any>;
}
