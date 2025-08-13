import { Model, FilterQuery, UpdateQuery } from 'mongoose';
import { Logger } from '@nestjs/common';
import { BaseEntity } from '../entities/base.entity';
import { PaginationQueryDto, PaginationResponseDto } from '../dto/pagination.dto';

export interface QueryBuilderOptions {
  search?: string;
  filter?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  populate?: string | string[];
}

export interface QueryOptions {
  populate?: string | string[];
  select?: string;
  lean?: boolean;
}

/**
 * Base repository class providing common database operations
 * with pagination, filtering, and error handling
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly model: Model<T>) {}

  /**
   * Find a document by its ID
   * @param id - Document ID
   * @param options - Query options
   * @returns Document or null if not found
   */
  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    try {
      let query = this.model.findById(id);

      if (options?.populate) {
        query = query.populate(options.populate as any);
      }

      if (options?.select) {
        query = query.select(options.select);
      }

      if (options?.lean) {
        query = query.lean();
      }

      const document = await query.exec();
      return document as T | null;
    } catch (error) {
      this.logger.error(`Error finding document by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find a document by ID or throw an error if not found
   * @param id - Document ID
   * @param options - Query options
   * @returns Document
   * @throws Error if document not found
   */
  async findByIdOrThrow(id: string, options?: QueryOptions): Promise<T> {
    const document = await this.findById(id, options);
    if (!document) {
      throw new Error(`Document with ID ${id} not found`);
    }
    return document;
  }

  /**
   * Find all documents with pagination and filtering
   * @param query - Pagination query parameters
   * @param options - Query builder options
   * @returns Paginated response
   */
  async findAll(
    query: PaginationQueryDto,
    options?: QueryBuilderOptions
  ): Promise<PaginationResponseDto<T>> {
    try {
      const filter = this.buildFilterQuery(query, options);
      const sort = this.buildSortQuery(query, options);

      const page = query.page || 1;
      const pageSize = query.pageSize || 10;
      const skip = (page - 1) * pageSize;
      const limit = pageSize;

      let dbQuery = this.model.find(filter);

      if (options?.populate) {
        dbQuery = dbQuery.populate(options.populate as any);
      }

      const [data, total] = await Promise.all([
        dbQuery.sort(sort).skip(skip).limit(limit).exec(),
        this.model.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / pageSize);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      };
    } catch (error) {
      this.logger.error('Error finding all documents:', error);
      throw error;
    }
  }

  /**
   * Find one document by filter
   * @param filter - MongoDB filter query
   * @param options - Query options
   * @returns Document or null
   */
  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    try {
      let query = this.model.findOne(filter);

      if (options?.populate) {
        query = query.populate(options.populate as any);
      }

      if (options?.select) {
        query = query.select(options.select);
      }

      if (options?.lean) {
        query = query.lean();
      }

      const document = await query.exec();
      return document;
    } catch (error) {
      this.logger.error('Error finding one document:', error);
      throw error;
    }
  }

  /**
   * Create a new document
   * @param data - Document data
   * @returns Created document
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const document = new this.model(data);
      const savedDocument = await document.save();
      this.logger.log(`Created document with ID: ${savedDocument._id}`);
      return savedDocument;
    } catch (error) {
      this.logger.error('Error creating document:', error);
      throw error;
    }
  }

  /**
   * Update an existing document
   * @param id - Document ID
   * @param data - Update data
   * @param options - Query options
   * @returns Updated document or null
   */
  async update(
    id: string,
    data: UpdateQuery<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      let query = this.model.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (options?.populate) {
        query = query.populate(options.populate as any);
      }

      if (options?.select) {
        query = query.select(options.select);
      }

      const updatedDocument = await query.exec();
      
      if (updatedDocument) {
        this.logger.log(`Updated document with ID: ${id}`);
      } else {
        this.logger.warn(`Document with ID ${id} not found for update`);
      }

      return updatedDocument;
    } catch (error) {
      this.logger.error(`Error updating document with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing document or throw an error if not found
   * @param id - Document ID
   * @param data - Update data
   * @param options - Query options
   * @returns Updated document
   * @throws Error if document not found
   */
  async updateOrThrow(
    id: string,
    data: UpdateQuery<T>,
    options?: QueryOptions
  ): Promise<T> {
    const updatedDocument = await this.update(id, data, options);
    if (!updatedDocument) {
      throw new Error(`Document with ID ${id} not found for update`);
    }
    return updatedDocument;
  }

  /**
   * Soft delete a document (set active: false)
   * @param id - Document ID
   * @param context - Request context for audit trail
   * @returns Success status
   */
  async delete(id: string, context?: any): Promise<boolean> {
    try {
      const updateData: any = {
        active: false,
        updatedAt: new Date(),
      };

      if (context?.user?.id) {
        updateData.updatedBy = context.user.id;
        updateData.updatedByName = context.user.username || context.user.fullName;
      }

      const result = await this.model.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (result) {
        this.logger.log(`Soft deleted document with ID: ${id}`);
        return true;
      } else {
        this.logger.warn(`Document with ID ${id} not found for deletion`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error deleting document with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Hard delete a document (permanently remove)
   * @param id - Document ID
   * @returns Success status
   */
  async hardDelete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id);
      
      if (result) {
        this.logger.log(`Hard deleted document with ID: ${id}`);
        return true;
      } else {
        this.logger.warn(`Document with ID ${id} not found for hard deletion`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error hard deleting document with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Count documents matching a filter
   * @param filter - MongoDB filter query
   * @returns Count of documents
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      const count = await this.model.countDocuments(filter);
      return count;
    } catch (error) {
      this.logger.error('Error counting documents:', error);
      throw error;
    }
  }

  /**
   * Check if a document exists
   * @param filter - MongoDB filter query
   * @returns True if document exists
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const count = await this.model.countDocuments(filter);
      return count > 0;
    } catch (error) {
      this.logger.error('Error checking document existence:', error);
      throw error;
    }
  }

  /**
   * Build filter query from pagination query and options
   * @param query - Pagination query
   * @param options - Query builder options
   * @returns MongoDB filter query
   */
  protected buildFilterQuery(
    query: PaginationQueryDto,
    options?: QueryBuilderOptions
  ): any {
    const filter: any = { active: { $ne: false } };

    // Add search functionality
    if (query.search && options?.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter[options.search] = searchRegex;
    }

    // Add custom filters
    if (options?.filter) {
      Object.assign(filter, options.filter);
    }

    return filter;
  }

  /**
   * Build sort query from pagination query and options
   * @param query - Pagination query
   * @param options - Query builder options
   * @returns MongoDB sort object
   */
  protected buildSortQuery(
    query: PaginationQueryDto,
    options?: QueryBuilderOptions
  ): Record<string, 1 | -1> {
    if (options?.sort) {
      return options.sort;
    }

    if (query.sort) {
      const [field, order] = query.sort.split(':');
      return { [field]: order === 'desc' ? -1 : 1 };
    }

    return { createdAt: -1 };
  }
}
