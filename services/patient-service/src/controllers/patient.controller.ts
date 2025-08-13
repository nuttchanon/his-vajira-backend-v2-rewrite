import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PatientService } from '../services/patient.service';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';
import { Patient } from '../entities/patient.entity';

@ApiTags('Patients')
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  /**
   * @swagger
   * /api/v2/patients:
   *   post:
   *     summary: Create a new patient
   *     description: Creates a new patient record with the provided information
   *     tags: [Patients]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreatePatientRequest'
   *     responses:
   *       201:
   *         description: Patient created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Patient'
   *       400:
   *         description: Invalid request data
   *       401:
   *         description: Unauthorized
   *       409:
   *         description: Patient with same identifier already exists
   */
  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({
    status: 201,
    description: 'Patient created successfully',
    type: Patient,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 409, description: 'Patient with same identifier already exists' })
  async createPatient(
    @Body() createPatientDto: CreatePatientDto,
    @Query('context') context?: any
  ): Promise<Patient> {
    try {
      const requestContext = context ? JSON.parse(context) : {};
      return await this.patientService.createPatient(createPatientDto, requestContext);
    } catch (error) {
      if (error.message.includes('already exists')) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Patients retrieved successfully',
    type: PaginationResponseDto<Patient>,
  })
  async getPatients(@Query() query: PaginationQueryDto): Promise<PaginationResponseDto<Patient>> {
    try {
      return await this.patientService.getPatients(query);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient retrieved successfully',
    type: Patient,
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientById(@Param('id') id: string): Promise<Patient> {
    try {
      const patient = await this.patientService.getPatientById(id);
      if (!patient) {
        throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
      }
      return patient;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update patient by ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient updated successfully',
    type: Patient,
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async updatePatient(
    @Param('id') id: string,
    @Body() updateData: Partial<Patient>,
    @Query('context') context?: any
  ): Promise<Patient> {
    try {
      const requestContext = context ? JSON.parse(context) : {};
      const patient = await this.patientService.updatePatient(id, updateData, requestContext);
      if (!patient) {
        throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
      }
      return patient;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete patient by ID (soft delete)' })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async deletePatient(
    @Param('id') id: string,
    @Query('context') context?: any
  ): Promise<{ success: boolean }> {
    try {
      const requestContext = context ? JSON.parse(context) : {};
      const success = await this.patientService.deletePatient(id, requestContext);
      if (!success) {
        throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
      }
      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
