import { Injectable } from '@nestjs/common';
import { getModelForClass } from '@typegoose/typegoose';
import { BaseRepository } from '@his/shared';
import { User, UserRole, UserStatus } from './entity/user.entity';
import { RegisterDto, UpdateUserDto } from './dto/auth.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor() {
    const userModel = getModelForClass(User);
    super(userModel);
  }

  /**
   * Find a user by username
   * @param username - The username to search for
   * @returns Promise<User | null> - The found user or null
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      this.logger.debug(`Finding user by username: ${username}`);
      
      return await this.findOne({
        username,
        active: true,
      });
    } catch (error) {
      this.logger.error(`Error finding user by username: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find a user by email
   * @param email - The email to search for
   * @returns Promise<User | null> - The found user or null
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      this.logger.debug(`Finding user by email: ${email}`);
      
      return await this.findOne({
        email,
        active: true,
      });
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find a user by employee ID
   * @param employeeId - The employee ID to search for
   * @returns Promise<User | null> - The found user or null
   */
  async findByEmployeeId(employeeId: string): Promise<User | null> {
    try {
      this.logger.debug(`Finding user by employee ID: ${employeeId}`);
      
      return await this.findOne({
        employeeId,
        active: true,
      });
    } catch (error) {
      this.logger.error(`Error finding user by employee ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find users by role
   * @param role - The role to filter by
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<User>> - Paginated results
   */
  async findByRole(role: UserRole, query: PaginationQueryDto): Promise<PaginationResponseDto<User>> {
    try {
      this.logger.debug(`Finding users by role: ${role}`);
      
      const filter = { role, active: true };
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding users by role: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find users by status
   * @param status - The status to filter by
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<User>> - Paginated results
   */
  async findByStatus(status: UserStatus, query: PaginationQueryDto): Promise<PaginationResponseDto<User>> {
    try {
      this.logger.debug(`Finding users by status: ${status}`);
      
      const filter = { status, active: true };
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error finding users by status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Search users by name
   * @param name - The name to search for
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<User>> - Paginated results
   */
  async searchByName(name: string, query: PaginationQueryDto): Promise<PaginationResponseDto<User>> {
    try {
      this.logger.debug(`Searching users by name: ${name}`);
      
      const filter = {
        $or: [
          { firstName: { $regex: name, $options: 'i' } },
          { lastName: { $regex: name, $options: 'i' } },
        ],
        active: true,
      };
      
      return await this.findAll(query, { filter });
    } catch (error) {
      this.logger.error(`Error searching users by name: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new user with duplicate checking
   * @param registerDto - The user registration data
   * @param context - The request context
   * @returns Promise<User> - The created user
   */
  async createUser(registerDto: RegisterDto, context: any): Promise<User> {
    try {
      this.logger.debug(`Creating new user with username: ${registerDto.username}`);

      // Check for duplicate username
      const existingUsername = await this.findByUsername(registerDto.username);
      if (existingUsername) {
        throw new Error(`User with username ${registerDto.username} already exists`);
      }

      // Check for duplicate email
      const existingEmail = await this.findByEmail(registerDto.email);
      if (existingEmail) {
        throw new Error(`User with email ${registerDto.email} already exists`);
      }

      // Check for duplicate employee ID if provided
      if (registerDto.employeeId) {
        const existingEmployeeId = await this.findByEmployeeId(registerDto.employeeId);
        if (existingEmployeeId) {
          throw new Error(`User with employee ID ${registerDto.employeeId} already exists`);
        }
      }

      // Prepare user data with audit information
      const userData = {
        ...registerDto,
        createdBy: context?.user?.id || 'system',
        createdByName: context?.user?.name || 'System',
        tenantId: context?.tenantId,
        sourceSystem: 'his-v2',
        status: UserStatus.ACTIVE,
        permissions: [],
        loginAttempts: 0,
        refreshTokens: [],
      };

      return await this.create(userData);
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update a user with audit trail
   * @param id - The user ID
   * @param updateData - The update data
   * @param context - The request context
   * @returns Promise<User | null> - The updated user or null
   */
  async updateUser(
    id: string,
    updateData: UpdateUserDto,
    context: any
  ): Promise<User | null> {
    try {
      this.logger.debug(`Updating user with ID: ${id}`);

      const updatePayload = {
        ...updateData,
        updatedBy: context?.user?.id || 'system',
        updatedByName: context?.user?.name || 'System',
        updatedAt: new Date(),
      };

      return await this.update(id, updatePayload);
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update user's last login time
   * @param id - The user ID
   * @returns Promise<User | null> - The updated user or null
   */
  async updateLastLogin(id: string): Promise<User | null> {
    try {
      this.logger.debug(`Updating last login for user ID: ${id}`);
      
      return await this.update(id, {
        lastLoginAt: new Date(),
        loginAttempts: 0,
        lockedUntil: null,
      });
    } catch (error) {
      this.logger.error(`Error updating last login: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Increment login attempts and lock account if necessary
   * @param id - The user ID
   * @param maxAttempts - Maximum login attempts before lock
   * @param lockDuration - Lock duration in minutes
   * @returns Promise<User | null> - The updated user or null
   */
  async incrementLoginAttempts(
    id: string,
    maxAttempts: number = 5,
    lockDuration: number = 30
  ): Promise<User | null> {
    try {
      this.logger.debug(`Incrementing login attempts for user ID: ${id}`);
      
      const user = await this.findById(id);
      if (!user) {
        return null;
      }

      const newAttempts = user.loginAttempts + 1;
      const updateData: any = { loginAttempts: newAttempts };

      // Lock account if max attempts reached
      if (newAttempts >= maxAttempts) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + lockDuration);
        updateData.lockedUntil = lockUntil;
        updateData.status = UserStatus.SUSPENDED;
      }

      return await this.update(id, updateData);
    } catch (error) {
      this.logger.error(`Error incrementing login attempts: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Add refresh token to user
   * @param id - The user ID
   * @param refreshToken - The refresh token to add
   * @returns Promise<User | null> - The updated user or null
   */
  async addRefreshToken(id: string, refreshToken: string): Promise<User | null> {
    try {
      this.logger.debug(`Adding refresh token for user ID: ${id}`);
      
      const user = await this.findById(id);
      if (!user) {
        return null;
      }

      const refreshTokens = [...user.refreshTokens, refreshToken];
      return await this.update(id, { refreshTokens });
    } catch (error) {
      this.logger.error(`Error adding refresh token: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Remove refresh token from user
   * @param id - The user ID
   * @param refreshToken - The refresh token to remove
   * @returns Promise<User | null> - The updated user or null
   */
  async removeRefreshToken(id: string, refreshToken: string): Promise<User | null> {
    try {
      this.logger.debug(`Removing refresh token for user ID: ${id}`);
      
      const user = await this.findById(id);
      if (!user) {
        return null;
      }

      const refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      return await this.update(id, { refreshTokens });
    } catch (error) {
      this.logger.error(`Error removing refresh token: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get users with advanced filtering
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<User>> - Paginated results
   */
  async getUsers(query: PaginationQueryDto): Promise<PaginationResponseDto<User>> {
    try {
      this.logger.debug(`Getting users with query: ${JSON.stringify(query)}`);
      return await this.findAll(query);
    } catch (error) {
      this.logger.error(`Error getting users: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user by ID with proper error handling
   * @param id - The user ID
   * @returns Promise<User | null> - The user or null
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      this.logger.debug(`Getting user by ID: ${id}`);
      return await this.findById(id);
    } catch (error) {
      this.logger.error(`Error getting user by ID: ${error.message}`, error.stack);
      throw error;
    }
  }
}
