# PowerShell script to restructure services to domain-based architecture
# This script will create the proper structure for messaging, printing, and filestore services

$services = @(
    @{
        Name = "messaging"
        DisplayName = "Messaging"
        EntityFields = @(
            @{ Name = "messageId"; Type = "string"; Required = $true; Unique = $true },
            @{ Name = "senderId"; Type = "string"; Required = $true },
            @{ Name = "senderName"; Type = "string"; Required = $true },
            @{ Name = "recipientId"; Type = "string"; Required = $true },
            @{ Name = "recipientName"; Type = "string"; Required = $true },
            @{ Name = "subject"; Type = "string"; Required = $true },
            @{ Name = "content"; Type = "string"; Required = $true },
            @{ Name = "messageType"; Type = "string"; Required = $true; Enum = @("email", "sms", "notification", "internal") },
            @{ Name = "status"; Type = "string"; Required = $true; Enum = @("draft", "sent", "delivered", "read", "failed") },
            @{ Name = "priority"; Type = "string"; Required = $false; Enum = @("low", "normal", "high", "urgent") },
            @{ Name = "attachments"; Type = "string[]"; Required = $false },
            @{ Name = "metadata"; Type = "object"; Required = $false }
        )
    },
    @{
        Name = "printing"
        DisplayName = "Printing"
        EntityFields = @(
            @{ Name = "printJobId"; Type = "string"; Required = $true; Unique = $true },
            @{ Name = "documentType"; Type = "string"; Required = $true },
            @{ Name = "documentId"; Type = "string"; Required = $true },
            @{ Name = "printerName"; Type = "string"; Required = $true },
            @{ Name = "status"; Type = "string"; Required = $true; Enum = @("pending", "printing", "completed", "failed", "cancelled") },
            @{ Name = "priority"; Type = "string"; Required = $false; Enum = @("low", "normal", "high") },
            @{ Name = "copies"; Type = "number"; Required = $false },
            @{ Name = "pageRange"; Type = "string"; Required = $false },
            @{ Name = "metadata"; Type = "object"; Required = $false }
        )
    },
    @{
        Name = "filestore"
        DisplayName = "Filestore"
        EntityFields = @(
            @{ Name = "fileId"; Type = "string"; Required = $true; Unique = $true },
            @{ Name = "fileName"; Type = "string"; Required = $true },
            @{ Name = "originalName"; Type = "string"; Required = $true },
            @{ Name = "fileSize"; Type = "number"; Required = $true },
            @{ Name = "mimeType"; Type = "string"; Required = $true },
            @{ Name = "filePath"; Type = "string"; Required = $true },
            @{ Name = "fileType"; Type = "string"; Required = $true; Enum = @("document", "image", "video", "audio", "other") },
            @{ Name = "status"; Type = "string"; Required = $true; Enum = @("uploading", "uploaded", "processing", "ready", "deleted") },
            @{ Name = "uploadedBy"; Type = "string"; Required = $true },
            @{ Name = "uploadedByName"; Type = "string"; Required = $false },
            @{ Name = "metadata"; Type = "object"; Required = $false }
        )
    }
)

foreach ($service in $services) {
    $serviceName = $service.Name
    $displayName = $service.DisplayName
    $servicePath = "services/$serviceName-service"
    
    Write-Host "Restructuring $displayName service..."
    
    # Create directories
    $directories = @(
        "src/$serviceName/dto",
        "src/$serviceName/entity"
    )
    
    foreach ($dir in $directories) {
        $fullPath = "$servicePath/$dir"
        if (!(Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        }
    }
    
    # Create controller
    $controllerContent = @"
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
import { ${displayName}Service } from './$serviceName.service';
import { Create${displayName}Dto } from './dto/create-$serviceName.dto';
import { PaginationQueryDto } from '@his/shared';

@Controller('$serviceName')
export class ${displayName}Controller {
  constructor(private readonly ${serviceName}Service: ${displayName}Service) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create${displayName}(@Body() create${displayName}Dto: Create${displayName}Dto, @Request() req: any) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    return await this.${serviceName}Service.create${displayName}(create${displayName}Dto, context);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get${displayName}ById(@Param('id') id: string) {
    return await this.${serviceName}Service.get${displayName}ById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async get${displayName}s(@Query() query: PaginationQueryDto) {
    return await this.${serviceName}Service.get${displayName}s(query);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update${displayName}(
    @Param('id') id: string,
    @Body() updateData: Partial<Create${displayName}Dto>,
    @Request() req: any
  ) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    return await this.${serviceName}Service.update${displayName}(id, updateData, context);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete${displayName}(@Param('id') id: string, @Request() req: any) {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    return await this.${serviceName}Service.delete${displayName}(id, context);
  }
}
"@
    
    Set-Content -Path "$servicePath/src/$serviceName/$serviceName.controller.ts" -Value $controllerContent
    
    # Create service
    $serviceContent = @"
import { Injectable, Logger } from '@nestjs/common';
import { $displayName } from './entity/$serviceName.entity';
import { Create${displayName}Dto } from './dto/create-$serviceName.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';
import { ${displayName}Repository } from './$serviceName.repository';

@Injectable()
export class ${displayName}Service {
  private readonly logger = new Logger(${displayName}Service.name);
  public broker: any;

  constructor(private readonly ${serviceName}Repository: ${displayName}Repository) {}

  async create${displayName}(create${displayName}Dto: Create${displayName}Dto, context: any): Promise<$displayName> {
    try {
      this.logger.log(`Creating new $serviceName: ${JSON.stringify(create${displayName}Dto)}`);
      const saved${displayName} = await this.${serviceName}Repository.create${displayName}(create${displayName}Dto, context);
      this.logger.log(`$displayName created successfully with ID: ${saved${displayName}._id}`);
      
      if (this.broker) {
        this.broker.emit('$serviceName.created', {
          ${serviceName}Id: saved${displayName}._id,
        });
      }
      return saved${displayName};
    } catch (error: any) {
      this.logger.error(`Error creating $serviceName: ${error.message}`, error.stack);
      throw error;
    }
  }

  async get${displayName}ById(id: string): Promise<$displayName | null> {
    try {
      this.logger.log(`Fetching $serviceName with ID: ${id}`);
      return await this.${serviceName}Repository.get${displayName}ById(id);
    } catch (error: any) {
      this.logger.error(`Error fetching $serviceName: ${error.message}`, error.stack);
      throw error;
    }
  }

  async get${displayName}s(query: PaginationQueryDto): Promise<PaginationResponseDto<$displayName>> {
    try {
      this.logger.log(`Fetching ${serviceName}s with query: ${JSON.stringify(query)}`);
      return await this.${serviceName}Repository.get${displayName}s(query);
    } catch (error) {
      this.logger.error(`Error fetching ${serviceName}s: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update${displayName}(
    id: string,
    updateData: Partial<Create${displayName}Dto>,
    context: any
  ): Promise<$displayName | null> {
    try {
      this.logger.log(`Updating $serviceName with ID: ${id}`);
      const updated${displayName} = await this.${serviceName}Repository.update${displayName}(id, updateData, context);
      
      if (updated${displayName}) {
        this.logger.log(`$displayName updated successfully with ID: ${id}`);
        if (this.broker) {
          this.broker.emit('$serviceName.updated', {
            ${serviceName}Id: id,
          });
        }
      }
      return updated${displayName};
    } catch (error: any) {
      this.logger.error(`Error updating $serviceName: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete${displayName}(id: string, context: any): Promise<boolean> {
    try {
      this.logger.log(`Deleting $serviceName with ID: ${id}`);
      const deleted = await this.${serviceName}Repository.delete${displayName}(id, context);
      
      if (deleted) {
        this.logger.log(`$displayName deleted successfully with ID: ${id}`);
        if (this.broker) {
          this.broker.emit('$serviceName.deleted', {
            ${serviceName}Id: id,
          });
        }
      }
      return deleted;
    } catch (error: any) {
      this.logger.error(`Error deleting $serviceName: ${error.message}`, error.stack);
      throw error;
    }
  }
}
"@
    
    Set-Content -Path "$servicePath/src/$serviceName/$serviceName.service.ts" -Value $serviceContent
    
    # Create repository
    $repositoryContent = @"
import { Injectable } from '@nestjs/common';
import { getModelForClass } from '@typegoose/typegoose';
import {
  BaseRepository,
  QueryBuilderOptions,
  PaginationQueryDto,
  PaginationResponseDto,
} from '@his/shared';
import { $displayName } from './entity/$serviceName.entity';

@Injectable()
export class ${displayName}Repository extends BaseRepository<$displayName> {
  constructor() {
    super(getModelForClass($displayName));
  }

  async create${displayName}(create${displayName}Dto: any, context: any): Promise<$displayName> {
    const ${serviceName}Data = {
      ...create${displayName}Dto,
      createdBy: context?.user?.id,
      createdByName: context?.user?.username || context?.user?.fullName,
      tenantId: context?.tenantId,
    };
    return this.create(${serviceName}Data);
  }

  async get${displayName}ById(id: string): Promise<$displayName | null> {
    return this.findById(id);
  }

  async get${displayName}s(query: PaginationQueryDto): Promise<PaginationResponseDto<$displayName>> {
    const options: QueryBuilderOptions = {
      search: 'id',
      filter: {},
      sort: { createdAt: -1 },
    };
    return this.findAll(query, options);
  }

  async update${displayName}(id: string, updateData: any, context: any): Promise<$displayName | null> {
    const updatePayload = {
      ...updateData,
      updatedBy: context?.user?.id,
      updatedByName: context?.user?.username || context?.user?.fullName,
    };
    return this.update(id, updatePayload);
  }

  async delete${displayName}(id: string, context: any): Promise<boolean> {
    return this.delete(id, context);
  }
}
"@
    
    Set-Content -Path "$servicePath/src/$serviceName/$serviceName.repository.ts" -Value $repositoryContent
    
    # Create module
    $moduleContent = @"
import { Module } from '@nestjs/common';
import { ${displayName}Controller } from './$serviceName.controller';
import { ${displayName}Service } from './$serviceName.service';
import { ${displayName}Repository } from './$serviceName.repository';

@Module({
  controllers: [${displayName}Controller],
  providers: [${displayName}Service, ${displayName}Repository],
  exports: [${displayName}Service, ${displayName}Repository],
})
export class ${displayName}Module {}
"@
    
    Set-Content -Path "$servicePath/src/$serviceName/$serviceName.module.ts" -Value $moduleContent
    
    # Create app module
    $appModuleContent = @"
import { Module } from '@nestjs/common';
import { ${displayName}Module } from './$serviceName/$serviceName.module';

@Module({
  imports: [${displayName}Module],
})
export class AppModule {}
"@
    
    Set-Content -Path "$servicePath/src/app.module.ts" -Value $appModuleContent
    
    Write-Host "$displayName service restructured successfully!"
}

Write-Host "All services have been restructured to follow domain-based architecture!"
