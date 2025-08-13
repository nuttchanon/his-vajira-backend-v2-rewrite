import { Injectable, Logger } from '@nestjs/common';
import { Financial } from './entity/financial.entity';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';
import { FinancialRepository } from './financial.repository';

@Injectable()
export class FinancialService {
  private readonly logger = new Logger(FinancialService.name);
  public broker: any; // Will be set by the Moleculer service

  constructor(private readonly financialRepository: FinancialRepository) {}

  /**
   * Creates a new financial record with the provided information
   *
   * @param createFinancialDto - The financial creation data transfer object
   * @param context - The request context containing user information
   * @returns Promise<Financial> - The created financial entity
   *
   * @throws ValidationError - When the provided data is invalid
   * @throws DatabaseError - When there's an issue with the database operation
   */
  async createFinancial(createFinancialDto: CreateFinancialDto, context: any): Promise<Financial> {
    try {
      this.logger.log(`Creating new financial record: ${JSON.stringify(createFinancialDto)}`);

      const savedFinancial = await this.financialRepository.createFinancial(createFinancialDto, context);

      this.logger.log(`Financial record created successfully with ID: ${savedFinancial._id}`);

      // Emit event for other services
      if (this.broker) {
        this.broker.emit('financial.created', {
          financialId: savedFinancial._id,
          type: savedFinancial.type,
        });
      }

      return savedFinancial;
    } catch (error: any) {
      this.logger.error(`Error creating financial record: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves a financial record by its ID
   *
   * @param id - The financial record ID
   * @returns Promise<Financial | null> - The financial entity or null if not found
   */
  async getFinancialById(id: string): Promise<Financial | null> {
    try {
      this.logger.log(`Fetching financial record with ID: ${id}`);
      return await this.financialRepository.getFinancialById(id);
    } catch (error: any) {
      this.logger.error(`Error fetching financial record: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves financial records with pagination and filtering
   *
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Financial>> - Paginated financial results
   */
  async getFinancials(query: PaginationQueryDto): Promise<PaginationResponseDto<Financial>> {
    try {
      this.logger.log(`Fetching financial records with query: ${JSON.stringify(query)}`);
      return await this.financialRepository.getFinancials(query);
    } catch (error) {
      this.logger.error(`Error fetching financial records: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Updates a financial record by its ID
   *
   * @param id - The financial record ID
   * @param updateData - The data to update
   * @param context - The request context
   * @returns Promise<Financial | null> - The updated financial entity or null if not found
   */
  async updateFinancial(
    id: string,
    updateData: Partial<CreateFinancialDto>,
    context: any
  ): Promise<Financial | null> {
    try {
      this.logger.log(`Updating financial record with ID: ${id}`);

      const updatedFinancial = await this.financialRepository.updateFinancial(id, updateData, context);

      if (updatedFinancial) {
        this.logger.log(`Financial record updated successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('financial.updated', {
            financialId: id,
            type: updatedFinancial.type,
          });
        }
      }

      return updatedFinancial;
    } catch (error: any) {
      this.logger.error(`Error updating financial record: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft deletes a financial record by its ID
   *
   * @param id - The financial record ID
   * @param context - The request context
   * @returns Promise<boolean> - True if deleted successfully
   */
  async deleteFinancial(id: string, context: any): Promise<boolean> {
    try {
      this.logger.log(`Deleting financial record with ID: ${id}`);

      const deleted = await this.financialRepository.deleteFinancial(id, context);

      if (deleted) {
        this.logger.log(`Financial record deleted successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('financial.deleted', {
            financialId: id,
          });
        }
      }

      return deleted;
    } catch (error: any) {
      this.logger.error(`Error deleting financial record: ${error.message}`, error.stack);
      throw error;
    }
  }
}
