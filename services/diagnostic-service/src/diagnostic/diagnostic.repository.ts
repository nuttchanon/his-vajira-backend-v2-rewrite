import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@his/shared';
import { Diagnostic, DiagnosticModel } from './entity/diagnostic.entity';
import { CreateDiagnosticDto } from './create-diagnostic.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';

@Injectable()
export class DiagnosticRepository extends BaseRepository<Diagnostic> {
  constructor() {
    super(DiagnosticModel);
  }

  /**
   * Find a diagnostic by code
   * @param code - The diagnostic code
   * @param codingSystem - The coding system (optional)
   * @returns Promise<Diagnostic | null> - The found diagnostic or null
   */
  async findByCode(code: string, codingSystem?: string): Promise<Diagnostic | null> {
    try {
      this.logger.debug(`Finding diagnostic by code: ${code}`);
      
      const filter: any = { code, active: true };
      if (codingSystem) {
        filter.codingSystem = codingSystem;
      }
      
      return await this.findOne(filter);
    } catch (error) {
      this.logger.error(`Error finding diagnostic by code: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find diagnostics by name (partial match)
   * @param name - The name to search for
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Diagnostic>> - Paginated results
   */
  async findByName(name: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Diagnostic>> {
    try {
      this.logger.debug(`Finding diagnostics by name: ${name}`);
      
      const filter = {
        $or: [
          { name: { $regex: name, $options: 'i' } },
          { synonyms: { $regex: name, $options: 'i' } },
        ],
      };

      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding diagnostics by name: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find diagnostics by category
   * @param category - The category to search for
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Diagnostic>> - Paginated results
   */
  async findByCategory(category: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Diagnostic>> {
    try {
      this.logger.debug(`Finding diagnostics by category: ${category}`);
      
      const filter = { category: { $regex: category, $options: 'i' } };
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding diagnostics by category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find diagnostics by coding system
   * @param codingSystem - The coding system
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Diagnostic>> - Paginated results
   */
  async findByCodingSystem(codingSystem: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Diagnostic>> {
    try {
      this.logger.debug(`Finding diagnostics by coding system: ${codingSystem}`);
      
      const filter = { codingSystem };
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding diagnostics by coding system: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new diagnostic with duplicate checking
   * @param createDiagnosticDto - The diagnostic creation data
   * @param context - The request context
   * @returns Promise<Diagnostic> - The created diagnostic
   */
  async createDiagnostic(createDiagnosticDto: CreateDiagnosticDto, context: any): Promise<Diagnostic> {
    try {
      this.logger.debug(`Creating new diagnostic with code: ${createDiagnosticDto.code}`);

      // Check for duplicate codes
      const existingDiagnostic = await this.findByCode(
        createDiagnosticDto.code,
        createDiagnosticDto.codingSystem
      );

      if (existingDiagnostic) {
        throw new Error(
          `Diagnostic with code ${createDiagnosticDto.code} already exists in coding system ${createDiagnosticDto.codingSystem}`
        );
      }

      // Prepare diagnostic data with audit information
      const diagnosticData = {
        ...createDiagnosticDto,
        isActive: true,
        createdBy: context?.user?.id || 'system',
        createdByName: context?.user?.name || 'System',
        tenantId: context?.tenantId,
        sourceSystem: 'his-v2',
      };

      return await this.create(diagnosticData);
    } catch (error) {
      this.logger.error(`Error creating diagnostic: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update a diagnostic with audit trail
   * @param id - The diagnostic ID
   * @param updateData - The update data
   * @param context - The request context
   * @returns Promise<Diagnostic | null> - The updated diagnostic or null
   */
  async updateDiagnostic(
    id: string,
    updateData: Partial<Diagnostic>,
    context: any
  ): Promise<Diagnostic | null> {
    try {
      this.logger.debug(`Updating diagnostic with ID: ${id}`);

      const updatePayload = {
        ...updateData,
        updatedBy: context?.user?.id || 'system',
        updatedByName: context?.user?.name || 'System',
        updatedAt: new Date(),
      };

      return await this.update(id, updatePayload);
    } catch (error) {
      this.logger.error(`Error updating diagnostic: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete a diagnostic with audit trail
   * @param id - The diagnostic ID
   * @param context - The request context
   * @returns Promise<boolean> - True if deleted successfully
   */
  async deleteDiagnostic(id: string, context: any): Promise<boolean> {
    try {
      this.logger.debug(`Deleting diagnostic with ID: ${id}`);
      return await this.delete(id, context);
    } catch (error) {
      this.logger.error(`Error deleting diagnostic: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get diagnostics with advanced filtering
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Diagnostic>> - Paginated results
   */
  async getDiagnostics(query: PaginationQueryDto): Promise<PaginationResponseDto<Diagnostic>> {
    try {
      this.logger.debug(`Getting diagnostics with query: ${JSON.stringify(query)}`);
      return await this.findAll(query);
    } catch (error) {
      this.logger.error(`Error getting diagnostics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get diagnostic by ID with proper error handling
   * @param id - The diagnostic ID
   * @returns Promise<Diagnostic | null> - The diagnostic or null
   */
  async getDiagnosticById(id: string): Promise<Diagnostic | null> {
    try {
      this.logger.debug(`Getting diagnostic by ID: ${id}`);
      return await this.findById(id);
    } catch (error) {
      this.logger.error(`Error getting diagnostic by ID: ${error.message}`, error.stack);
      throw error;
    }
  }
}
