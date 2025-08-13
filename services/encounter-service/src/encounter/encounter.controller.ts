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
  Request,
} from '@nestjs/common';
import { EncounterService } from './encounter.service';
import { CreateEncounterDto, UpdateEncounterDto, EncounterQueryDto } from './encounter.dto';
import { PaginationQueryDto } from '@his/shared';
import { Encounter, EncounterStatus, EncounterClass, EncounterPriority } from './encounter.entity';

@Controller('encounters')
export class EncounterController {
  constructor(private readonly encounterService: EncounterService) {}

  /**
   * Create a new encounter
   * @param createEncounterDto - Encounter creation data
   * @param req - Request object
   * @returns Promise<Encounter> - The created encounter
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEncounter(@Body() createEncounterDto: CreateEncounterDto, @Request() req: any): Promise<Encounter> {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    return await this.encounterService.createEncounter(createEncounterDto, context);
  }

  /**
   * Get encounter by ID
   * @param id - Encounter ID
   * @returns Promise<Encounter | null> - The encounter or null
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getEncounterById(@Param('id') id: string): Promise<Encounter | null> {
    return await this.encounterService.getEncounterById(id);
  }

  /**
   * Get all encounters with pagination and filtering
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getEncounters(@Query() query: PaginationQueryDto): Promise<any> {
    return await this.encounterService.getEncounters(query);
  }

  /**
   * Update an encounter
   * @param id - Encounter ID
   * @param updateData - Update data
   * @param req - Request object
   * @returns Promise<Encounter | null> - The updated encounter or null
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateEncounter(
    @Param('id') id: string,
    @Body() updateData: UpdateEncounterDto,
    @Request() req: any
  ): Promise<Encounter | null> {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    return await this.encounterService.updateEncounter(id, updateData, context);
  }

  /**
   * Delete an encounter (soft delete)
   * @param id - Encounter ID
   * @param req - Request object
   * @returns Promise<boolean> - Success status
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEncounter(@Param('id') id: string, @Request() req: any): Promise<boolean> {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    return await this.encounterService.deleteEncounter(id, context);
  }

  /**
   * Get encounters by patient ID
   * @param patientId - Patient ID
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  @Get('patient/:patientId')
  @HttpCode(HttpStatus.OK)
  async getEncountersByPatientId(@Param('patientId') patientId: string, @Query() query: PaginationQueryDto): Promise<any> {
    return await this.encounterService.getEncountersByPatientId(patientId, query);
  }

  /**
   * Get encounters by status
   * @param status - Encounter status
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  @Get('status/:status')
  @HttpCode(HttpStatus.OK)
  async getEncountersByStatus(@Param('status') status: EncounterStatus, @Query() query: PaginationQueryDto): Promise<any> {
    return await this.encounterService.getEncountersByStatus(status, query);
  }

  /**
   * Get encounters by class
   * @param encounterClass - Encounter class
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  @Get('class/:encounterClass')
  @HttpCode(HttpStatus.OK)
  async getEncountersByClass(@Param('encounterClass') encounterClass: EncounterClass, @Query() query: PaginationQueryDto): Promise<any> {
    return await this.encounterService.getEncountersByClass(encounterClass, query);
  }

  /**
   * Get encounters by priority
   * @param priority - Encounter priority
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  @Get('priority/:priority')
  @HttpCode(HttpStatus.OK)
  async getEncountersByPriority(@Param('priority') priority: EncounterPriority, @Query() query: PaginationQueryDto): Promise<any> {
    return await this.encounterService.getEncountersByPriority(priority, query);
  }

  /**
   * Get active encounters
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  @Get('active/list')
  @HttpCode(HttpStatus.OK)
  async getActiveEncounters(@Query() query: PaginationQueryDto): Promise<any> {
    return await this.encounterService.getActiveEncounters(query);
  }

  /**
   * Get encounters by service provider
   * @param serviceProvider - Service provider
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  @Get('provider/:serviceProvider')
  @HttpCode(HttpStatus.OK)
  async getEncountersByServiceProvider(@Param('serviceProvider') serviceProvider: string, @Query() query: PaginationQueryDto): Promise<any> {
    return await this.encounterService.getEncountersByServiceProvider(serviceProvider, query);
  }

  /**
   * Search encounters by reason text
   * @param reasonText - Reason text to search for
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  @Get('search/reason/:reasonText')
  @HttpCode(HttpStatus.OK)
  async searchEncountersByReasonText(@Param('reasonText') reasonText: string, @Query() query: PaginationQueryDto): Promise<any> {
    return await this.encounterService.searchEncountersByReasonText(reasonText, query);
  }

  /**
   * Get encounters with advanced filtering
   * @param encounterQuery - Advanced query parameters
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  @Post('search')
  @HttpCode(HttpStatus.OK)
  async getEncountersWithFilter(@Body() encounterQuery: EncounterQueryDto, @Query() query: PaginationQueryDto): Promise<any> {
    return await this.encounterService.getEncountersWithFilter(encounterQuery, query);
  }

  /**
   * Get encounter statistics
   * @returns Promise<object> - Encounter statistics
   */
  @Get('statistics/overview')
  @HttpCode(HttpStatus.OK)
  async getEncounterStatistics(): Promise<object> {
    return await this.encounterService.getEncounterStatistics();
  }

  /**
   * Change encounter status
   * @param id - Encounter ID
   * @param status - New status
   * @param req - Request object
   * @returns Promise<Encounter | null> - The updated encounter or null
   */
  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  async changeEncounterStatus(
    @Param('id') id: string,
    @Body('status') status: EncounterStatus,
    @Request() req: any
  ): Promise<Encounter | null> {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    return await this.encounterService.changeEncounterStatus(id, status, context);
  }

  /**
   * Complete an encounter
   * @param id - Encounter ID
   * @param req - Request object
   * @returns Promise<Encounter | null> - The completed encounter or null
   */
  @Put(':id/complete')
  @HttpCode(HttpStatus.OK)
  async completeEncounter(@Param('id') id: string, @Request() req: any): Promise<Encounter | null> {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    return await this.encounterService.completeEncounter(id, context);
  }

  /**
   * Cancel an encounter
   * @param id - Encounter ID
   * @param reason - Cancellation reason
   * @param req - Request object
   * @returns Promise<Encounter | null> - The cancelled encounter or null
   */
  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelEncounter(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any
  ): Promise<Encounter | null> {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    return await this.encounterService.cancelEncounter(id, reason, context);
  }

  /**
   * Get encounters by date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<Encounter>> - Paginated results
   */
  @Get('date-range/:startDate/:endDate')
  @HttpCode(HttpStatus.OK)
  async getEncountersByDateRange(
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string,
    @Query() query: PaginationQueryDto
  ): Promise<any> {
    return await this.encounterService.getEncountersByDateRange(new Date(startDate), new Date(endDate), query);
  }

  /**
   * Health check endpoint
   * @returns Promise<{ status: string; timestamp: string }> - Health status
   */
  @Get('health/check')
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
