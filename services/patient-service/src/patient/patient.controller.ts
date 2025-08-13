import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './create-patient.dto';
import { PaginationQueryDto } from '@his/shared';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  /**
   * Create a new patient
   * @param createPatientDto - The patient creation data
   * @param req - The request object containing user context
   * @returns Promise<Patient> - The created patient
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPatient(
    @Body() createPatientDto: CreatePatientDto,
    @Request() req: any
  ) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    
    return await this.patientService.createPatient(createPatientDto, context);
  }

  /**
   * Get a patient by ID
   * @param id - The patient ID
   * @returns Promise<Patient | null> - The patient or null
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPatientById(@Param('id') id: string) {
    return await this.patientService.getPatientById(id);
  }

  /**
   * Get all patients with pagination and filtering
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Patient>> - Paginated results
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getPatients(@Query() query: PaginationQueryDto) {
    return await this.patientService.getPatients(query);
  }

  /**
   * Update a patient
   * @param id - The patient ID
   * @param updateData - The update data
   * @param req - The request object containing user context
   * @returns Promise<Patient | null> - The updated patient or null
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updatePatient(
    @Param('id') id: string,
    @Body() updateData: Partial<CreatePatientDto>,
    @Request() req: any
  ) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    
    return await this.patientService.updatePatient(id, updateData, context);
  }

  /**
   * Delete a patient (soft delete)
   * @param id - The patient ID
   * @param req - The request object containing user context
   * @returns Promise<boolean> - True if deleted successfully
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePatient(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    
    return await this.patientService.deletePatient(id, context);
  }

  /**
   * Search patients by name
   * @param name - The name to search for
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Patient>> - Paginated results
   */
  @Get('search/name/:name')
  @HttpCode(HttpStatus.OK)
  async searchPatientsByName(
    @Param('name') name: string,
    @Query() query: PaginationQueryDto
  ) {
    // This would be implemented in the service if needed
    // For now, we'll use the general getPatients method with name filter
    const searchQuery = { ...query, search: name };
    return await this.patientService.getPatients(searchQuery);
  }

  /**
   * Get patient by identifier (HN, etc.)
   * @param system - The identifier system
   * @param value - The identifier value
   * @returns Promise<Patient | null> - The patient or null
   */
  @Get('identifier/:system/:value')
  @HttpCode(HttpStatus.OK)
  async getPatientByIdentifier(
    @Param('system') system: string,
    @Param('value') value: string
  ) {
    // This would be implemented in the service if needed
    // For now, we'll use a filter approach
    const query = { filter: JSON.stringify({ 'identifier.system': system, 'identifier.value': value }) };
    const result = await this.patientService.getPatients(query);
    return result.data.length > 0 ? result.data[0] : null;
  }
}
