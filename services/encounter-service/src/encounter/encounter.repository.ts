import { Injectable } from '@nestjs/common';
import { getModelForClass } from '@typegoose/typegoose';
import { BaseRepository } from '@his/shared';
import { Encounter, EncounterStatus, EncounterClass, EncounterPriority } from './encounter.entity';
import { CreateEncounterDto, UpdateEncounterDto, EncounterQueryDto } from './encounter.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';

@Injectable()
export class EncounterRepository extends BaseRepository<Encounter> {
  constructor() {
    const encounterModel = getModelForClass(Encounter);
    super(encounterModel);
  }

  /**
   * Find encounters by patient ID
   * @param patientId - The patient ID to search for
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async findByPatientId(
    patientId: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.debug(`Finding encounters by patient ID: ${patientId}`);

      const filter = { patientId, active: true };
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding encounters by patient ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find encounters by status
   * @param status - The status to filter by
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async findByStatus(
    status: EncounterStatus,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.debug(`Finding encounters by status: ${status}`);

      const filter = { status, active: true };
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding encounters by status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find encounters by class
   * @param encounterClass - The encounter class to filter by
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async findByClass(
    encounterClass: EncounterClass,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.debug(`Finding encounters by class: ${encounterClass}`);

      const filter = { encounterClass, active: true };
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding encounters by class: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find encounters by priority
   * @param priority - The priority to filter by
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async findByPriority(
    priority: EncounterPriority,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.debug(`Finding encounters by priority: ${priority}`);

      const filter = { priority, active: true };
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding encounters by priority: ${error.message}`, error.stack);
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
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.debug(`Finding encounters by date range: ${startDate} to ${endDate}`);

      const filter = {
        startDate: { $gte: startDate, $lte: endDate },
        active: true,
      };
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding encounters by date range: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find active encounters
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async findActiveEncounters(query: PaginationQueryDto): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.debug('Finding active encounters');

      const filter = {
        status: { $in: [EncounterStatus.IN_PROGRESS, EncounterStatus.ARRIVED] },
        active: true,
      };
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding active encounters: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find encounters by service provider
   * @param serviceProvider - The service provider to filter by
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async findByServiceProvider(
    serviceProvider: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.debug(`Finding encounters by service provider: ${serviceProvider}`);

      const filter = { serviceProvider, active: true };
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(
        `Error finding encounters by service provider: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Search encounters by reason text
   * @param reasonText - The reason text to search for
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async searchByReasonText(
    reasonText: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.debug(`Searching encounters by reason text: ${reasonText}`);

      const filter = {
        reasonText: { $regex: reasonText, $options: 'i' },
        active: true,
      };
      return await this.findAll(query, { filter });
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
  async findEncountersWithFilter(
    encounterQuery: EncounterQueryDto,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.debug(`Finding encounters with filter: ${JSON.stringify(encounterQuery)}`);

      const filter: any = { active: true };

      if (encounterQuery.patientId) {
        filter.patientId = encounterQuery.patientId;
      }

      if (encounterQuery.status) {
        filter.status = encounterQuery.status;
      }

      if (encounterQuery.encounterClass) {
        filter.encounterClass = encounterQuery.encounterClass;
      }

      if (encounterQuery.priority) {
        filter.priority = encounterQuery.priority;
      }

      if (encounterQuery.serviceProvider) {
        filter.serviceProvider = encounterQuery.serviceProvider;
      }

      if (encounterQuery.startDateFrom || encounterQuery.startDateTo) {
        filter.startDate = {};
        if (encounterQuery.startDateFrom) {
          filter.startDate.$gte = new Date(encounterQuery.startDateFrom);
        }
        if (encounterQuery.startDateTo) {
          filter.startDate.$lte = new Date(encounterQuery.startDateTo);
        }
      }

      if (encounterQuery.endDateFrom || encounterQuery.endDateTo) {
        filter.endDate = {};
        if (encounterQuery.endDateFrom) {
          filter.endDate.$gte = new Date(encounterQuery.endDateFrom);
        }
        if (encounterQuery.endDateTo) {
          filter.endDate.$lte = new Date(encounterQuery.endDateTo);
        }
      }

      if (encounterQuery.search) {
        filter.$or = [
          { reasonText: { $regex: encounterQuery.search, $options: 'i' } },
          { reasonCode: { $regex: encounterQuery.search, $options: 'i' } },
        ];
      }

      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding encounters with filter: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new encounter with audit trail
   * @param createEncounterDto - The encounter creation data
   * @param context - The request context
   * @returns Promise<Encounter> - The created encounter
   */
  async createEncounter(createEncounterDto: CreateEncounterDto, context: any): Promise<Encounter> {
    try {
      this.logger.debug(`Creating new encounter for patient: ${createEncounterDto.patientId}`);

      // Prepare encounter data with audit information
      const encounterData = {
        ...createEncounterDto,
        startDate: new Date(createEncounterDto.startDate),
        endDate: createEncounterDto.endDate ? new Date(createEncounterDto.endDate) : undefined,
        createdBy: context?.user?.id || 'system',
        createdByName: context?.user?.name || 'System',
        tenantId: context?.tenantId,
        sourceSystem: 'his-v2',
        statusHistory: [
          {
            status: createEncounterDto.status || EncounterStatus.PLANNED,
            period: {
              start: new Date(),
            },
            updatedBy: context?.user?.id || 'system',
            updatedByName: context?.user?.name || 'System',
            updatedAt: new Date(),
          },
        ],
      };

      return await this.create(encounterData);
    } catch (error) {
      this.logger.error(`Error creating encounter: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update an encounter with audit trail
   * @param id - The encounter ID
   * @param updateData - The update data
   * @param context - The request context
   * @returns Promise<Encounter | null> - The updated encounter or null
   */
  async updateEncounter(
    id: string,
    updateData: UpdateEncounterDto,
    context: any
  ): Promise<Encounter | null> {
    try {
      this.logger.debug(`Updating encounter with ID: ${id}`);

      const encounter = await this.findById(id);
      if (!encounter) {
        return null;
      }

      // Update status history if status is changing
      const statusHistory = [...encounter.statusHistory];
      if (updateData.status && updateData.status !== encounter.status) {
        // End the current status period
        if (statusHistory.length > 0) {
          statusHistory[statusHistory.length - 1].period.end = new Date();
        }

        // Add new status entry
        statusHistory.push({
          status: updateData.status,
          period: {
            start: new Date(),
          },
          updatedBy: context?.user?.id || 'system',
          updatedByName: context?.user?.name || 'System',
          updatedAt: new Date(),
        });
      }

      const updatePayload = {
        ...updateData,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
        statusHistory,
        updatedBy: context?.user?.id || 'system',
        updatedByName: context?.user?.name || 'System',
        updatedAt: new Date(),
      };

      return await this.update(id, updatePayload);
    } catch (error) {
      this.logger.error(`Error updating encounter: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete an encounter (soft delete)
   * @param id - The encounter ID
   * @param context - The request context
   * @returns Promise<boolean> - Success status
   */
  async deleteEncounter(id: string, context: any): Promise<boolean> {
    try {
      this.logger.debug(`Deleting encounter with ID: ${id}`);
      return await this.delete(id, context);
    } catch (error) {
      this.logger.error(`Error deleting encounter: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get encounters with advanced filtering
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  async getEncounters(query: PaginationQueryDto): Promise<PaginationResponseDto<Encounter>> {
    try {
      this.logger.debug(`Getting encounters with query: ${JSON.stringify(query)}`);
      return await this.findAll(query);
    } catch (error) {
      this.logger.error(`Error getting encounters: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get encounter by ID with proper error handling
   * @param id - The encounter ID
   * @returns Promise<Encounter | null> - The encounter or null
   */
  async getEncounterById(id: string): Promise<Encounter | null> {
    try {
      this.logger.debug(`Getting encounter by ID: ${id}`);
      return await this.findById(id);
    } catch (error) {
      this.logger.error(`Error getting encounter by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get encounter statistics
   * @returns Promise<object> - Encounter statistics
   */
  async getEncounterStatistics(): Promise<object> {
    try {
      this.logger.debug('Getting encounter statistics');

      const totalEncounters = await this.count({ active: true });
      const activeEncounters = await this.count({
        status: { $in: [EncounterStatus.IN_PROGRESS, EncounterStatus.ARRIVED] },
        active: true,
      });
      const completedEncounters = await this.count({
        status: EncounterStatus.FINISHED,
        active: true,
      });
      const cancelledEncounters = await this.count({
        status: EncounterStatus.CANCELLED,
        active: true,
      });

      return {
        total: totalEncounters,
        active: activeEncounters,
        completed: completedEncounters,
        cancelled: cancelledEncounters,
      };
    } catch (error) {
      this.logger.error(`Error getting encounter statistics: ${error.message}`, error.stack);
      throw error;
    }
  }
}
