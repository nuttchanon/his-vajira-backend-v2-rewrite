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
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { PaginationQueryDto } from '@his/shared';

@Controller('inventories')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Create a new inventory item
   * @param createInventoryDto - The inventory creation data
   * @param req - The request object containing user context
   * @returns Promise<Inventory> - The created inventory item
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createInventory(@Body() createInventoryDto: CreateInventoryDto, @Request() req: any) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };

    return await this.inventoryService.createInventory(createInventoryDto, context);
  }

  /**
   * Get an inventory item by ID
   * @param id - The inventory item ID
   * @returns Promise<Inventory | null> - The inventory item or null
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getInventoryById(@Param('id') id: string) {
    return await this.inventoryService.getInventoryById(id);
  }

  /**
   * Get all inventory items with pagination and filtering
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Inventory>> - Paginated results
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getInventories(@Query() query: PaginationQueryDto) {
    return await this.inventoryService.getInventories(query);
  }

  /**
   * Update an inventory item
   * @param id - The inventory item ID
   * @param updateData - The update data
   * @param req - The request object containing user context
   * @returns Promise<Inventory | null> - The updated inventory item or null
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateInventory(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateInventoryDto>,
    @Request() req: any
  ) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };

    return await this.inventoryService.updateInventory(id, updateData, context);
  }

  /**
   * Delete an inventory item (soft delete)
   * @param id - The inventory item ID
   * @param req - The request object containing user context
   * @returns Promise<boolean> - True if deleted successfully
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInventory(@Param('id') id: string, @Request() req: any) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };

    return await this.inventoryService.deleteInventory(id, context);
  }
}
