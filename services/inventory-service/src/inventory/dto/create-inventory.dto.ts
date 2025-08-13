import { IsString, IsNumber, IsEnum, IsOptional, IsArray, Min, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty({
    description: 'Unique item code for the inventory item',
    example: 'MED-001',
  })
  @IsString()
  itemCode!: string;

  @ApiProperty({
    description: 'Name of the inventory item',
    example: 'Paracetamol 500mg',
  })
  @IsString()
  itemName!: string;

  @ApiProperty({
    description: 'Category of the inventory item',
    example: 'medications',
  })
  @IsString()
  category!: string;

  @ApiProperty({
    description: 'Current stock quantity',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  stockQuantity!: number;

  @ApiProperty({
    description: 'Unit price of the item',
    example: 2.50,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'tablets',
  })
  @IsString()
  unit!: string;

  @ApiPropertyOptional({
    description: 'Description of the inventory item',
    example: 'Pain relief medication',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Supplier ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiPropertyOptional({
    description: 'Supplier name',
    example: 'ABC Pharmaceuticals',
  })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiPropertyOptional({
    description: 'Reorder level threshold',
    example: 20,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderLevel?: number;

  @ApiPropertyOptional({
    description: 'Maximum stock level',
    example: 500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStockLevel?: number;

  @ApiProperty({
    description: 'Status of the inventory item',
    enum: ['active', 'inactive', 'discontinued'],
    example: 'active',
  })
  @IsEnum(['active', 'inactive', 'discontinued'])
  status!: string;

  @ApiPropertyOptional({
    description: 'Storage location',
    example: 'Warehouse A, Shelf 3',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Barcode for the item',
    example: '1234567890123',
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Tags for categorizing the item',
    example: ['pain_relief', 'otc'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Technical specifications of the item',
    example: { strength: '500mg', form: 'tablet', packaging: 'blister pack' },
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Additional metadata for the item',
    example: { expiryDate: '2025-12-31', batchNumber: 'BATCH-001' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
