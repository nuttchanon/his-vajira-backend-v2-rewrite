import { Injectable, Logger } from '@nestjs/common';
import { Inventory } from './entity/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';
import { InventoryRepository } from './inventory.repository';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  public broker: any; // Will be set by the Moleculer service

  constructor(private readonly inventoryRepository: InventoryRepository) {}

  /**
   * Creates a new inventory item with the provided information
   *
   * @param createInventoryDto - The inventory creation data transfer object
   * @param context - The request context containing user information
   * @returns Promise<Inventory> - The created inventory entity
   *
   * @throws ValidationError - When the provided data is invalid
   * @throws DatabaseError - When there's an issue with the database operation
   */
  async createInventory(createInventoryDto: CreateInventoryDto, context: any): Promise<Inventory> {
    try {
      this.logger.log(`Creating new inventory item: ${JSON.stringify(createInventoryDto)}`);

      const savedInventory = await this.inventoryRepository.createInventory(createInventoryDto, context);

      this.logger.log(`Inventory item created successfully with ID: ${savedInventory._id}`);

      // Emit event for other services
      if (this.broker) {
        this.broker.emit('inventory.created', {
          inventoryId: savedInventory._id,
          itemCode: savedInventory.itemCode,
        });
      }

      return savedInventory;
    } catch (error: any) {
      this.logger.error(`Error creating inventory item: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves an inventory item by its ID
   *
   * @param id - The inventory item ID
   * @returns Promise<Inventory | null> - The inventory entity or null if not found
   */
  async getInventoryById(id: string): Promise<Inventory | null> {
    try {
      this.logger.log(`Fetching inventory item with ID: ${id}`);
      return await this.inventoryRepository.getInventoryById(id);
    } catch (error: any) {
      this.logger.error(`Error fetching inventory item: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves inventory items with pagination and filtering
   *
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Inventory>> - Paginated inventory results
   */
  async getInventories(query: PaginationQueryDto): Promise<PaginationResponseDto<Inventory>> {
    try {
      this.logger.log(`Fetching inventory items with query: ${JSON.stringify(query)}`);
      return await this.inventoryRepository.getInventories(query);
    } catch (error) {
      this.logger.error(`Error fetching inventory items: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Updates an inventory item by its ID
   *
   * @param id - The inventory item ID
   * @param updateData - The data to update
   * @param context - The request context
   * @returns Promise<Inventory | null> - The updated inventory entity or null if not found
   */
  async updateInventory(
    id: string,
    updateData: Partial<CreateInventoryDto>,
    context: any
  ): Promise<Inventory | null> {
    try {
      this.logger.log(`Updating inventory item with ID: ${id}`);

      const updatedInventory = await this.inventoryRepository.updateInventory(id, updateData, context);

      if (updatedInventory) {
        this.logger.log(`Inventory item updated successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('inventory.updated', {
            inventoryId: id,
            itemCode: updatedInventory.itemCode,
          });
        }
      }

      return updatedInventory;
    } catch (error: any) {
      this.logger.error(`Error updating inventory item: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft deletes an inventory item by its ID
   *
   * @param id - The inventory item ID
   * @param context - The request context
   * @returns Promise<boolean> - True if deleted successfully
   */
  async deleteInventory(id: string, context: any): Promise<boolean> {
    try {
      this.logger.log(`Deleting inventory item with ID: ${id}`);

      const deleted = await this.inventoryRepository.deleteInventory(id, context);

      if (deleted) {
        this.logger.log(`Inventory item deleted successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('inventory.deleted', {
            inventoryId: id,
          });
        }
      }

      return deleted;
    } catch (error: any) {
      this.logger.error(`Error deleting inventory item: ${error.message}`, error.stack);
      throw error;
    }
  }
}
