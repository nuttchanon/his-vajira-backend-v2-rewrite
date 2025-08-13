import { IsString, IsOptional, IsEnum, IsArray, IsDateString, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEformDto {
  @ApiProperty({ description: 'Eform code' })
  @IsString()
  code!: string;

  @ApiProperty({ description: 'Eform name' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Eform description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Eform version' })
  @IsString()
  version!: string;

  @ApiPropertyOptional({ 
    description: 'Eform status',
    enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'],
    default: 'DRAFT'
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'])
  status?: string;

  @ApiProperty({ description: 'JSON Schema for the form' })
  @IsObject()
  schema!: Record<string, any>;

  @ApiPropertyOptional({ description: 'UI Schema for the form' })
  @IsOptional()
  @IsObject()
  uiSchema?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Form category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Department responsible' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Required roles to access' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredRoles?: string[];

  @ApiPropertyOptional({ description: 'Allowed roles to access' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];

  @ApiPropertyOptional({ description: 'Whether this is a template' })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @ApiPropertyOptional({ description: 'Template ID if based on template' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Validation rules' })
  @IsOptional()
  @IsObject()
  validationRules?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Effective date' })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({ description: 'Expiry date' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
