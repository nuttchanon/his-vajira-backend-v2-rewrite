import { Injectable, Logger } from '@nestjs/common';
import { Diagnostic } from './diagnostic.entity';
import { CreateDiagnosticDto } from './create-diagnostic.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';
import { DiagnosticRepository } from './diagnostic.repository';

@Injectable()
export class DiagnosticService {
  private readonly logger = new Logger(DiagnosticService.name);
  public broker: any; // Will be set by the Moleculer service

  constructor(private readonly diagnosticRepository: DiagnosticRepository) {}

  /**
   * Creates a new diagnostic with the provided information
   *
   * @param createDiagnosticDto - The diagnostic creation data transfer object
   * @param context - The request context containing user information
   * @returns Promise<Diagnostic> - The created diagnostic entity
   *
   * @throws ValidationError - When the provided data is invalid
   * @throws DuplicateDiagnosticError - When a diagnostic with the same code already exists
   * @throws DatabaseError - When there's an issue with the database operation
   *
   * @example
   * ```typescript
   * const diagnostic = await diagnosticService.createDiagnostic({
   *   code: 'E11.9',
   *   name: 'Type 2 diabetes mellitus without complications',
   *   codingSystem: 'ICD-10',
   *   category: 'Endocrine diseases',
   *   severity: 'MEDIUM'
   * }, requestContext);
   * ```
   *
   * @since 2.0.0
   * @author Development Team
   */
  async createDiagnostic(createDiagnosticDto: CreateDiagnosticDto, context: any): Promise<Diagnostic> {
    try {
      this.logger.log(
        `Creating new diagnostic with code: ${createDiagnosticDto.code}`
      );

      const savedDiagnostic = await this.diagnosticRepository.createDiagnostic(createDiagnosticDto, context);

      this.logger.log(`Diagnostic created successfully with ID: ${savedDiagnostic._id}`);

      // Emit event for other services
      if (this.broker) {
        this.broker.emit('diagnostic.created', {
          diagnosticId: savedDiagnostic._id,
          code: savedDiagnostic.code,
          codingSystem: savedDiagnostic.codingSystem,
        });
      }

      return savedDiagnostic;
    } catch (error: any) {
      this.logger.error(`Error creating diagnostic: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves a diagnostic by its ID
   *
   * @param id - The diagnostic ID
   * @returns Promise<Diagnostic | null> - The diagnostic entity or null if not found
   */
  async getDiagnosticById(id: string): Promise<Diagnostic | null> {
    try {
      this.logger.log(`Fetching diagnostic with ID: ${id}`);
      return await this.diagnosticRepository.getDiagnosticById(id);
    } catch (error: any) {
      this.logger.error(`Error fetching diagnostic: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves a diagnostic by its code
   *
   * @param code - The diagnostic code
   * @param codingSystem - The coding system (optional)
   * @returns Promise<Diagnostic | null> - The diagnostic entity or null if not found
   */
  async getDiagnosticByCode(code: string, codingSystem?: string): Promise<Diagnostic | null> {
    try {
      this.logger.log(`Fetching diagnostic with code: ${code}`);
      return await this.diagnosticRepository.findByCode(code, codingSystem);
    } catch (error: any) {
      this.logger.error(`Error fetching diagnostic by code: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves diagnostics with pagination and filtering
   *
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Diagnostic>> - Paginated diagnostic results
   */
  async getDiagnostics(query: PaginationQueryDto): Promise<PaginationResponseDto<Diagnostic>> {
    try {
      this.logger.log(`Fetching diagnostics with query: ${JSON.stringify(query)}`);
      return await this.diagnosticRepository.getDiagnostics(query);
    } catch (error) {
      this.logger.error(`Error fetching diagnostics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Searches diagnostics by name
   *
   * @param name - The name to search for
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Diagnostic>> - Paginated diagnostic results
   */
  async searchDiagnosticsByName(name: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Diagnostic>> {
    try {
      this.logger.log(`Searching diagnostics by name: ${name}`);
      return await this.diagnosticRepository.findByName(name, query);
    } catch (error) {
      this.logger.error(`Error searching diagnostics by name: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves diagnostics by category
   *
   * @param category - The category to search for
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Diagnostic>> - Paginated diagnostic results
   */
  async getDiagnosticsByCategory(category: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Diagnostic>> {
    try {
      this.logger.log(`Fetching diagnostics by category: ${category}`);
      return await this.diagnosticRepository.findByCategory(category, query);
    } catch (error) {
      this.logger.error(`Error fetching diagnostics by category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves diagnostics by coding system
   *
   * @param codingSystem - The coding system
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Diagnostic>> - Paginated diagnostic results
   */
  async getDiagnosticsByCodingSystem(codingSystem: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Diagnostic>> {
    try {
      this.logger.log(`Fetching diagnostics by coding system: ${codingSystem}`);
      return await this.diagnosticRepository.findByCodingSystem(codingSystem, query);
    } catch (error) {
      this.logger.error(`Error fetching diagnostics by coding system: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Updates a diagnostic by its ID
   *
   * @param id - The diagnostic ID
   * @param updateData - The data to update
   * @param context - The request context
   * @returns Promise<Diagnostic | null> - The updated diagnostic or null if not found
   */
  async updateDiagnostic(
    id: string,
    updateData: Partial<Diagnostic>,
    context: any
  ): Promise<Diagnostic | null> {
    try {
      this.logger.log(`Updating diagnostic with ID: ${id}`);

      const updatedDiagnostic = await this.diagnosticRepository.updateDiagnostic(id, updateData, context);

      if (updatedDiagnostic) {
        this.logger.log(`Diagnostic updated successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('diagnostic.updated', {
            diagnosticId: id,
            code: updatedDiagnostic.code,
            codingSystem: updatedDiagnostic.codingSystem,
          });
        }
      }

      return updatedDiagnostic;
    } catch (error) {
      this.logger.error(`Error updating diagnostic: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Deletes a diagnostic by its ID (soft delete)
   *
   * @param id - The diagnostic ID
   * @param context - The request context
   * @returns Promise<boolean> - True if deleted successfully
   */
  async deleteDiagnostic(id: string, context: any): Promise<boolean> {
    try {
      this.logger.log(`Deleting diagnostic with ID: ${id}`);

      const deleted = await this.diagnosticRepository.deleteDiagnostic(id, context);

      if (deleted) {
        this.logger.log(`Diagnostic deleted successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('diagnostic.deleted', {
            diagnosticId: id,
          });
        }
      }

      return deleted;
    } catch (error) {
      this.logger.error(`Error deleting diagnostic: ${error.message}`, error.stack);
      throw error;
    }
  }
}
