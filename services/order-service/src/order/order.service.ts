import { Injectable, Logger } from '@nestjs/common';
import { Order } from './entity/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';
import { OrderRepository } from './order.repository';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  public broker: any; // Will be set by the Moleculer service

  constructor(private readonly orderRepository: OrderRepository) {}

  /**
   * Creates a new order with the provided information
   *
   * @param createOrderDto - The order creation data transfer object
   * @param context - The request context containing user information
   * @returns Promise<Order> - The created order entity
   *
   * @throws ValidationError - When the provided data is invalid
   * @throws DatabaseError - When there's an issue with the database operation
   */
  async createOrder(createOrderDto: CreateOrderDto, context: any): Promise<Order> {
    try {
      this.logger.log(`Creating new order: ${JSON.stringify(createOrderDto)}`);

      const savedOrder = await this.orderRepository.createOrder(createOrderDto, context);

      this.logger.log(`Order created successfully with ID: ${savedOrder._id}`);

      // Emit event for other services
      if (this.broker) {
        this.broker.emit('order.created', {
          orderId: savedOrder._id,
          orderNumber: savedOrder.orderNumber,
        });
      }

      return savedOrder;
    } catch (error: any) {
      this.logger.error(`Error creating order: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves an order by its ID
   *
   * @param id - The order ID
   * @returns Promise<Order | null> - The order entity or null if not found
   */
  async getOrderById(id: string): Promise<Order | null> {
    try {
      this.logger.log(`Fetching order with ID: ${id}`);
      return await this.orderRepository.getOrderById(id);
    } catch (error: any) {
      this.logger.error(`Error fetching order: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves orders with pagination and filtering
   *
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Order>> - Paginated order results
   */
  async getOrders(query: PaginationQueryDto): Promise<PaginationResponseDto<Order>> {
    try {
      this.logger.log(`Fetching orders with query: ${JSON.stringify(query)}`);
      return await this.orderRepository.getOrders(query);
    } catch (error) {
      this.logger.error(`Error fetching orders: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Updates an order by its ID
   *
   * @param id - The order ID
   * @param updateData - The data to update
   * @param context - The request context
   * @returns Promise<Order | null> - The updated order entity or null if not found
   */
  async updateOrder(
    id: string,
    updateData: Partial<CreateOrderDto>,
    context: any
  ): Promise<Order | null> {
    try {
      this.logger.log(`Updating order with ID: ${id}`);

      const updatedOrder = await this.orderRepository.updateOrder(id, updateData, context);

      if (updatedOrder) {
        this.logger.log(`Order updated successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('order.updated', {
            orderId: id,
            orderNumber: updatedOrder.orderNumber,
          });
        }
      }

      return updatedOrder;
    } catch (error: any) {
      this.logger.error(`Error updating order: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft deletes an order by its ID
   *
   * @param id - The order ID
   * @param context - The request context
   * @returns Promise<boolean> - True if deleted successfully
   */
  async deleteOrder(id: string, context: any): Promise<boolean> {
    try {
      this.logger.log(`Deleting order with ID: ${id}`);

      const deleted = await this.orderRepository.deleteOrder(id, context);

      if (deleted) {
        this.logger.log(`Order deleted successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('order.deleted', {
            orderId: id,
          });
        }
      }

      return deleted;
    } catch (error: any) {
      this.logger.error(`Error deleting order: ${error.message}`, error.stack);
      throw error;
    }
  }
}
