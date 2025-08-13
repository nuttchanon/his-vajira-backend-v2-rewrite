import { Injectable } from '@nestjs/common';
import { getModelForClass } from '@typegoose/typegoose';
import {
  BaseRepository,
  QueryBuilderOptions,
  PaginationQueryDto,
  PaginationResponseDto,
} from '@his/shared';
import { Patient } from './entity/patient.entity';

@Injectable()
export class PatientRepository extends BaseRepository<Patient> {
  constructor() {
    super(getModelForClass(Patient));
  }

  /**
   * Find patient by medical record number
   * @param mrn - Medical Record Number
   * @returns Patient or null
   */
  async findByMRN(mrn: string): Promise<Patient | null> {
    return this.findOne({ mrn });
  }

  /**
   * Find patient by national ID
   * @param nationalId - National ID
   * @returns Patient or null
   */
  async findByNationalId(nationalId: string): Promise<Patient | null> {
    return this.findOne({ nationalId });
  }

  /**
   * Find patients by name (search in firstName, lastName, and fullName)
   * @param name - Name to search for
   * @param query - Pagination query
   * @returns Paginated patients
   */
  async findByName(
    name: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Patient>> {
    const options: QueryBuilderOptions = {
      filter: {
        $or: [
          { firstName: { $regex: name, $options: 'i' } },
          { lastName: { $regex: name, $options: 'i' } },
          { fullName: { $regex: name, $options: 'i' } },
        ],
      },
    };

    return this.findAll(query, options);
  }

  /**
   * Find patients by status
   * @param status - Patient status
   * @param query - Pagination query
   * @returns Paginated patients
   */
  async findByStatus(
    status: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Patient>> {
    const options: QueryBuilderOptions = {
      filter: { status },
    };

    return this.findAll(query, options);
  }

  /**
   * Find patients by gender
   * @param gender - Patient gender
   * @param query - Pagination query
   * @returns Paginated patients
   */
  async findByGender(
    gender: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Patient>> {
    const options: QueryBuilderOptions = {
      filter: { gender },
    };

    return this.findAll(query, options);
  }

  /**
   * Find patients by date of birth range
   * @param startDate - Start date
   * @param endDate - End date
   * @param query - Pagination query
   * @returns Paginated patients
   */
  async findByDateOfBirthRange(
    startDate: Date,
    endDate: Date,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Patient>> {
    const options: QueryBuilderOptions = {
      filter: {
        dateOfBirth: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    };

    return this.findAll(query, options);
  }

  /**
   * Find patients by age range
   * @param minAge - Minimum age
   * @param maxAge - Maximum age
   * @param query - Pagination query
   * @returns Paginated patients
   */
  async findByAgeRange(
    minAge: number,
    maxAge: number,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Patient>> {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());

    const options: QueryBuilderOptions = {
      filter: {
        dateOfBirth: {
          $gte: minDate,
          $lte: maxDate,
        },
      },
    };

    return this.findAll(query, options);
  }

  /**
   * Find patients by phone number
   * @param phoneNumber - Phone number
   * @param query - Pagination query
   * @returns Paginated patients
   */
  async findByPhoneNumber(
    phoneNumber: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Patient>> {
    const options: QueryBuilderOptions = {
      filter: {
        $or: [
          { phoneNumber: { $regex: phoneNumber, $options: 'i' } },
          { 'contactInfo.phoneNumber': { $regex: phoneNumber, $options: 'i' } },
        ],
      },
    };

    return this.findAll(query, options);
  }

  /**
   * Find patients by email
   * @param email - Email address
   * @param query - Pagination query
   * @returns Paginated patients
   */
  async findByEmail(
    email: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Patient>> {
    const options: QueryBuilderOptions = {
      filter: {
        $or: [
          { email: { $regex: email, $options: 'i' } },
          { 'contactInfo.email': { $regex: email, $options: 'i' } },
        ],
      },
    };

    return this.findAll(query, options);
  }

  /**
   * Find patients by address
   * @param address - Address to search for
   * @param query - Pagination query
   * @returns Paginated patients
   */
  async findByAddress(
    address: string,
    query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Patient>> {
    const options: QueryBuilderOptions = {
      filter: {
        $or: [
          { 'address.street': { $regex: address, $options: 'i' } },
          { 'address.city': { $regex: address, $options: 'i' } },
          { 'address.state': { $regex: address, $options: 'i' } },
          { 'address.postalCode': { $regex: address, $options: 'i' } },
        ],
      },
    };

    return this.findAll(query, options);
  }

  /**
   * Find active patients
   * @param query - Pagination query
   * @returns Paginated active patients
   */
  async findActivePatients(query: PaginationQueryDto): Promise<PaginationResponseDto<Patient>> {
    const options: QueryBuilderOptions = {
      filter: { status: 'active' },
    };

    return this.findAll(query, options);
  }

  /**
   * Get patient statistics
   * @returns Patient statistics
   */
  async getPatientStatistics(): Promise<any> {
    const [
      totalPatients,
      activePatients,
      inactivePatients,
      malePatients,
      femalePatients,
      patientsByStatus,
    ] = await Promise.all([
      this.count(),
      this.count({ status: 'active' }),
      this.count({ status: 'inactive' }),
      this.count({ gender: 'male' }),
      this.count({ gender: 'female' }),
      this.model.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    return {
      total: totalPatients,
      active: activePatients,
      inactive: inactivePatients,
      male: malePatients,
      female: femalePatients,
      byStatus: patientsByStatus,
    };
  }

  /**
   * Create a new patient with validation
   * @param patientData - Patient data
   * @param context - Request context
   * @returns Created patient
   */
  async createPatient(patientData: any, context: any): Promise<Patient> {
    // Add audit trail
    const dataWithAudit = {
      ...patientData,
      createdBy: context?.user?.id,
      createdByName: context?.user?.username || context?.user?.fullName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.create(dataWithAudit);
  }

  /**
   * Update patient with validation
   * @param id - Patient ID
   * @param updateData - Update data
   * @param context - Request context
   * @returns Updated patient
   */
  async updatePatient(id: string, updateData: any, context: any): Promise<Patient | null> {
    // Add audit trail
    const dataWithAudit = {
      ...updateData,
      updatedBy: context?.user?.id,
      updatedByName: context?.user?.username || context?.user?.fullName,
      updatedAt: new Date(),
    };

    return this.update(id, dataWithAudit);
  }

  /**
   * Delete patient (soft delete)
   * @param id - Patient ID
   * @param context - Request context
   * @returns Success status
   */
  async deletePatient(id: string, context: any): Promise<boolean> {
    return this.delete(id, context);
  }

  /**
   * Get all patients with pagination
   * @param query - Pagination query
   * @returns Paginated patients
   */
  async getPatients(query: PaginationQueryDto): Promise<PaginationResponseDto<Patient>> {
    return this.findAll(query);
  }

  /**
   * Get patient by ID
   * @param id - Patient ID
   * @returns Patient or null
   */
  async getPatientById(id: string): Promise<Patient | null> {
    return this.findById(id);
  }
}
