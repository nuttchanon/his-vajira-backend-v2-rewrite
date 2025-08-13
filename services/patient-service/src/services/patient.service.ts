import { Injectable, Logger } from '@nestjs/common';
import { getModelForClass } from '@typegoose/typegoose';
import { Patient } from '../entities/patient.entity';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';

@Injectable()
export class PatientService {
  private readonly logger = new Logger(PatientService.name);
  private readonly patientModel = getModelForClass(Patient);
  public broker: any; // Will be set by the Moleculer service

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

      // Check for duplicate identifiers
      const existingPatient = await this.patientModel.findOne({
        'identifier.system': createPatientDto.identifier[0]?.system,
        'identifier.value': createPatientDto.identifier[0]?.value,
        active: true,
      });

      if (existingPatient) {
        throw new Error(
          `Patient with identifier ${createPatientDto.identifier[0]?.value} already exists`
        );
      }

      // Create new patient
      const patient = new this.patientModel({
        ...createPatientDto,
        createdBy: context?.user?.id || 'system',
        createdByName: context?.user?.name || 'System',
        tenantId: context?.tenantId,
        sourceSystem: 'his-v2',
      });

      const savedPatient = await patient.save();

      this.logger.log(`Patient created successfully with ID: ${savedPatient._id}`);

      // Emit event for other services
      this.broker.emit('patient.created', {
        patientId: savedPatient._id,
        identifier: savedPatient.identifier[0]?.value,
      });

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

      const patient = await this.patientModel.findById(id).exec();

      if (!patient) {
        this.logger.warn(`Patient not found with ID: ${id}`);
        return null;
      }

      return patient;
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

      const { page = 1, pageSize = 10, search, filter } = query;
      const skip = (page - 1) * pageSize;

      // Build query
      const queryFilter: any = { active: true };

      if (search) {
        queryFilter.$text = { $search: search };
      }

      if (filter) {
        const filterObj = JSON.parse(filter);
        Object.assign(queryFilter, filterObj);
      }

      // Execute query with pagination
      const [patients, total] = await Promise.all([
        this.patientModel
          .find(queryFilter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .exec(),
        this.patientModel.countDocuments(queryFilter),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        data: patients,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
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

      const updatedPatient = await this.patientModel
        .findByIdAndUpdate(
          id,
          {
            ...updateData,
            updatedBy: context?.user?.id || 'system',
            updatedByName: context?.user?.name || 'System',
            updatedAt: new Date(),
          },
          { new: true, runValidators: true }
        )
        .exec();

      if (!updatedPatient) {
        this.logger.warn(`Patient not found for update with ID: ${id}`);
        return null;
      }

      this.logger.log(`Patient updated successfully with ID: ${id}`);

      // Emit event for other services
      this.broker.emit('patient.updated', {
        patientId: id,
        identifier: updatedPatient.identifier[0]?.value,
      });

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

      const deletedPatient = await this.patientModel
        .findByIdAndUpdate(
          id,
          {
            active: false,
            updatedBy: context?.user?.id || 'system',
            updatedByName: context?.user?.name || 'System',
            updatedAt: new Date(),
          },
          { new: true }
        )
        .exec();

      if (!deletedPatient) {
        this.logger.warn(`Patient not found for deletion with ID: ${id}`);
        return false;
      }

      this.logger.log(`Patient deleted successfully with ID: ${id}`);

      // Emit event for other services
      this.broker.emit('patient.deleted', {
        patientId: id,
        identifier: deletedPatient.identifier[0]?.value,
      });

      return true;
    } catch (error) {
      this.logger.error(`Error deleting patient: ${error.message}`, error.stack);
      throw error;
    }
  }
}
