import { IsString, IsOptional, IsEnum, IsArray, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDiagnosticDto {
  @ApiProperty({ description: 'Diagnostic code (e.g., ICD-10 code)' })
  @IsString()
  code!: string;

  @ApiProperty({ description: 'Diagnostic name' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Diagnostic description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Coding system used',
    enum: ['ICD-10', 'ICD-11', 'SNOMED-CT', 'LOINC', 'CUSTOM'],
    default: 'ICD-10'
  })
  @IsOptional()
  @IsEnum(['ICD-10', 'ICD-11', 'SNOMED-CT', 'LOINC', 'CUSTOM'])
  codingSystem?: string;

  @ApiPropertyOptional({ description: 'Diagnostic category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ 
    description: 'Severity level',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @ApiPropertyOptional({ description: 'Alternative names/synonyms' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  synonyms?: string[];

  @ApiPropertyOptional({ description: 'Related diagnostic codes' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedCodes?: string[];

  @ApiPropertyOptional({ description: 'Effective date' })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({ description: 'Expiry date' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
