import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DiagnosticService } from './diagnostic.service';
import { CreateDiagnosticDto } from './create-diagnostic.dto';
import { Diagnostic } from './diagnostic.entity';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';

@ApiTags('Diagnostics')
@Controller('diagnostics')
@ApiBearerAuth()
export class DiagnosticController {
  constructor(private readonly diagnosticService: DiagnosticService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new diagnostic',
    description: 'Creates a new diagnostic record with the provided information',
  })
  @ApiResponse({
    status: 201,
    description: 'Diagnostic created successfully',
    type: Diagnostic,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data provided',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Diagnostic with the same code already exists',
  })
  async createDiagnostic(
    @Body() createDiagnosticDto: CreateDiagnosticDto,
    @Request() req: any
  ): Promise<Diagnostic> {
    return await this.diagnosticService.createDiagnostic(createDiagnosticDto, req);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all diagnostics',
    description: 'Retrieves a paginated list of diagnostics with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnostics retrieved successfully',
    type: PaginationResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort fields (e.g., name:asc,code:desc)' })
  @ApiQuery({ name: 'filter', required: false, type: String, description: 'Filter criteria (JSON string)' })
  async getDiagnostics(@Query() query: PaginationQueryDto): Promise<PaginationResponseDto<Diagnostic>> {
    return await this.diagnosticService.getDiagnostics(query);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search diagnostics by name',
    description: 'Searches for diagnostics by name with partial matching',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnostics found successfully',
    type: PaginationResponseDto,
  })
  @ApiQuery({ name: 'name', required: true, type: String, description: 'Name to search for' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size' })
  async searchDiagnosticsByName(
    @Query('name') name: string,
    @Query() query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Diagnostic>> {
    return await this.diagnosticService.searchDiagnosticsByName(name, query);
  }

  @Get('category/:category')
  @ApiOperation({
    summary: 'Get diagnostics by category',
    description: 'Retrieves diagnostics filtered by category',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnostics retrieved successfully',
    type: PaginationResponseDto,
  })
  @ApiParam({ name: 'category', description: 'Category to filter by' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size' })
  async getDiagnosticsByCategory(
    @Param('category') category: string,
    @Query() query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Diagnostic>> {
    return await this.diagnosticService.getDiagnosticsByCategory(category, query);
  }

  @Get('coding-system/:codingSystem')
  @ApiOperation({
    summary: 'Get diagnostics by coding system',
    description: 'Retrieves diagnostics filtered by coding system',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnostics retrieved successfully',
    type: PaginationResponseDto,
  })
  @ApiParam({ name: 'codingSystem', description: 'Coding system to filter by' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size' })
  async getDiagnosticsByCodingSystem(
    @Param('codingSystem') codingSystem: string,
    @Query() query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Diagnostic>> {
    return await this.diagnosticService.getDiagnosticsByCodingSystem(codingSystem, query);
  }

  @Get('code/:code')
  @ApiOperation({
    summary: 'Get diagnostic by code',
    description: 'Retrieves a diagnostic by its code',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnostic found successfully',
    type: Diagnostic,
  })
  @ApiResponse({
    status: 404,
    description: 'Diagnostic not found',
  })
  @ApiParam({ name: 'code', description: 'Diagnostic code' })
  @ApiQuery({ name: 'codingSystem', required: false, type: String, description: 'Coding system' })
  async getDiagnosticByCode(
    @Param('code') code: string,
    @Query('codingSystem') codingSystem?: string
  ): Promise<Diagnostic | null> {
    return await this.diagnosticService.getDiagnosticByCode(code, codingSystem);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get diagnostic by ID',
    description: 'Retrieves a diagnostic by its unique identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnostic found successfully',
    type: Diagnostic,
  })
  @ApiResponse({
    status: 404,
    description: 'Diagnostic not found',
  })
  @ApiParam({ name: 'id', description: 'Diagnostic ID' })
  async getDiagnosticById(@Param('id') id: string): Promise<Diagnostic | null> {
    return await this.diagnosticService.getDiagnosticById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update diagnostic',
    description: 'Updates an existing diagnostic record',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnostic updated successfully',
    type: Diagnostic,
  })
  @ApiResponse({
    status: 404,
    description: 'Diagnostic not found',
  })
  @ApiParam({ name: 'id', description: 'Diagnostic ID' })
  async updateDiagnostic(
    @Param('id') id: string,
    @Body() updateData: Partial<Diagnostic>,
    @Request() req: any
  ): Promise<Diagnostic | null> {
    return await this.diagnosticService.updateDiagnostic(id, updateData, req);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete diagnostic',
    description: 'Soft deletes a diagnostic record',
  })
  @ApiResponse({
    status: 204,
    description: 'Diagnostic deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Diagnostic not found',
  })
  @ApiParam({ name: 'id', description: 'Diagnostic ID' })
  async deleteDiagnostic(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<void> {
    const deleted = await this.diagnosticService.deleteDiagnostic(id, req);
    if (!deleted) {
      throw new Error('Diagnostic not found');
    }
  }
}
