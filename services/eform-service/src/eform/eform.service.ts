import { Injectable, Logger } from '@nestjs/common';
import { Eform } from './eform.entity';
import { CreateEformDto } from './create-eform.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';
import { EformRepository } from './eform.repository';

@Injectable()
export class EformService {
  private readonly logger = new Logger(EformService.name);
  public broker: any; // Will be set by the Moleculer service

  constructor(private readonly eformRepository: EformRepository) {}

  /**
   * Creates a new eform with the provided information
   *
   * @param createEformDto - The eform creation data transfer object
   * @param context - The request context containing user information
   * @returns Promise<Eform> - The created eform entity
   *
   * @throws ValidationError - When the provided data is invalid
   * @throws DuplicateEformError - When an eform with the same code and version already exists
   * @throws DatabaseError - When there's an issue with the database operation
   *
   * @example
   * ```typescript
   * const eform = await eformService.createEform({
   *   code: 'CONSENT_FORM',
   *   name: 'Patient Consent Form',
   *   version: '1.0.0',
   *   schema: { /* JSON Schema *\/ },
   *   status: 'DRAFT'
   * }, requestContext);
   * ```
   *
   * @since 2.0.0
   * @author Development Team
   */
  async createEform(createEformDto: CreateEformDto, context: any): Promise<Eform> {
    try {
      this.logger.log(
        `Creating new eform with code: ${createEformDto.code}`
      );

      const savedEform = await this.eformRepository.createEform(createEformDto, context);

      this.logger.log(`Eform created successfully with ID: ${savedEform._id}`);

      // Emit event for other services
      if (this.broker) {
        this.broker.emit('eform.created', {
          eformId: savedEform._id,
          code: savedEform.code,
          version: savedEform.version,
        });
      }

      return savedEform;
    } catch (error: any) {
      this.logger.error(`Error creating eform: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves an eform by its ID
   *
   * @param id - The eform ID
   * @returns Promise<Eform | null> - The eform entity or null if not found
   */
  async getEformById(id: string): Promise<Eform | null> {
    try {
      this.logger.log(`Fetching eform with ID: ${id}`);
      return await this.eformRepository.getEformById(id);
    } catch (error: any) {
      this.logger.error(`Error fetching eform: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves an eform by its code
   *
   * @param code - The eform code
   * @param version - The eform version (optional)
   * @returns Promise<Eform | null> - The eform entity or null if not found
   */
  async getEformByCode(code: string, version?: string): Promise<Eform | null> {
    try {
      this.logger.log(`Fetching eform with code: ${code}`);
      return await this.eformRepository.findByCode(code, version);
    } catch (error: any) {
      this.logger.error(`Error fetching eform by code: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves eforms with pagination and filtering
   *
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Eform>> - Paginated eform results
   */
  async getEforms(query: PaginationQueryDto): Promise<PaginationResponseDto<Eform>> {
    try {
      this.logger.log(`Fetching eforms with query: ${JSON.stringify(query)}`);
      return await this.eformRepository.getEforms(query);
    } catch (error) {
      this.logger.error(`Error fetching eforms: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Searches eforms by name
   *
   * @param name - The name to search for
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Eform>> - Paginated eform results
   */
  async searchEformsByName(name: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Eform>> {
    try {
      this.logger.log(`Searching eforms by name: ${name}`);
      return await this.eformRepository.findByName(name, query);
    } catch (error) {
      this.logger.error(`Error searching eforms by name: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves eforms by status
   *
   * @param status - The status to filter by
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Eform>> - Paginated eform results
   */
  async getEformsByStatus(status: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Eform>> {
    try {
      this.logger.log(`Fetching eforms by status: ${status}`);
      return await this.eformRepository.findByStatus(status, query);
    } catch (error) {
      this.logger.error(`Error fetching eforms by status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves eforms by category
   *
   * @param category - The category to filter by
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Eform>> - Paginated eform results
   */
  async getEformsByCategory(category: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Eform>> {
    try {
      this.logger.log(`Fetching eforms by category: ${category}`);
      return await this.eformRepository.findByCategory(category, query);
    } catch (error) {
      this.logger.error(`Error fetching eforms by category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves template eforms
   *
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Eform>> - Paginated eform results
   */
  async getTemplateEforms(query: PaginationQueryDto): Promise<PaginationResponseDto<Eform>> {
    try {
      this.logger.log(`Fetching template eforms`);
      return await this.eformRepository.findTemplates(query);
    } catch (error) {
      this.logger.error(`Error fetching template eforms: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Updates an eform by its ID
   *
   * @param id - The eform ID
   * @param updateData - The data to update
   * @param context - The request context
   * @returns Promise<Eform | null> - The updated eform or null if not found
   */
  async updateEform(
    id: string,
    updateData: Partial<Eform>,
    context: any
  ): Promise<Eform | null> {
    try {
      this.logger.log(`Updating eform with ID: ${id}`);

      const updatedEform = await this.eformRepository.updateEform(id, updateData, context);

      if (updatedEform) {
        this.logger.log(`Eform updated successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('eform.updated', {
            eformId: id,
            code: updatedEform.code,
            version: updatedEform.version,
          });
        }
      }

      return updatedEform;
    } catch (error) {
      this.logger.error(`Error updating eform: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Deletes an eform by its ID (soft delete)
   *
   * @param id - The eform ID
   * @param context - The request context
   * @returns Promise<boolean> - True if deleted successfully
   */
  async deleteEform(id: string, context: any): Promise<boolean> {
    try {
      this.logger.log(`Deleting eform with ID: ${id}`);

      const deleted = await this.eformRepository.deleteEform(id, context);

      if (deleted) {
        this.logger.log(`Eform deleted successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('eform.deleted', {
            eformId: id,
          });
        }
      }

      return deleted;
    } catch (error) {
      this.logger.error(`Error deleting eform: ${error.message}`, error.stack);
      throw error;
    }
  }
}
