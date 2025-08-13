import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@his/shared';
import { Eform, EformModel } from './eform.entity';
import { CreateEformDto } from './create-eform.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';

@Injectable()
export class EformRepository extends BaseRepository<Eform> {
  constructor() {
    super(EformModel);
  }

  /**
   * Find an eform by code
   * @param code - The eform code
   * @param version - The eform version (optional)
   * @returns Promise<Eform | null> - The found eform or null
   */
  async findByCode(code: string, version?: string): Promise<Eform | null> {
    try {
      this.logger.debug(`Finding eform by code: ${code}`);
      
      const filter: any = { code, active: true };
      if (version) {
        filter.version = version;
      }
      
      return await this.findOne(filter);
    } catch (error) {
      this.logger.error(`Error finding eform by code: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find eforms by name (partial match)
   * @param name - The name to search for
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Eform>> - Paginated results
   */
  async findByName(name: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Eform>> {
    try {
      this.logger.debug(`Finding eforms by name: ${name}`);
      
      const filter = {
        name: { $regex: name, $options: 'i' },
      };

      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding eforms by name: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find eforms by status
   * @param status - The status to filter by
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Eform>> - Paginated results
   */
  async findByStatus(status: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Eform>> {
    try {
      this.logger.debug(`Finding eforms by status: ${status}`);
      
      const filter = { status };
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding eforms by status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find eforms by category
   * @param category - The category to filter by
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Eform>> - Paginated results
   */
  async findByCategory(category: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Eform>> {
    try {
      this.logger.debug(`Finding eforms by category: ${category}`);
      
      const filter = { category: { $regex: category, $options: 'i' } };
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding eforms by category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find template eforms
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Eform>> - Paginated results
   */
  async findTemplates(query: PaginationQueryDto): Promise<PaginationResponseDto<Eform>> {
    try {
      this.logger.debug(`Finding template eforms`);
      
      const filter = { isTemplate: true };
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding template eforms: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new eform with duplicate checking
   * @param createEformDto - The eform creation data
   * @param context - The request context
   * @returns Promise<Eform> - The created eform
   */
  async createEform(createEformDto: CreateEformDto, context: any): Promise<Eform> {
    try {
      this.logger.debug(`Creating new eform with code: ${createEformDto.code}`);

      // Check for duplicate codes
      const existingEform = await this.findByCode(
        createEformDto.code,
        createEformDto.version
      );

      if (existingEform) {
        throw new Error(
          `Eform with code ${createEformDto.code} and version ${createEformDto.version} already exists`
        );
      }

      // Prepare eform data with audit information
      const eformData = {
        ...createEformDto,
        createdBy: context?.user?.id || 'system',
        createdByName: context?.user?.name || 'System',
        tenantId: context?.tenantId,
        sourceSystem: 'his-v2',
      };

      return await this.create(eformData);
    } catch (error) {
      this.logger.error(`Error creating eform: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update an eform with audit trail
   * @param id - The eform ID
   * @param updateData - The update data
   * @param context - The request context
   * @returns Promise<Eform | null> - The updated eform or null
   */
  async updateEform(
    id: string,
    updateData: Partial<Eform>,
    context: any
  ): Promise<Eform | null> {
    try {
      this.logger.debug(`Updating eform with ID: ${id}`);

      const updatePayload = {
        ...updateData,
        updatedBy: context?.user?.id || 'system',
        updatedByName: context?.user?.name || 'System',
        updatedAt: new Date(),
      };

      return await this.update(id, updatePayload);
    } catch (error) {
      this.logger.error(`Error updating eform: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete an eform with audit trail
   * @param id - The eform ID
   * @param context - The request context
   * @returns Promise<boolean> - True if deleted successfully
   */
  async deleteEform(id: string, context: any): Promise<boolean> {
    try {
      this.logger.debug(`Deleting eform with ID: ${id}`);
      return await this.delete(id, context);
    } catch (error) {
      this.logger.error(`Error deleting eform: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get eforms with advanced filtering
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Eform>> - Paginated results
   */
  async getEforms(query: PaginationQueryDto): Promise<PaginationResponseDto<Eform>> {
    try {
      this.logger.debug(`Getting eforms with query: ${JSON.stringify(query)}`);
      return await this.findAll(query);
    } catch (error) {
      this.logger.error(`Error getting eforms: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get eform by ID with proper error handling
   * @param id - The eform ID
   * @returns Promise<Eform | null> - The eform or null
   */
  async getEformById(id: string): Promise<Eform | null> {
    try {
      this.logger.debug(`Getting eform by ID: ${id}`);
      return await this.findById(id);
    } catch (error) {
      this.logger.error(`Error getting eform by ID: ${error.message}`, error.stack);
      throw error;
    }
  }
}
