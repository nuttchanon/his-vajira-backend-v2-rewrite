import { Injectable } from '@nestjs/common';
import { getModelForClass } from '@typegoose/typegoose';
import {
  BaseRepository,
  QueryBuilderOptions,
  PaginationQueryDto,
  PaginationResponseDto,
} from '@his/shared';
import { Inventory } from './entity/inventory.entity';

@Injectable()
export class InventoryRepository extends BaseRepository<Inventory> {
  constructor() {
    super(getModelForClass(Inventory));
  }

  /**
   * Create a new inventory item
   * @param createInventoryDto - Inventory creation data
   * @param context - Request context
   * @returns Created inventory item
   */
  async createInventory(createInventoryDto: any, context: any): Promise<Inventory> {
    const inventoryData = {
      ...createInventoryDto,
      createdBy: context?.user?.id,
      createdByName: context?.user?.username || context?.user?.fullName,
      tenantId: context?.tenantId,
    };

    return this.create(inventoryData);
  }

  /**
   * Get inventory item by ID
   * @param id - Inventory item ID
   * @returns Inventory item or null
   */
  async getInventoryById(id: string): Promise<Inventory | null> {
    return this.findById(id);
  }

  /**
   * Get inventory items with pagination and filtering
   * @param query - Pagination query
   * @returns Paginated inventory items
   */
  async getInventories(query: PaginationQueryDto): Promise<PaginationResponseDto<Inventory>> {
    const options: QueryBuilderOptions = {
      search: 'itemName', // Search by item name
      filter: {},
      sort: { createdAt: -1 },
    };

    return this.findAll(query, options);
  }

  /**
   * Update inventory item
   * @param id - Inventory item ID
   * @param updateData - Update data
   * @param context - Request context
   * @returns Updated inventory item or null
   */
  async updateInventory(id: string, updateData: any, context: any): Promise<Inventory | null> {
    const updatePayload = {
      ...updateData,
      updatedBy: context?.user?.id,
      updatedByName: context?.user?.username || context?.user?.fullName,
    };

    return this.update(id, updatePayload);
  }

  /**
   * Delete inventory item (soft delete)
   * @param id - Inventory item ID
   * @param context - Request context
   * @returns Success status
   */
  async deleteInventory(id: string, context: any): Promise<boolean> {
    return this.delete(id, context);
  }

  /**
   * Find inventory items by category
   * @param category - Item category
   * @param query - Pagination query
   * @returns Paginated inventory items
   */
  async findByCategory(
    category: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Inventory>> {
    const options: QueryBuilderOptions = {
      filter: { category },
      sort: { itemName: 1 },
    };

    return this.findAll(query, options);
  }

  /**
   * Find inventory items by stock level (low stock)
   * @param threshold - Stock threshold
   * @param query - Pagination query
   * @returns Paginated inventory items
   */
  async findLowStock(
    threshold: number,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Inventory>> {
    const options: QueryBuilderOptions = {
      filter: { stockQuantity: { $lte: threshold } },
      sort: { stockQuantity: 1 },
    };

    return this.findAll(query, options);
  }

  /**
   * Find inventory items by supplier
   * @param supplierId - Supplier ID
   * @param query - Pagination query
   * @returns Paginated inventory items
   */
  async findBySupplier(
    supplierId: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Inventory>> {
    const options: QueryBuilderOptions = {
      filter: { supplierId },
      sort: { itemName: 1 },
    };

    return this.findAll(query, options);
  }

  /**
   * Update stock quantity
   * @param id - Inventory item ID
   * @param quantity - Quantity to add/subtract
   * @param context - Request context
   * @returns Updated inventory item or null
   */
  async updateStockQuantity(id: string, quantity: number, context: any): Promise<Inventory | null> {
    const inventory = await this.findById(id);
    if (!inventory) {
      return null;
    }

    const newQuantity = inventory.stockQuantity + quantity;
    if (newQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    return this.update(id, {
      stockQuantity: newQuantity,
      updatedBy: context?.user?.id,
      updatedByName: context?.user?.username || context?.user?.fullName,
    });
  }
}
