import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, IsArray, Min, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFinancialDto {
  @ApiProperty({
    description: 'Type of financial record',
    example: 'consultation_fee',
  })
  @IsString()
  type!: string;

  @ApiProperty({
    description: 'Amount of the transaction',
    example: 1500.00,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({
    description: 'Currency of the transaction',
    example: 'THB',
  })
  @IsString()
  currency!: string;

  @ApiProperty({
    description: 'Description of the financial transaction',
    example: 'Consultation fee for Dr. Smith',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: 'Category of the financial transaction',
    example: 'medical_services',
  })
  @IsString()
  category!: string;

  @ApiPropertyOptional({
    description: 'Reference number for the transaction',
    example: 'REF-2024-001',
  })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({
    description: 'Patient ID associated with the transaction',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({
    description: 'Encounter ID associated with the transaction',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsString()
  encounterId?: string;

  @ApiProperty({
    description: 'Type of transaction',
    enum: ['income', 'expense', 'transfer'],
    example: 'income',
  })
  @IsEnum(['income', 'expense', 'transfer'])
  transactionType!: string;

  @ApiProperty({
    description: 'Status of the transaction',
    enum: ['pending', 'completed', 'cancelled', 'refunded'],
    example: 'completed',
  })
  @IsEnum(['pending', 'completed', 'cancelled', 'refunded'])
  status!: string;

  @ApiPropertyOptional({
    description: 'Date of the transaction',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @ApiPropertyOptional({
    description: 'Payment method used',
    example: 'credit_card',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the transaction',
    example: 'Payment received for consultation services',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Tags for categorizing the transaction',
    example: ['consultation', 'outpatient'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata for the transaction',
    example: { insuranceProvider: 'Blue Cross', claimNumber: 'BC-12345' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
