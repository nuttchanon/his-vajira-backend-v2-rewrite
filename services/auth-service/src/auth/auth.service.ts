import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from './entity/user.entity';
import { UserRepository } from './user.repository';
import {
  LoginDto,
  RegisterDto,
  UpdateUserDto,
  ChangePasswordDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  LoginResponseDto,
  TokenValidationDto,
} from './dto/auth.dto';
import { PaginationQueryDto, PaginationResponseDto } from '@his/shared';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  public broker: any; // Will be set by the Moleculer service

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Authenticate user and generate tokens
   * @param loginDto - Login credentials
   * @returns Promise<LoginResponseDto> - Authentication response with tokens
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      this.logger.log(`Login attempt for username: ${loginDto.username}`);

      // Find user by username
      const user = await this.userRepository.findByUsername(loginDto.username);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if account is locked
      if (user.isLocked) {
        throw new UnauthorizedException('Account is temporarily locked');
      }

      // Check if account is active
      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Account is not active');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        // Increment login attempts
        await this.userRepository.incrementLoginAttempts(user._id);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if password is expired
      if (user.isPasswordExpired) {
        throw new UnauthorizedException('Password has expired. Please reset your password');
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Update last login and reset login attempts
      await this.userRepository.updateLastLogin(user._id);

      // Add refresh token to user
      await this.userRepository.addRefreshToken(user._id, refreshToken);

      this.logger.log(`User ${user.username} logged in successfully`);

      // Emit event for other services
      if (this.broker) {
        this.broker.emit('user.logged_in', {
          userId: user._id,
          username: user.username,
          role: user.role,
        });
      }

      return {
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hour
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          permissions: user.permissions,
        },
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Register a new user
   * @param registerDto - User registration data
   * @param context - Request context
   * @returns Promise<User> - The created user
   */
  async register(registerDto: RegisterDto, context: any): Promise<User> {
    try {
      this.logger.log(`Registration attempt for username: ${registerDto.username}`);

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 12);

      // Create user with hashed password
      const userData = { ...registerDto, password: hashedPassword };
      const user = await this.userRepository.createUser(userData, context);

      this.logger.log(`User ${user.username} registered successfully`);

      // Emit event for other services
      if (this.broker) {
        this.broker.emit('user.registered', {
          userId: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        });
      }

      return user;
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Validate JWT token
   * @param token - JWT token to validate
   * @returns Promise<TokenValidationDto> - Token validation result
   */
  async validateToken(token: string): Promise<TokenValidationDto> {
    try {
      this.logger.debug('Validating JWT token');

      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.getUserById(payload.sub);

      if (!user || user.status !== UserStatus.ACTIVE || !user.active) {
        return {
          valid: false,
          error: 'User not found or inactive',
        };
      }

      return {
        valid: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
      };
    } catch (error) {
      this.logger.error(`Token validation error: ${error.message}`, error.stack);
      return {
        valid: false,
        error: 'Invalid token',
      };
    }
  }

  /**
   * Refresh access token using refresh token
   * @param refreshTokenDto - Refresh token data
   * @returns Promise<LoginResponseDto> - New authentication response
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<LoginResponseDto> {
    try {
      this.logger.debug('Refreshing access token');

      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);
      const user = await this.userRepository.getUserById(payload.sub);

      if (!user || user.status !== UserStatus.ACTIVE || !user.active) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token is in user's refresh tokens
      if (!user.refreshTokens.includes(refreshTokenDto.refreshToken)) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Update refresh tokens
      await this.userRepository.removeRefreshToken(user._id, refreshTokenDto.refreshToken);
      await this.userRepository.addRefreshToken(user._id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          permissions: user.permissions,
        },
      };
    } catch (error) {
      this.logger.error(`Token refresh error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Logout user by invalidating refresh token
   * @param userId - User ID
   * @param refreshToken - Refresh token to invalidate
   * @returns Promise<boolean> - Success status
   */
  async logout(userId: string, refreshToken: string): Promise<boolean> {
    try {
      this.logger.log(`Logout for user ID: ${userId}`);

      await this.userRepository.removeRefreshToken(userId, refreshToken);

      // Emit event for other services
      if (this.broker) {
        this.broker.emit('user.logged_out', {
          userId,
        });
      }

      return true;
    } catch (error) {
      this.logger.error(`Logout error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Change user password
   * @param userId - User ID
   * @param changePasswordDto - Password change data
   * @returns Promise<boolean> - Success status
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<boolean> {
    try {
      this.logger.log(`Password change for user ID: ${userId}`);

      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);

      // Update password
      await this.userRepository.update(userId, {
        password: hashedNewPassword,
        passwordChangedAt: new Date(),
      });

      // Clear all refresh tokens to force re-login
      await this.userRepository.update(userId, { refreshTokens: [] });

      this.logger.log(`Password changed successfully for user ID: ${userId}`);

      return true;
    } catch (error) {
      this.logger.error(`Password change error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get users with pagination and filtering
   * @param query - Pagination and filter parameters
   * @returns Promise<PaginationResponseDto<User>> - Paginated user results
   */
  async getUsers(query: PaginationQueryDto): Promise<PaginationResponseDto<User>> {
    try {
      this.logger.debug(`Getting users with query: ${JSON.stringify(query)}`);
      return await this.userRepository.getUsers(query);
    } catch (error) {
      this.logger.error(`Error getting users: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param id - User ID
   * @returns Promise<User | null> - The user or null
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      this.logger.debug(`Getting user by ID: ${id}`);
      return await this.userRepository.getUserById(id);
    } catch (error) {
      this.logger.error(`Error getting user by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update user
   * @param id - User ID
   * @param updateUserDto - Update data
   * @param context - Request context
   * @returns Promise<User | null> - The updated user or null
   */
  async updateUser(id: string, updateUserDto: UpdateUserDto, context: any): Promise<User | null> {
    try {
      this.logger.log(`Updating user with ID: ${id}`);
      return await this.userRepository.updateUser(id, updateUserDto, context);
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   * @param id - User ID
   * @param context - Request context
   * @returns Promise<boolean> - Success status
   */
  async deleteUser(id: string, context: any): Promise<boolean> {
    try {
      this.logger.log(`Deleting user with ID: ${id}`);
      return await this.userRepository.deleteUser(id, context);
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate JWT access token
   * @param user - User entity
   * @returns string - JWT access token
   */
  private generateAccessToken(user: User): string {
    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: '1h',
    });
  }

  /**
   * Generate JWT refresh token
   * @param user - User entity
   * @returns string - JWT refresh token
   */
  private generateRefreshToken(user: User): string {
    const payload = {
      sub: user._id,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      expiresIn: '7d',
    });
  }
}
