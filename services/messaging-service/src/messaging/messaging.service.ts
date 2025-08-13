import { Injectable, Logger } from '@nestjs/common';
import { Messaging } from './entity/messaging.entity';
import { CreateMessagingDto } from './dto/create-messaging.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';
import { MessagingRepository } from './messaging.repository';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);
  public broker: any; // Will be set by the Moleculer service

  constructor(private readonly messagingRepository: MessagingRepository) {}

  /**
   * Creates a new message with the provided information
   *
   * @param createMessagingDto - The message creation data transfer object
   * @param context - The request context containing user information
   * @returns Promise<Messaging> - The created message entity
   *
   * @throws ValidationError - When the provided data is invalid
   * @throws DatabaseError - When there's an issue with the database operation
   */
  async createMessaging(createMessagingDto: CreateMessagingDto, context: any): Promise<Messaging> {
    try {
      this.logger.log(`Creating new message: ${JSON.stringify(createMessagingDto)}`);

      const savedMessaging = await this.messagingRepository.createMessaging(createMessagingDto, context);

      this.logger.log(`Message created successfully with ID: ${savedMessaging._id}`);

      // Emit event for other services
      if (this.broker) {
        this.broker.emit('messaging.created', {
          messagingId: savedMessaging._id,
          messageId: savedMessaging.messageId,
        });
      }

      return savedMessaging;
    } catch (error: any) {
      this.logger.error(`Error creating message: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves a message by its ID
   *
   * @param id - The message ID
   * @returns Promise<Messaging | null> - The message entity or null if not found
   */
  async getMessagingById(id: string): Promise<Messaging | null> {
    try {
      this.logger.log(`Fetching message with ID: ${id}`);
      return await this.messagingRepository.getMessagingById(id);
    } catch (error: any) {
      this.logger.error(`Error fetching message: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves messages with pagination and filtering
   *
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Messaging>> - Paginated message results
   */
  async getMessagings(query: PaginationQueryDto): Promise<PaginationResponseDto<Messaging>> {
    try {
      this.logger.log(`Fetching messages with query: ${JSON.stringify(query)}`);
      return await this.messagingRepository.getMessagings(query);
    } catch (error) {
      this.logger.error(`Error fetching messages: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Updates a message by its ID
   *
   * @param id - The message ID
   * @param updateData - The data to update
   * @param context - The request context
   * @returns Promise<Messaging | null> - The updated message entity or null if not found
   */
  async updateMessaging(
    id: string,
    updateData: Partial<CreateMessagingDto>,
    context: any
  ): Promise<Messaging | null> {
    try {
      this.logger.log(`Updating message with ID: ${id}`);

      const updatedMessaging = await this.messagingRepository.updateMessaging(id, updateData, context);

      if (updatedMessaging) {
        this.logger.log(`Message updated successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('messaging.updated', {
            messagingId: id,
            messageId: updatedMessaging.messageId,
          });
        }
      }

      return updatedMessaging;
    } catch (error: any) {
      this.logger.error(`Error updating message: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft deletes a message by its ID
   *
   * @param id - The message ID
   * @param context - The request context
   * @returns Promise<boolean> - True if deleted successfully
   */
  async deleteMessaging(id: string, context: any): Promise<boolean> {
    try {
      this.logger.log(`Deleting message with ID: ${id}`);

      const deleted = await this.messagingRepository.deleteMessaging(id, context);

      if (deleted) {
        this.logger.log(`Message deleted successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('messaging.deleted', {
            messagingId: id,
          });
        }
      }

      return deleted;
    } catch (error: any) {
      this.logger.error(`Error deleting message: ${error.message}`, error.stack);
      throw error;
    }
  }
}
