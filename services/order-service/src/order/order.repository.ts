import { Injectable } from '@nestjs/common';
import { getModelForClass } from '@typegoose/typegoose';
import {
  BaseRepository,
  QueryBuilderOptions,
  PaginationQueryDto,
  PaginationResponseDto,
} from '@his/shared';
import { Order } from './entity/order.entity';

@Injectable()
export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super(getModelForClass(Order));
  }

  /**
   * Create a new order
   * @param createOrderDto - Order creation data
   * @param context - Request context
   * @returns Created order
   */
  async createOrder(createOrderDto: any, context: any): Promise<Order> {
    const orderData = {
      ...createOrderDto,
      createdBy: context?.user?.id,
      createdByName: context?.user?.username || context?.user?.fullName,
      tenantId: context?.tenantId,
    };

    return this.create(orderData);
  }

  /**
   * Get order by ID
   * @param id - Order ID
   * @returns Order or null
   */
  async getOrderById(id: string): Promise<Order | null> {
    return this.findById(id);
  }

  /**
   * Get orders with pagination and filtering
   * @param query - Pagination query
   * @returns Paginated orders
   */
  async getOrders(query: PaginationQueryDto): Promise<PaginationResponseDto<Order>> {
    const options: QueryBuilderOptions = {
      search: 'orderNumber', // Search by order number
      filter: {},
      sort: { createdAt: -1 },
    };

    return this.findAll(query, options);
  }

  /**
   * Update order
   * @param id - Order ID
   * @param updateData - Update data
   * @param context - Request context
   * @returns Updated order or null
   */
  async updateOrder(id: string, updateData: any, context: any): Promise<Order | null> {
    const updatePayload = {
      ...updateData,
      updatedBy: context?.user?.id,
      updatedByName: context?.user?.username || context?.user?.fullName,
    };

    return this.update(id, updatePayload);
  }

  /**
   * Delete order (soft delete)
   * @param id - Order ID
   * @param context - Request context
   * @returns Success status
   */
  async deleteOrder(id: string, context: any): Promise<boolean> {
    return this.delete(id, context);
  }

  /**
   * Find orders by patient ID
   * @param patientId - Patient ID
   * @param query - Pagination query
   * @returns Paginated orders
   */
  async findByPatientId(
    patientId: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Order>> {
    const options: QueryBuilderOptions = {
      filter: { patientId },
      sort: { createdAt: -1 },
    };

    return this.findAll(query, options);
  }

  /**
   * Find orders by status
   * @param status - Order status
   * @param query - Pagination query
   * @returns Paginated orders
   */
  async findByStatus(
    status: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Order>> {
    const options: QueryBuilderOptions = {
      filter: { status },
      sort: { createdAt: -1 },
    };

    return this.findAll(query, options);
  }

  /**
   * Find orders by date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param query - Pagination query
   * @returns Paginated orders
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Order>> {
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
}
