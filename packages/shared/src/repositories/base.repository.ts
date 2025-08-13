import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { BaseEntity } from '../entities/base.entity';
import { PaginationQueryDto, PaginationResponseDto } from '../dto/pagination.dto';

export interface QueryBuilderOptions {
  search?: string;
  filter?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  populate?: string | string[];
}

@Injectable()
export abstract class BaseRepository<T extends BaseEntity> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly model: Model<T>) {}

  /**
   * Find a document by its ID
   * @param id - The document ID
   * @param options - Query options
   * @returns Promise<T | null> - The found document or null
   */
  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    try {
      this.logger.debug(`Finding document by ID: ${id}`);

      const query = this.model.findById(id, null, options);

      if (options?.populate) {
        query.populate(options.populate);
      }

      const document = await query.exec();

      if (!document) {
        this.logger.warn(`Document not found with ID: ${id}`);
        return null;
      }

      return document;
    } catch (error) {
      this.logger.error(`Error finding document by ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find a document by its ID or throw NotFoundException
   * @param id - The document ID
   * @param options - Query options
   * @returns Promise<T> - The found document
   * @throws NotFoundException - When document is not found
   */
  async findByIdOrThrow(id: string, options?: QueryOptions): Promise<T> {
    const document = await this.findById(id, options);
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  /**
   * Find all documents with pagination and filtering
   * @param query - Pagination and filter parameters
   * @param options - Additional query options
   * @returns Promise<PaginationResponseDto<T>> - Paginated results
   */
  async findAll(
    query: PaginationQueryDto,
    options?: QueryBuilderOptions
  ): Promise<PaginationResponseDto<T>> {
    try {
      this.logger.debug(`Finding all documents with query: ${JSON.stringify(query)}`);

      const { page = 1, pageSize = 10 } = query;
      const skip = (page - 1) * pageSize;

      // Build filter query
      const filterQuery = this.buildFilterQuery(query, options);

      // Build sort query
      const sortQuery = this.buildSortQuery(query, options);

      // Execute query with pagination
      const [documents, total] = await Promise.all([
        this.model
          .find(filterQuery)
          .sort(sortQuery)
          .skip(skip)
          .limit(pageSize)
          .populate(options?.populate || [])
          .exec(),
        this.model.countDocuments(filterQuery),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        data: documents,
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
      this.logger.error(`Error finding all documents: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find one document by filter criteria
   * @param filter - Filter criteria
   * @param options - Query options
   * @returns Promise<T | null> - The found document or null
   */
  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    try {
      this.logger.debug(`Finding one document with filter: ${JSON.stringify(filter)}`);

      const query = this.model.findOne(filter, null, options);

      if (options?.populate) {
        query.populate(options.populate);
      }

      return await query.exec();
    } catch (error) {
      this.logger.error(`Error finding one document: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new document
   * @param data - The document data
   * @returns Promise<T> - The created document
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      this.logger.debug(`Creating new document with data: ${JSON.stringify(data)}`);

      const document = new this.model(data);
      const savedDocument = await document.save();

      this.logger.debug(`Document created successfully with ID: ${savedDocument._id}`);

      return savedDocument;
    } catch (error) {
      this.logger.error(`Error creating document: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update an existing document
   * @param id - The document ID
   * @param data - The update data
   * @param options - Update options
   * @returns Promise<T | null> - The updated document or null if not found
   */
  async update(id: string, data: UpdateQuery<T>, options?: QueryOptions): Promise<T | null> {
    try {
      this.logger.debug(`Updating document with ID: ${id}`);

      const updatedDocument = await this.model
        .findByIdAndUpdate(id, data, {
          new: true,
          runValidators: true,
          ...options,
        })
        .populate(options?.populate || [])
        .exec();

      if (!updatedDocument) {
        this.logger.warn(`Document not found for update with ID: ${id}`);
        return null;
      }

      this.logger.debug(`Document updated successfully with ID: ${id}`);
      return updatedDocument;
    } catch (error) {
      this.logger.error(`Error updating document: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update an existing document or throw NotFoundException
   * @param id - The document ID
   * @param data - The update data
   * @param options - Update options
   * @returns Promise<T> - The updated document
   * @throws NotFoundException - When document is not found
   */
  async updateOrThrow(id: string, data: UpdateQuery<T>, options?: QueryOptions): Promise<T> {
    const updatedDocument = await this.update(id, data, options);
    if (!updatedDocument) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return updatedDocument;
  }

  /**
   * Soft delete a document (set active: false)
   * @param id - The document ID
   * @param context - The request context for audit trail
   * @returns Promise<boolean> - True if deleted successfully
   */
  async delete(id: string, context?: any): Promise<boolean> {
    try {
      this.logger.debug(`Soft deleting document with ID: ${id}`);

      const updateData: UpdateQuery<T> = {
        active: false,
        updatedAt: new Date(),
      };

      // Add audit trail if context is provided
      if (context?.user?.id) {
        updateData.updatedBy = context.user.id;
        updateData.updatedByName = context.user.name || 'Unknown';
      }

      const deletedDocument = await this.model
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();

      if (!deletedDocument) {
        this.logger.warn(`Document not found for deletion with ID: ${id}`);
        return false;
      }

      this.logger.debug(`Document soft deleted successfully with ID: ${id}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting document: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Hard delete a document (permanently remove)
   * @param id - The document ID
   * @returns Promise<boolean> - True if deleted successfully
   */
  async hardDelete(id: string): Promise<boolean> {
    try {
      this.logger.debug(`Hard deleting document with ID: ${id}`);

      const deletedDocument = await this.model.findByIdAndDelete(id).exec();

      if (!deletedDocument) {
        this.logger.warn(`Document not found for hard deletion with ID: ${id}`);
        return false;
      }

      this.logger.debug(`Document hard deleted successfully with ID: ${id}`);
      return true;
    } catch (error) {
      this.logger.error(`Error hard deleting document: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Count documents by filter criteria
   * @param filter - Filter criteria
   * @returns Promise<number> - The count of documents
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      this.logger.debug(`Counting documents with filter: ${JSON.stringify(filter)}`);
      return await this.model.countDocuments(filter).exec();
    } catch (error) {
      this.logger.error(`Error counting documents: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check if a document exists by filter criteria
   * @param filter - Filter criteria
   * @returns Promise<boolean> - True if document exists
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      this.logger.debug(`Checking if document exists with filter: ${JSON.stringify(filter)}`);
      const count = await this.model.countDocuments(filter).exec();
      return count > 0;
    } catch (error) {
      this.logger.error(`Error checking document existence: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Build filter query from pagination query and options
   * @param query - Pagination query
   * @param options - Query builder options
   * @returns FilterQuery<T> - The built filter query
   */
  protected buildFilterQuery(
    query: PaginationQueryDto,
    options?: QueryBuilderOptions
  ): FilterQuery<T> {
    const filterQuery: FilterQuery<T> = { active: true };

    // Add search functionality if text index exists
    if (query.search) {
      filterQuery.$text = { $search: query.search };
    }

    // Add custom filter from options
    if (options?.filter) {
      Object.assign(filterQuery, options.filter);
    }

    // Add filter from query string (JSON parsed)
    if (query.filter) {
      try {
        const parsedFilter = JSON.parse(query.filter);
        Object.assign(filterQuery, parsedFilter);
      } catch (error) {
        this.logger.warn(`Invalid filter JSON: ${query.filter}`);
      }
    }

    return filterQuery;
  }

  /**
   * Build sort query from pagination query and options
   * @param query - Pagination query
   * @param options - Query builder options
   * @returns Record<string, 1 | -1> - The built sort query
   */
  protected buildSortQuery(
    query: PaginationQueryDto,
    options?: QueryBuilderOptions
  ): Record<string, 1 | -1> {
    // Default sort by creation date descending
    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };

    // Add custom sort from options
    if (options?.sort) {
      sortQuery = { ...sortQuery, ...options.sort };
    }

    // Add sort from query string
    if (query.sort) {
      try {
        const sortFields = query.sort.split(',');
        const parsedSort: Record<string, 1 | -1> = {};

        for (const field of sortFields) {
          const [key, order] = field.split(':');
          parsedSort[key.trim()] = order === 'desc' ? -1 : 1;
        }

        sortQuery = { ...sortQuery, ...parsedSort };
      } catch (error) {
        this.logger.warn(`Invalid sort format: ${query.sort}`);
      }
    }

    return sortQuery;
  }
}
