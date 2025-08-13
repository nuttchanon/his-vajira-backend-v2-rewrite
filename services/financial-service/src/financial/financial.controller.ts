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
import { FinancialService } from './financial.service';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { PaginationQueryDto } from '@his/shared';

@Controller('financials')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  /**
   * Create a new financial record
   * @param createFinancialDto - The financial creation data
   * @param req - The request object containing user context
   * @returns Promise<Financial> - The created financial record
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createFinancial(@Body() createFinancialDto: CreateFinancialDto, @Request() req: any) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };

    return await this.financialService.createFinancial(createFinancialDto, context);
  }

  /**
   * Get a financial record by ID
   * @param id - The financial record ID
   * @returns Promise<Financial | null> - The financial record or null
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getFinancialById(@Param('id') id: string) {
    return await this.financialService.getFinancialById(id);
  }

  /**
   * Get all financial records with pagination and filtering
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<Financial>> - Paginated results
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getFinancials(@Query() query: PaginationQueryDto) {
    return await this.financialService.getFinancials(query);
  }

  /**
   * Update a financial record
   * @param id - The financial record ID
   * @param updateData - The update data
   * @param req - The request object containing user context
   * @returns Promise<Financial | null> - The updated financial record or null
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateFinancial(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateFinancialDto>,
    @Request() req: any
  ) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };

    return await this.financialService.updateFinancial(id, updateData, context);
  }

  /**
   * Delete a financial record (soft delete)
   * @param id - The financial record ID
   * @param req - The request object containing user context
   * @returns Promise<boolean> - True if deleted successfully
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFinancial(@Param('id') id: string, @Request() req: any) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };

    return await this.financialService.deleteFinancial(id, context);
  }
}
