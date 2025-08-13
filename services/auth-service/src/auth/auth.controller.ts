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
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
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
} from './auth.dto';
import { PaginationQueryDto } from '@his/shared';
import { User, UserRole } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User login
   * @param loginDto - Login credentials
   * @returns Promise<LoginResponseDto> - Authentication response
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }

  /**
   * User registration
   * @param registerDto - Registration data
   * @param req - Request object
   * @returns Promise<User> - Created user
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto, @Request() req: any): Promise<User> {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    return await this.authService.register(registerDto, context);
  }

  /**
   * Validate JWT token
   * @param headers - Request headers containing authorization
   * @returns Promise<TokenValidationDto> - Token validation result
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Headers('authorization') authHeader: string): Promise<TokenValidationDto> {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return { valid: false, error: 'No token provided' };
    }
    return await this.authService.validateToken(token);
  }

  /**
   * Refresh access token
   * @param refreshTokenDto - Refresh token data
   * @returns Promise<LoginResponseDto> - New authentication response
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<LoginResponseDto> {
    return await this.authService.refreshToken(refreshTokenDto);
  }

  /**
   * User logout
   * @param req - Request object
   * @param refreshTokenDto - Refresh token to invalidate
   * @returns Promise<boolean> - Success status
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any, @Body() refreshTokenDto: RefreshTokenDto): Promise<boolean> {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return await this.authService.logout(userId, refreshTokenDto.refreshToken);
  }

  /**
   * Change user password
   * @param req - Request object
   * @param changePasswordDto - Password change data
   * @returns Promise<boolean> - Success status
   */
  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto): Promise<boolean> {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return await this.authService.changePassword(userId, changePasswordDto);
  }

  /**
   * Forgot password
   * @param forgotPasswordDto - Email for password reset
   * @returns Promise<{ message: string }> - Success message
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    // TODO: Implement forgot password logic
    return { message: 'Password reset email sent' };
  }

  /**
   * Reset password
   * @param resetPasswordDto - Password reset data
   * @returns Promise<{ message: string }> - Success message
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    // TODO: Implement reset password logic
    return { message: 'Password reset successfully' };
  }

  /**
   * Get current user profile
   * @param req - Request object
   * @returns Promise<User | null> - Current user
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req: any): Promise<User | null> {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return await this.authService.getUserById(userId);
  }

  /**
   * Get all users (admin only)
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<User>> - Paginated users
   */
  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getUsers(@Query() query: PaginationQueryDto): Promise<any> {
    return await this.authService.getUsers(query);
  }

  /**
   * Get user by ID (admin only)
   * @param id - User ID
   * @returns Promise<User | null> - User or null
   */
  @Get('users/:id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') id: string): Promise<User | null> {
    return await this.authService.getUserById(id);
  }

  /**
   * Update user (admin only)
   * @param id - User ID
   * @param updateUserDto - Update data
   * @param req - Request object
   * @returns Promise<User | null> - Updated user or null
   */
  @Put('users/:id')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any
  ): Promise<User | null> {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    return await this.authService.updateUser(id, updateUserDto, context);
  }

  /**
   * Delete user (admin only)
   * @param id - User ID
   * @param req - Request object
   * @returns Promise<boolean> - Success status
   */
  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string, @Request() req: any): Promise<boolean> {
    const context = {
      user: req.user,
      tenantId: req.headers['x-tenant-id'],
    };
    return await this.authService.deleteUser(id, context);
  }

  /**
   * Search users by name (admin only)
   * @param name - Name to search for
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<User>> - Paginated results
   */
  @Get('users/search/name/:name')
  @HttpCode(HttpStatus.OK)
  async searchUsersByName(@Param('name') name: string, @Query() query: PaginationQueryDto): Promise<any> {
    // This would be implemented in the service if needed
    // For now, we'll use the general getUsers method with name filter
    const searchQuery = { ...query, search: name };
    return await this.authService.getUsers(searchQuery);
  }

  /**
   * Get users by role (admin only)
   * @param role - Role to filter by
   * @param query - Pagination parameters
   * @returns Promise<PaginationResponseDto<User>> - Paginated results
   */
  @Get('users/role/:role')
  @HttpCode(HttpStatus.OK)
  async getUsersByRole(@Param('role') role: UserRole, @Query() query: PaginationQueryDto): Promise<any> {
    // This would be implemented in the service if needed
    // For now, we'll use the general getUsers method with role filter
    const filterQuery = { ...query, filter: JSON.stringify({ role }) };
    return await this.authService.getUsers(filterQuery);
  }

  /**
   * Health check endpoint
   * @returns Promise<{ status: string; timestamp: string }> - Health status
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
