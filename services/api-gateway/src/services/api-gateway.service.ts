import { Injectable, Logger } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class ApiGatewayService {
  private readonly logger = new Logger(ApiGatewayService.name);

  /**
   * Authenticates the request using JWT token
   *
   * @param ctx - Moleculer context
   * @param route - Route information
   * @param req - Express request object
   * @param res - Express response object
   * @returns Promise<boolean> - True if authenticated
   */
  async authenticate(ctx: any, route: any, req: any, res: any): Promise<boolean> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.logger.warn('No Bearer token provided');
        return false;
      }

      const token = authHeader.substring(7);
      const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

      const decoded = jwt.verify(token, secret) as any;

      // Set user information in context
      ctx.meta.user = {
        id: decoded.sub,
        email: decoded.email,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
      };

      this.logger.log(`User authenticated: ${decoded.email}`);
      return true;
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Authorizes the request based on user permissions
   *
   * @param ctx - Moleculer context
   * @param route - Route information
   * @param req - Express request object
   * @param res - Express response object
   * @returns Promise<boolean> - True if authorized
   */
  async authorize(ctx: any, route: any, req: any, res: any): Promise<boolean> {
    try {
      const user = ctx.meta.user;

      if (!user) {
        this.logger.warn('No user context found for authorization');
        return false;
      }

      // Check if user has required permissions
      const action = ctx.action?.name;
      const requiredPermission = this.getRequiredPermission(action);

      if (requiredPermission && !user.permissions.includes(requiredPermission)) {
        this.logger.warn(`User ${user.email} lacks permission: ${requiredPermission}`);
        return false;
      }

      this.logger.log(`User ${user.email} authorized for action: ${action}`);
      return true;
    } catch (error) {
      this.logger.error(`Authorization failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Maps action names to required permissions
   *
   * @param action - Action name
   * @returns string | null - Required permission or null
   */
  private getRequiredPermission(action: string): string | null {
    const permissionMap: Record<string, string> = {
      'patient.create': 'patient:write',
      'patient.update': 'patient:write',
      'patient.delete': 'patient:write',
      'patient.getById': 'patient:read',
      'patient.list': 'patient:read',
      'auth.login': 'auth:login',
      'auth.logout': 'auth:logout',
      'encounter.create': 'encounter:write',
      'encounter.update': 'encounter:write',
      'encounter.delete': 'encounter:write',
      'encounter.getById': 'encounter:read',
      'encounter.list': 'encounter:read',
      'order.create': 'order:write',
      'order.update': 'order:write',
      'order.delete': 'order:write',
      'order.getById': 'order:read',
      'order.list': 'order:read',
    };

    return permissionMap[action] || null;
  }

  /**
   * Handles errors in the API Gateway
   *
   * @param err - Error object
   * @param req - Express request object
   * @param res - Express response object
   */
  onError(err: any, req: any, res: any): void {
    this.logger.error(`API Gateway error: ${err.message}`, err.stack);

    res.setHeader('Content-Type', 'application/json');
    res.writeHead(err.code || 500);
    res.end(
      JSON.stringify({
        error: {
          message: err.message,
          code: err.code || 500,
        },
      })
    );
  }
}
