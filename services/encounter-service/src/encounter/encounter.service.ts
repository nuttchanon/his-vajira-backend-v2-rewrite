import { Injectable, Logger } from '@nestjs/common';
import { Encounter, EncounterStatus, EncounterClass, EncounterPriority } from './encounter.entity';
import { EncounterRepository } from './encounter.repository';
import { CreateEncounterDto, UpdateEncounterDto, EncounterQueryDto } from './encounter.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';

@Injectable()
export class EncounterService {
  private readonly logger = new Logger(EncounterService.name);
  public broker: any; // Will be set by the Moleculer service

  constructor(private readonly encounterRepository: EncounterRepository) {}

  /**
   * Create a new encounter
   * @param createEncounterDto - Encounter creation data
   * @param context - Request context
   * @returns Promise<Encounter> - The created encounter
   */
  async createEncounter(createEncounterDto: CreateEncounterDto, context: any): Promise<Encounter> {
    try {
      this.logger.log(`Creating new encounter for patient: ${createEncounterDto.patientId}`);

      const encounter = await this.encounterRepository.createEncounter(createEncounterDto, context);

      this.logger.log(`Encounter created successfully with ID: ${encounter._id}`);

      // Emit event for other services
      if (this.broker) {
        this.broker.emit('encounter.created', {
          encounterId: encounter._id,
          patientId: encounter.patientId,
          status: encounter.status,
          encounterClass: encounter.encounterClass,
        });
      }

      return encounter;
    } catch (error) {
      this.logger.error(`Error creating encounter: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get encounter by ID
   * @param id - Encounter ID
   * @returns Promise<Encounter | null> - The encounter or null
   */
  async getEncounterById(id: string): Promise<Encounter | null> {
    try {
      this.logger.log(`Fetching encounter with ID: ${id}`);
      return await this.encounterRepository.getEncounterById(id);
    } catch (error) {
      this.logger.error(`Error fetching encounter: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get encounters with pagination and filtering
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async getEncounters(query: PaginationQueryDto): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.log(`Fetching encounters with query: ${JSON.stringify(query)}`);
      return await this.encounterRepository.getEncounters(query);
    } catch (error) {
      this.logger.error(`Error fetching encounters: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update an encounter
   * @param id - Encounter ID
   * @param updateData - Update data
   * @param context - Request context
   * @returns Promise<Encounter | null> - The updated encounter or null
   */
  async updateEncounter(id: string, updateData: UpdateEncounterDto, context: any): Promise<Encounter | null> {
    try {
      this.logger.log(`Updating encounter with ID: ${id}`);

      const encounter = await this.encounterRepository.updateEncounter(id, updateData, context);

      if (encounter) {
        this.logger.log(`Encounter updated successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('encounter.updated', {
            encounterId: id,
            patientId: encounter.patientId,
            status: encounter.status,
            encounterClass: encounter.encounterClass,
          });
        }
      }

      return encounter;
    } catch (error) {
      this.logger.error(`Error updating encounter: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete an encounter (soft delete)
   * @param id - Encounter ID
   * @param context - Request context
   * @returns Promise<boolean> - Success status
   */
  async deleteEncounter(id: string, context: any): Promise<boolean> {
    try {
      this.logger.log(`Deleting encounter with ID: ${id}`);

      const deleted = await this.encounterRepository.deleteEncounter(id, context);

      if (deleted) {
        this.logger.log(`Encounter deleted successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('encounter.deleted', {
            encounterId: id,
          });
        }
      }

      return deleted;
    } catch (error) {
      this.logger.error(`Error deleting encounter: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find encounters by patient ID
   * @param patientId - Patient ID
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async getEncountersByPatientId(patientId: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.log(`Fetching encounters for patient: ${patientId}`);
      return await this.encounterRepository.findByPatientId(patientId, query);
    } catch (error) {
      this.logger.error(`Error fetching encounters by patient ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find encounters by status
   * @param status - Encounter status
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async getEncountersByStatus(status: EncounterStatus, query: PaginationQueryDto): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.log(`Fetching encounters by status: ${status}`);
      return await this.encounterRepository.findByStatus(status, query);
    } catch (error) {
      this.logger.error(`Error fetching encounters by status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find encounters by class
   * @param encounterClass - Encounter class
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async getEncountersByClass(encounterClass: EncounterClass, query: PaginationQueryDto): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.log(`Fetching encounters by class: ${encounterClass}`);
      return await this.encounterRepository.findByClass(encounterClass, query);
    } catch (error) {
      this.logger.error(`Error fetching encounters by class: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find encounters by priority
   * @param priority - Encounter priority
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async getEncountersByPriority(priority: EncounterPriority, query: PaginationQueryDto): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.log(`Fetching encounters by priority: ${priority}`);
      return await this.encounterRepository.findByPriority(priority, query);
    } catch (error) {
      this.logger.error(`Error fetching encounters by priority: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find encounters by date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async getEncountersByDateRange(startDate: Date, endDate: Date, query: PaginationQueryDto): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.log(`Fetching encounters by date range: ${startDate} to ${endDate}`);
      return await this.encounterRepository.findByDateRange(startDate, endDate, query);
    } catch (error) {
      this.logger.error(`Error fetching encounters by date range: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find active encounters
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async getActiveEncounters(query: PaginationQueryDto): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.log('Fetching active encounters');
      return await this.encounterRepository.findActiveEncounters(query);
    } catch (error) {
      this.logger.error(`Error fetching active encounters: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find encounters by service provider
   * @param serviceProvider - Service provider
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async getEncountersByServiceProvider(serviceProvider: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.log(`Fetching encounters by service provider: ${serviceProvider}`);
      return await this.encounterRepository.findByServiceProvider(serviceProvider, query);
    } catch (error) {
      this.logger.error(`Error fetching encounters by service provider: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Search encounters by reason text
   * @param reasonText - Reason text to search for
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async searchEncountersByReasonText(reasonText: string, query: PaginationQueryDto): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.log(`Searching encounters by reason text: ${reasonText}`);
      return await this.encounterRepository.searchByReasonText(reasonText, query);
    } catch (error) {
      this.logger.error(`Error searching encounters by reason text: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find encounters with advanced filtering
   * @param encounterQuery - Advanced query parameters
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async getEncountersWithFilter(encounterQuery: EncounterQueryDto, query: PaginationQueryDto): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.log(`Fetching encounters with filter: ${JSON.stringify(encounterQuery)}`);
      return await this.encounterRepository.findEncountersWithFilter(encounterQuery, query);
    } catch (error) {
      this.logger.error(`Error fetching encounters with filter: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get encounter statistics
   * @returns Promise<object> - Encounter statistics
   */
  async getEncounterStatistics(): Promise<object> {
    try {
      this.logger.log('Fetching encounter statistics');
      return await this.encounterRepository.getEncounterStatistics();
    } catch (error) {
      this.logger.error(`Error fetching encounter statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Change encounter status
   * @param id - Encounter ID
   * @param status - New status
   * @param context - Request context
   * @returns Promise<Encounter | null> - The updated encounter or null
   */
  async changeEncounterStatus(id: string, status: EncounterStatus, context: any): Promise<Encounter | null> {
    try {
      this.logger.log(`Changing encounter status to ${status} for encounter ID: ${id}`);

      const encounter = await this.encounterRepository.updateEncounter(id, { status }, context);

      if (encounter) {
        this.logger.log(`Encounter status changed successfully to ${status} for ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('encounter.status_changed', {
            encounterId: id,
            patientId: encounter.patientId,
            oldStatus: encounter.statusHistory[encounter.statusHistory.length - 2]?.status,
            newStatus: status,
          });
        }
      }

      return encounter;
    } catch (error) {
      this.logger.error(`Error changing encounter status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Complete an encounter
   * @param id - Encounter ID
   * @param context - Request context
   * @returns Promise<Encounter | null> - The completed encounter or null
   */
  async completeEncounter(id: string, context: any): Promise<Encounter | null> {
    try {
      this.logger.log(`Completing encounter with ID: ${id}`);

      const encounter = await this.encounterRepository.updateEncounter(
        id,
        {
          status: EncounterStatus.FINISHED,
          endDate: new Date(),
        },
        context
      );

      if (encounter) {
        this.logger.log(`Encounter completed successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('encounter.completed', {
            encounterId: id,
            patientId: encounter.patientId,
            duration: encounter.duration,
          });
        }
      }

      return encounter;
    } catch (error) {
      this.logger.error(`Error completing encounter: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Cancel an encounter
   * @param id - Encounter ID
   * @param reason - Cancellation reason
   * @param context - Request context
   * @returns Promise<Encounter | null> - The cancelled encounter or null
   */
  async cancelEncounter(id: string, reason: string, context: any): Promise<Encounter | null> {
    try {
      this.logger.log(`Cancelling encounter with ID: ${id}, reason: ${reason}`);

      const encounter = await this.encounterRepository.updateEncounter(
        id,
        {
          status: EncounterStatus.CANCELLED,
          endDate: new Date(),
        },
        context
      );

      if (encounter) {
        this.logger.log(`Encounter cancelled successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('encounter.cancelled', {
            encounterId: id,
            patientId: encounter.patientId,
            reason,
          });
        }
      }

      return encounter;
    } catch (error) {
      this.logger.error(`Error cancelling encounter: ${error.message}`, error.stack);
      throw error;
    }
  }
}
