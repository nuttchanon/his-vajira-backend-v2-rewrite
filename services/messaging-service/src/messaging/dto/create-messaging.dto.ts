import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessagingDto {
  @ApiProperty({
    description: 'Unique message ID',
    example: 'MSG-2024-001',
  })
  @IsString()
  messageId!: string;

  @ApiProperty({
    description: 'Sender ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  senderId!: string;

  @ApiProperty({
    description: 'Sender name',
    example: 'Dr. Smith',
  })
  @IsString()
  senderName!: string;

  @ApiProperty({
    description: 'Recipient ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  recipientId!: string;

  @ApiProperty({
    description: 'Recipient name',
    example: 'John Doe',
  })
  @IsString()
  recipientName!: string;

  @ApiProperty({
    description: 'Message subject',
    example: 'Appointment Reminder',
  })
  @IsString()
  subject!: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Your appointment is scheduled for tomorrow at 2:00 PM.',
  })
  @IsString()
  content!: string;

  @ApiProperty({
    description: 'Type of message',
    enum: ['email', 'sms', 'notification', 'internal'],
    example: 'email',
  })
  @IsEnum(['email', 'sms', 'notification', 'internal'])
  messageType!: string;

  @ApiProperty({
    description: 'Status of the message',
    enum: ['draft', 'sent', 'delivered', 'read', 'failed'],
    example: 'draft',
  })
  @IsEnum(['draft', 'sent', 'delivered', 'read', 'failed'])
  status!: string;

  @ApiPropertyOptional({
    description: 'Priority level of the message',
    enum: ['low', 'normal', 'high', 'urgent'],
    example: 'normal',
  })
  @IsOptional()
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  priority?: string;

  @ApiPropertyOptional({
    description: 'File attachments',
    example: ['attachment1.pdf', 'attachment2.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
