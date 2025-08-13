import { Injectable, Logger } from '@nestjs/common';
import { Patient } from './entity/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';
import { PatientRepository } from './patient.repository';

@Injectable()
export class PatientService {
  private readonly logger = new Logger(PatientService.name);
  public broker: any; // Will be set by the Moleculer service

  constructor(private readonly patientRepository: PatientRepository) {}

  /**
   * Creates a new patient with the provided information
   *
   * @param createPatientDto - The patient creation data transfer object
   * @param context - The request context containing user information
   * @returns Promise<Patient> - The created patient entity
   *
   * @throws ValidationError - When the provided data is invalid
   * @throws DuplicatePatientError - When a patient with the same identifier already exists
   * @throws DatabaseError - When there's an issue with the database operation
   *
   * @example
   * ```typescript
   * const patient = await patientService.createPatient({
   *   identifier: [{ system: 'HN', value: '12345' }],
   *   name: [{ given: ['John'], family: 'Doe' }],
   *   gender: 'male',
   *   birthDate: new Date('1990-01-01')
   * }, requestContext);
   * ```
   *
   * @since 2.0.0
   * @author Development Team
   */
  async createPatient(createPatientDto: CreatePatientDto, context: any): Promise<Patient> {
    try {
      this.logger.log(
        `Creating new patient with identifier: ${createPatientDto.identifier[0]?.value}`
      );

      const savedPatient = await this.patientRepository.createPatient(createPatientDto, context);

      this.logger.log(`Patient created successfully with ID: ${savedPatient._id}`);

      // Emit event for other services
      if (this.broker) {
        this.broker.emit('patient.created', {
          patientId: savedPatient._id,
          identifier: savedPatient.identifier[0]?.value,
        });
      }

      return savedPatient;
    } catch (error: any) {
      this.logger.error(`Error creating patient: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves a patient by their ID
   *
   * @param id - The patient ID
   * @returns Promise<Patient | null> - The patient entity or null if not found
   */
  async getPatientById(id: string): Promise<Patient | null> {
    try {
      this.logger.log(`Fetching patient with ID: ${id}`);
      return await this.patientRepository.getPatientById(id);
    } catch (error: any) {
      this.logger.error(`Error fetching patient: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves patients with pagination and filtering
   *
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Patient>> - Paginated patient results
   */
  async getPatients(query: PaginationQueryDto): Promise<PaginationResponseDto<Patient>> {
    try {
      this.logger.log(`Fetching patients with query: ${JSON.stringify(query)}`);
      return await this.patientRepository.getPatients(query);
    } catch (error) {
      this.logger.error(`Error fetching patients: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Updates a patient by their ID
   *
   * @param id - The patient ID
   * @param updateData - The data to update
   * @param context - The request context
   * @returns Promise<Patient | null> - The updated patient or null if not found
   */
  async updatePatient(
    id: string,
    updateData: Partial<Patient>,
    context: any
  ): Promise<Patient | null> {
    try {
      this.logger.log(`Updating patient with ID: ${id}`);

      const updatedPatient = await this.patientRepository.updatePatient(id, updateData, context);

      if (updatedPatient) {
        this.logger.log(`Patient updated successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('patient.updated', {
            patientId: id,
            identifier: updatedPatient.identifier[0]?.value,
          });
        }
      }

      return updatedPatient;
    } catch (error) {
      this.logger.error(`Error updating patient: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Deletes a patient by their ID (soft delete)
   *
   * @param id - The patient ID
   * @param context - The request context
   * @returns Promise<boolean> - True if deleted successfully
   */
  async deletePatient(id: string, context: any): Promise<boolean> {
    try {
      this.logger.log(`Deleting patient with ID: ${id}`);

      const deleted = await this.patientRepository.deletePatient(id, context);

      if (deleted) {
        this.logger.log(`Patient deleted successfully with ID: ${id}`);

        // Emit event for other services
        if (this.broker) {
          this.broker.emit('patient.deleted', {
            patientId: id,
          });
        }
      }

      return deleted;
    } catch (error) {
      this.logger.error(`Error deleting patient: ${error.message}`, error.stack);
      throw error;
    }
  }
}
