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
import { EformService } from './eform.service';
import { CreateEformDto } from './create-eform.dto';
import { Eform } from './eform.entity';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';

@ApiTags('Eforms')
@Controller('eforms')
@ApiBearerAuth()
export class EformController {
  constructor(private readonly eformService: EformService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new eform',
    description: 'Creates a new electronic form with the provided information',
  })
  @ApiResponse({
    status: 201,
    description: 'Eform created successfully',
    type: Eform,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data provided',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Eform with the same code and version already exists',
  })
  async createEform(
    @Body() createEformDto: CreateEformDto,
    @Request() req: any
  ): Promise<Eform> {
    return await this.eformService.createEform(createEformDto, req);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all eforms',
    description: 'Retrieves a paginated list of eforms with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Eforms retrieved successfully',
    type: PaginationResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort fields (e.g., name:asc,code:desc)' })
  @ApiQuery({ name: 'filter', required: false, type: String, description: 'Filter criteria (JSON string)' })
  async getEforms(@Query() query: PaginationQueryDto): Promise<PaginationResponseDto<Eform>> {
    return await this.eformService.getEforms(query);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search eforms by name',
    description: 'Searches for eforms by name with partial matching',
  })
  @ApiResponse({
    status: 200,
    description: 'Eforms found successfully',
    type: PaginationResponseDto,
  })
  @ApiQuery({ name: 'name', required: true, type: String, description: 'Name to search for' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size' })
  async searchEformsByName(
    @Query('name') name: string,
    @Query() query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Eform>> {
    return await this.eformService.searchEformsByName(name, query);
  }

  @Get('status/:status')
  @ApiOperation({
    summary: 'Get eforms by status',
    description: 'Retrieves eforms filtered by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Eforms retrieved successfully',
    type: PaginationResponseDto,
  })
  @ApiParam({ name: 'status', description: 'Status to filter by' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size' })
  async getEformsByStatus(
    @Param('status') status: string,
    @Query() query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Eform>> {
    return await this.eformService.getEformsByStatus(status, query);
  }

  @Get('category/:category')
  @ApiOperation({
    summary: 'Get eforms by category',
    description: 'Retrieves eforms filtered by category',
  })
  @ApiResponse({
    status: 200,
    description: 'Eforms retrieved successfully',
    type: PaginationResponseDto,
  })
  @ApiParam({ name: 'category', description: 'Category to filter by' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size' })
  async getEformsByCategory(
    @Param('category') category: string,
    @Query() query: PaginationQueryDto
  ): Promise<PaginationResponseDto<Eform>> {
    return await this.eformService.getEformsByCategory(category, query);
  }

  @Get('templates')
  @ApiOperation({
    summary: 'Get template eforms',
    description: 'Retrieves all template eforms',
  })
  @ApiResponse({
    status: 200,
    description: 'Template eforms retrieved successfully',
    type: PaginationResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size' })
  async getTemplateEforms(@Query() query: PaginationQueryDto): Promise<PaginationResponseDto<Eform>> {
    return await this.eformService.getTemplateEforms(query);
  }

  @Get('code/:code')
  @ApiOperation({
    summary: 'Get eform by code',
    description: 'Retrieves an eform by its code',
  })
  @ApiResponse({
    status: 200,
    description: 'Eform found successfully',
    type: Eform,
  })
  @ApiResponse({
    status: 404,
    description: 'Eform not found',
  })
  @ApiParam({ name: 'code', description: 'Eform code' })
  @ApiQuery({ name: 'version', required: false, type: String, description: 'Eform version' })
  async getEformByCode(
    @Param('code') code: string,
    @Query('version') version?: string
  ): Promise<Eform | null> {
    return await this.eformService.getEformByCode(code, version);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get eform by ID',
    description: 'Retrieves an eform by its unique identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Eform found successfully',
    type: Eform,
  })
  @ApiResponse({
    status: 404,
    description: 'Eform not found',
  })
  @ApiParam({ name: 'id', description: 'Eform ID' })
  async getEformById(@Param('id') id: string): Promise<Eform | null> {
    return await this.eformService.getEformById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update eform',
    description: 'Updates an existing eform record',
  })
  @ApiResponse({
    status: 200,
    description: 'Eform updated successfully',
    type: Eform,
  })
  @ApiResponse({
    status: 404,
    description: 'Eform not found',
  })
  @ApiParam({ name: 'id', description: 'Eform ID' })
  async updateEform(
    @Param('id') id: string,
    @Body() updateData: Partial<Eform>,
    @Request() req: any
  ): Promise<Eform | null> {
    return await this.eformService.updateEform(id, updateData, req);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete eform',
    description: 'Soft deletes an eform record',
  })
  @ApiResponse({
    status: 204,
    description: 'Eform deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Eform not found',
  })
  @ApiParam({ name: 'id', description: 'Eform ID' })
  async deleteEform(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<void> {
    const deleted = await this.eformService.deleteEform(id, req);
    if (!deleted) {
      throw new Error('Eform not found');
    }
  }
}
