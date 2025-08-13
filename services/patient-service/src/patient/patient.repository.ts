import { Injectable } from '@nestjs/common';
import { getModelForClass } from '@typegoose/typegoose';
import { BaseRepository } from '@his/shared';
import { Patient } from './entity/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';

@Injectable()
export class PatientRepository extends BaseRepository<Patient> {
  constructor() {
    const patientModel = getModelForClass(Patient);
    super(patientModel);
  }

  /**
   * Find a patient by identifier (HN, etc.)
   * @param system - The identifier system (e.g., 'HN')
   * @param value - The identifier value
   * @returns Promise<Patient | null> - The found patient or null
   */
  async findByIdentifier(system: string, value: string): Promise<Patient | null> {
    try {
      this.logger.debug(`Finding patient by identifier: ${system}:${value}`);

      return await this.findOne({
        'identifier.system': system,
        'identifier.value': value,
        active: true,
      });
    } catch (error) {
      this.logger.error(`Error finding patient by identifier: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find patients by name (partial match)
   * @param name - The name to search for
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Patient>> - Paginated results
   */
  async findByName(
    name: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Patient>> {
    try {
      this.logger.debug(`Finding patients by name: ${name}`);

      const filter = {
        $or: [
          { 'name.family': { $regex: name, $options: 'i' } },
          { 'name.given': { $regex: name, $options: 'i' } },
        ],
      };

      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding patients by name: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new patient with duplicate checking
   * @param createPatientDto - The patient creation data
   * @param context - The request context
   * @returns Promise<Patient> - The created patient
   */
  async createPatient(createPatientDto: CreatePatientDto, context: any): Promise<Patient> {
    try {
      this.logger.debug(
        `Creating new patient with identifier: ${createPatientDto.identifier[0]?.value}`
      );

      // Check for duplicate identifiers
      const existingPatient = await this.findByIdentifier(
        createPatientDto.identifier[0]?.system,
        createPatientDto.identifier[0]?.value
      );

      if (existingPatient) {
        throw new Error(
          `Patient with identifier ${createPatientDto.identifier[0]?.value} already exists`
        );
      }

      // Prepare patient data with audit information
      const patientData = {
        ...createPatientDto,
        createdBy: context?.user?.id || 'system',
        createdByName: context?.user?.name || 'System',
        tenantId: context?.tenantId,
        sourceSystem: 'his-v2',
      };

      return await this.create(patientData);
    } catch (error) {
      this.logger.error(`Error creating patient: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update a patient with audit trail
   * @param id - The patient ID
   * @param updateData - The update data
   * @param context - The request context
   * @returns Promise<Patient | null> - The updated patient or null
   */
  async updatePatient(
    id: string,
    updateData: Partial<Patient>,
    context: any
  ): Promise<Patient | null> {
    try {
      this.logger.debug(`Updating patient with ID: ${id}`);

      const updatePayload = {
        ...updateData,
        updatedBy: context?.user?.id || 'system',
        updatedByName: context?.user?.name || 'System',
        updatedAt: new Date(),
      };

      return await this.update(id, updatePayload);
    } catch (error) {
      this.logger.error(`Error updating patient: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete a patient with audit trail
   * @param id - The patient ID
   * @param context - The request context
   * @returns Promise<boolean> - True if deleted successfully
   */
  async deletePatient(id: string, context: any): Promise<boolean> {
    try {
      this.logger.debug(`Deleting patient with ID: ${id}`);
      return await this.delete(id, context);
    } catch (error) {
      this.logger.error(`Error deleting patient: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get patients with advanced filtering
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Patient>> - Paginated results
   */
  async getPatients(query: PaginationQueryDto): Promise<PaginationResponseDto<Patient>> {
    try {
      this.logger.debug(`Getting patients with query: ${JSON.stringify(query)}`);
      return await this.findAll(query);
    } catch (error) {
      this.logger.error(`Error getting patients: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get patient by ID with proper error handling
   * @param id - The patient ID
   * @returns Promise<Patient | null> - The patient or null
   */
  async getPatientById(id: string): Promise<Patient | null> {
    try {
      this.logger.debug(`Getting patient by ID: ${id}`);
      return await this.findById(id);
    } catch (error) {
      this.logger.error(`Error getting patient by ID: ${error.message}`, error.stack);
      throw error;
    }
  }
}
