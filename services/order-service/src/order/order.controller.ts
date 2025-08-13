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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationQueryDto } from '@his/shared';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Create a new order
   * @param createOrderDto - The order creation data
   * @param req - The request object containing user context
   * @returns Promise<Order> - The created order
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };

    return await this.orderService.createOrder(createOrderDto, context);
  }

  /**
   * Get an order by ID
   * @param id - The order ID
   * @returns Promise<Order | null> - The order or null
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOrderById(@Param('id') id: string) {
    return await this.orderService.getOrderById(id);
  }

  /**
   * Get all orders with pagination and filtering
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Order>> - Paginated results
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getOrders(@Query() query: PaginationQueryDto) {
    return await this.orderService.getOrders(query);
  }

  /**
   * Update an order
   * @param id - The order ID
   * @param updateData - The update data
   * @param req - The request object containing user context
   * @returns Promise<Order | null> - The updated order or null
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateOrder(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateOrderDto>,
    @Request() req: any
  ) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };

    return await this.orderService.updateOrder(id, updateData, context);
  }

  /**
   * Delete an order (soft delete)
   * @param id - The order ID
   * @param req - The request object containing user context
   * @returns Promise<boolean> - True if deleted successfully
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrder(@Param('id') id: string, @Request() req: any) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };

    return await this.orderService.deleteOrder(id, context);
  }
}
