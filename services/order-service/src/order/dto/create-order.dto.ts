import { IsString, IsEnum, IsOptional, IsArray, IsDateString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({
    description: 'Item ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  itemId!: string;

  @ApiProperty({
    description: 'Item name',
    example: 'Blood Test',
  })
  @IsString()
  itemName!: string;

  @ApiProperty({
    description: 'Quantity',
    example: 1,
  })
  quantity!: number;

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'test',
  })
  @IsString()
  unit!: string;

  @ApiPropertyOptional({
    description: 'Special instructions for this item',
    example: 'Fasting required for 12 hours',
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Patient ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  patientId!: string;

  @ApiProperty({
    description: 'Patient name',
    example: 'John Doe',
  })
  @IsString()
  patientName!: string;

  @ApiProperty({
    description: 'Type of order',
    example: 'laboratory',
  })
  @IsString()
  orderType!: string;

  @ApiProperty({
    description: 'Status of the order',
    enum: ['pending', 'approved', 'in_progress', 'completed', 'cancelled'],
    example: 'pending',
  })
  @IsEnum(['pending', 'approved', 'in_progress', 'completed', 'cancelled'])
  status!: string;

  @ApiProperty({
    description: 'Date when the order was placed',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDateString()
  orderDate!: string;

  @ApiPropertyOptional({
    description: 'Scheduled date for the order',
    example: '2024-01-16T14:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiProperty({
    description: 'ID of the person who ordered',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  orderedBy!: string;

  @ApiPropertyOptional({
    description: 'Name of the person who ordered',
    example: 'Dr. Smith',
  })
  @IsOptional()
  @IsString()
  orderedByName?: string;

  @ApiPropertyOptional({
    description: 'Department where the order was placed',
    example: 'Emergency Department',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Priority level of the order',
    example: 'high',
  })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({
    description: 'Items in the order',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems!: OrderItemDto[];

  @ApiPropertyOptional({
    description: 'Clinical notes for the order',
    example: 'Patient has diabetes, monitor blood sugar levels',
  })
  @IsOptional()
  @IsString()
  clinicalNotes?: string;

  @ApiPropertyOptional({
    description: 'Special instructions for the order',
    example: 'Urgent processing required',
  })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiPropertyOptional({
    description: 'File attachments related to the order',
    example: ['attachment1.pdf', 'attachment2.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata for the order',
    example: { insuranceProvider: 'Blue Cross', claimNumber: 'BC-12345' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
