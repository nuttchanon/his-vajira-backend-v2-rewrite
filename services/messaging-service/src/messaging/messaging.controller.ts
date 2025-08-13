import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { CreateMessagingDto } from './dto/create-messaging.dto';
import { PaginationQueryDto } from '@his/shared';

@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  /**
   * Create a new message
   * @param createMessagingDto - The message creation data
   * @param req - The request object containing user context
   * @returns Promise<Messaging> - The created message
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMessaging(@Body() createMessagingDto: CreateMessagingDto, @Request() req: any) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };

    return await this.messagingService.createMessaging(createMessagingDto, context);
  }

  /**
   * Get a message by ID
   * @param id - The message ID
   * @returns Promise<Messaging | null> - The message or null
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getMessagingById(@Param('id') id: string) {
    return await this.messagingService.getMessagingById(id);
  }

  /**
   * Get all messages with pagination and filtering
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Messaging>> - Paginated results
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMessagings(@Query() query: PaginationQueryDto) {
    return await this.messagingService.getMessagings(query);
  }

  /**
   * Update a message
   * @param id - The message ID
   * @param updateData - The update data
   * @param req - The request object containing user context
   * @returns Promise<Messaging | null> - The updated message or null
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateMessaging(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateMessagingDto>,
    @Request() req: any
  ) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };

    return await this.messagingService.updateMessaging(id, updateData, context);
  }

  /**
   * Delete a message (soft delete)
   * @param id - The message ID
   * @param req - The request object containing user context
   * @returns Promise<boolean> - True if deleted successfully
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessaging(@Param('id') id: string, @Request() req: any) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };

    return await this.messagingService.deleteMessaging(id, context);
  }
}
