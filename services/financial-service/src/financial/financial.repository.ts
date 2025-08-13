import { Injectable } from '@nestjs/common';
import { getModelForClass } from '@typegoose/typegoose';
import {
  BaseRepository,
  QueryBuilderOptions,
  PaginationQueryDto,
  PaginationResponseDto,
} from '@his/shared';
import { Financial } from './entity/financial.entity';

@Injectable()
export class FinancialRepository extends BaseRepository<Financial> {
  constructor() {
    super(getModelForClass(Financial));
  }

  /**
   * Create a new financial record
   * @param createFinancialDto - Financial creation data
   * @param context - Request context
   * @returns Created financial record
   */
  async createFinancial(createFinancialDto: any, context: any): Promise<Financial> {
    const financialData = {
      ...createFinancialDto,
      createdBy: context?.user?.id,
      createdByName: context?.user?.username || context?.user?.fullName,
      tenantId: context?.tenantId,
    };

    return this.create(financialData);
  }

  /**
   * Get financial record by ID
   * @param id - Financial record ID
   * @returns Financial record or null
   */
  async getFinancialById(id: string): Promise<Financial | null> {
    return this.findById(id);
  }

  /**
   * Get financial records with pagination and filtering
   * @param query - Pagination query
   * @returns Paginated financial records
   */
  async getFinancials(query: PaginationQueryDto): Promise<PaginationResponseDto<Financial>> {
    const options: QueryBuilderOptions = {
      search: 'type', // Search by financial type
      filter: {},
      sort: { createdAt: -1 },
    };

    return this.findAll(query, options);
  }

  /**
   * Update financial record
   * @param id - Financial record ID
   * @param updateData - Update data
   * @param context - Request context
   * @returns Updated financial record or null
   */
  async updateFinancial(id: string, updateData: any, context: any): Promise<Financial | null> {
    const updatePayload = {
      ...updateData,
      updatedBy: context?.user?.id,
      updatedByName: context?.user?.username || context?.user?.fullName,
    };

    return this.update(id, updatePayload);
  }

  /**
   * Delete financial record (soft delete)
   * @param id - Financial record ID
   * @param context - Request context
   * @returns Success status
   */
  async deleteFinancial(id: string, context: any): Promise<boolean> {
    return this.delete(id, context);
  }

  /**
   * Find financial records by type
   * @param type - Financial type
   * @param query - Pagination query
   * @returns Paginated financial records
   */
  async findByType(
    type: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Financial>> {
    const options: QueryBuilderOptions = {
      filter: { type },
      sort: { createdAt: -1 },
    };

    return this.findAll(query, options);
  }

  /**
   * Find financial records by date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param query - Pagination query
   * @returns Paginated financial records
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Financial>> {
    const options: QueryBuilderOptions = {
      filter: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      sort: { createdAt: -1 },
    };

    return this.findAll(query, options);
  }

  /**
   * Find financial records by amount range
   * @param minAmount - Minimum amount
   * @param maxAmount - Maximum amount
   * @param query - Pagination query
   * @returns Paginated financial records
   */
  async findByAmountRange(
    minAmount: number,
    maxAmount: number,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Financial>> {
    const options: QueryBuilderOptions = {
      filter: {
        amount: {
          $gte: minAmount,
          $lte: maxAmount,
        },
      },
      sort: { amount: -1 },
    };

    return this.findAll(query, options);
  }
}
