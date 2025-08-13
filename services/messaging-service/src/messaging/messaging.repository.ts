import { Injectable } from '@nestjs/common';
import { getModelForClass } from '@typegoose/typegoose';
import {
  BaseRepository,
  QueryBuilderOptions,
  PaginationQueryDto,
  PaginationResponseDto,
} from '@his/shared';
import { Messaging } from './entity/messaging.entity';

@Injectable()
export class MessagingRepository extends BaseRepository<Messaging> {
  constructor() {
    super(getModelForClass(Messaging));
  }

  /**
   * Create a new message
   * @param createMessagingDto - Message creation data
   * @param context - Request context
   * @returns Created message
   */
  async createMessaging(createMessagingDto: any, context: any): Promise<Messaging> {
    const messagingData = {
      ...createMessagingDto,
      createdBy: context?.user?.id,
      createdByName: context?.user?.username || context?.user?.fullName,
      tenantId: context?.tenantId,
    };

    return this.create(messagingData);
  }

  /**
   * Get message by ID
   * @param id - Message ID
   * @returns Message or null
   */
  async getMessagingById(id: string): Promise<Messaging | null> {
    return this.findById(id);
  }

  /**
   * Get messages with pagination and filtering
   * @param query - Pagination query
   * @returns Paginated messages
   */
  async getMessagings(query: PaginationQueryDto): Promise<PaginationResponseDto<Messaging>> {
    const options: QueryBuilderOptions = {
      search: 'subject', // Search by subject
      filter: {},
      sort: { createdAt: -1 },
    };

    return this.findAll(query, options);
  }

  /**
   * Update message
   * @param id - Message ID
   * @param updateData - Update data
   * @param context - Request context
   * @returns Updated message or null
   */
  async updateMessaging(id: string, updateData: any, context: any): Promise<Messaging | null> {
    const updatePayload = {
      ...updateData,
      updatedBy: context?.user?.id,
      updatedByName: context?.user?.username || context?.user?.fullName,
    };

    return this.update(id, updatePayload);
  }

  /**
   * Delete message (soft delete)
   * @param id - Message ID
   * @param context - Request context
   * @returns Success status
   */
  async deleteMessaging(id: string, context: any): Promise<boolean> {
    return this.delete(id, context);
  }

  /**
   * Find messages by sender ID
   * @param senderId - Sender ID
   * @param query - Pagination query
   * @returns Paginated messages
   */
  async findBySenderId(
    senderId: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Messaging>> {
    const options: QueryBuilderOptions = {
      filter: { senderId },
      sort: { createdAt: -1 },
    };

    return this.findAll(query, options);
  }

  /**
   * Find messages by recipient ID
   * @param recipientId - Recipient ID
   * @param query - Pagination query
   * @returns Paginated messages
   */
  async findByRecipientId(
    recipientId: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Messaging>> {
    const options: QueryBuilderOptions = {
      filter: { recipientId },
      sort: { createdAt: -1 },
    };

    return this.findAll(query, options);
  }

  /**
   * Find messages by status
   * @param status - Message status
   * @param query - Pagination query
   * @returns Paginated messages
   */
  async findByStatus(
    status: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Messaging>> {
    const options: QueryBuilderOptions = {
      filter: { status },
      sort: { createdAt: -1 },
    };

    return this.findAll(query, options);
  }

  /**
   * Find messages by type
   * @param messageType - Message type
   * @param query - Pagination query
   * @returns Paginated messages
   */
  async findByType(
    messageType: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Messaging>> {
    const options: QueryBuilderOptions = {
      filter: { messageType },
      sort: { createdAt: -1 },
    };

    return this.findAll(query, options);
  }
}
