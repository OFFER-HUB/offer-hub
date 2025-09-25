import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, DatabaseError, BusinessLogicError, AuthenticationError, AuthorizationError } from '@/utils/AppError';
import { ErrorCodes, ErrorSeverity, ErrorContext, ErrorLogEntry } from '@/types/errors.types';

// Enhanced error handler middleware
export class ErrorHandlerMiddleware {
  private static instance: ErrorHandlerMiddleware;

  private constructor() {}

  public static getInstance(): ErrorHandlerMiddleware {
    if (!ErrorHandlerMiddleware.instance) {
      ErrorHandlerMiddleware.instance = new ErrorHandlerMiddleware();
    }
    return ErrorHandlerMiddleware.instance;
  }

  // Main error handling method
  public handle(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    let statusCode = 500;
    let message = 'Internal server error';
    let errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
    let details: any = undefined;
    let severity = ErrorSeverity.HIGH;

    // Determine error type and set appropriate values
    if (error instanceof AppError) {
      statusCode = error.statusCode;
      message = error.message;
      errorCode = error.errorCode as ErrorCodes;
      details = error.details;
      severity = this.getSeverityFromErrorCode(errorCode);
    } else if (error instanceof Error) {
      message = error.message;
      errorCode = ErrorCodes.UNKNOWN_ERROR;
      severity = ErrorSeverity.MEDIUM;
    } else if (typeof error === 'string') {
      message = error;
      errorCode = ErrorCodes.STRING_ERROR;
      severity = ErrorSeverity.LOW;
    } else {
      errorCode = ErrorCodes.UNKNOWN_ERROR_TYPE;
      details = error;
      severity = ErrorSeverity.HIGH;
    }

    // Build error context for logging
    const errorContext: ErrorContext = {
      userId: (req as any).user?.id,
      requestId: req.headers['x-request-id'] as string,
      sessionId: (req as any).session?.id,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      endpoint: req.url,
      method: req.method,
      params: req.params,
      query: req.query,
      body: req.body
    };

    // Log error for debugging and monitoring
    this.logError({
      message,
      errorCode,
      statusCode,
      severity,
      context: errorContext,
      details,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    }, req);

    // Build consistent error response
    const errorResponse = {
      success: false,
      error: {
        type: errorCode,
        message,
        details,
        code: errorCode,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
          url: req.url,
          method: req.method,
          context: errorContext
        })
      }
    };

    // Send error response
    res.status(statusCode).json(errorResponse);
  }

  // Check if error is operational (expected) vs programming error
  public isOperational(error: any): boolean {
    if (error instanceof AppError) {
      return error.statusCode < 500;
    }
    return false;
  }

  // Enhanced error logging
  public logError(error: any, req?: Request): void {
    const errorCode = error.errorCode || ErrorCodes.UNKNOWN_ERROR;
    const severity = this.getSeverityFromErrorCode(errorCode);
    
    const logEntry: ErrorLogEntry = {
      id: this.generateErrorId(),
      error: {
        message: error.message || 'Unknown error',
        code: errorCode,
        statusCode: error.statusCode || 500,
        severity: severity,
        context: error.context,
        details: error.details,
        timestamp: error.timestamp || new Date().toISOString(),
        stack: error.stack
      },
      request: req ? {
        method: req.method,
        url: req.url,
        headers: req.headers as Record<string, string>,
        body: req.body,
        query: req.query,
        params: req.params
      } : {
        method: 'UNKNOWN',
        url: 'UNKNOWN',
        headers: {}
      },
      user: req && (req as any).user ? {
        id: (req as any).user.id,
        email: (req as any).user.email,
        username: (req as any).user.username
      } : undefined,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString()
      }
    };

    // Log based on severity
    switch (logEntry.error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('🚨 CRITICAL ERROR:', JSON.stringify(logEntry, null, 2));
        break;
      case ErrorSeverity.HIGH:
        console.error('❌ HIGH SEVERITY ERROR:', JSON.stringify(logEntry, null, 2));
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('⚠️ MEDIUM SEVERITY ERROR:', JSON.stringify(logEntry, null, 2));
        break;
      case ErrorSeverity.LOW:
        console.log('ℹ️ LOW SEVERITY ERROR:', JSON.stringify(logEntry, null, 2));
        break;
    }

    // In production, you might want to send to external logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogging(logEntry);
    }
  }

  // Get severity level from error code
  private getSeverityFromErrorCode(errorCode: ErrorCodes): ErrorSeverity {
    switch (errorCode) {
      case ErrorCodes.VALIDATION_ERROR:
      case ErrorCodes.REQUIRED_FIELD:
      case ErrorCodes.INVALID_TYPE:
      case ErrorCodes.INVALID_EMAIL:
      case ErrorCodes.INVALID_WALLET_ADDRESS:
      case ErrorCodes.INVALID_USERNAME:
      case ErrorCodes.INVALID_UUID:
      case ErrorCodes.INVALID_AMOUNT:
      case ErrorCodes.INVALID_DATE:
      case ErrorCodes.INVALID_ENUM_VALUE:
        return ErrorSeverity.LOW;

      case ErrorCodes.BUSINESS_LOGIC_ERROR:
      case ErrorCodes.USER_NOT_FOUND:
      case ErrorCodes.CONTRACT_NOT_FOUND:
      case ErrorCodes.PROJECT_NOT_FOUND:
      case ErrorCodes.SERVICE_NOT_FOUND:
      case ErrorCodes.INSUFFICIENT_FUNDS:
      case ErrorCodes.INVALID_STATUS_TRANSITION:
      case ErrorCodes.SAME_USER_OPERATION:
      case ErrorCodes.CONFLICT:
      case ErrorCodes.DUPLICATE_ENTRY:
        return ErrorSeverity.MEDIUM;

      case ErrorCodes.AUTHENTICATION_ERROR:
      case ErrorCodes.AUTHORIZATION_ERROR:
      case ErrorCodes.TOKEN_EXPIRED:
      case ErrorCodes.TOKEN_INVALID:
      case ErrorCodes.TOKEN_MISSING:
      case ErrorCodes.INVALID_CREDENTIALS:
      case ErrorCodes.INSUFFICIENT_PERMISSIONS:
      case ErrorCodes.RESOURCE_ACCESS_DENIED:
      case ErrorCodes.ADMIN_REQUIRED:
        return ErrorSeverity.HIGH;

      case ErrorCodes.DATABASE_ERROR:
      case ErrorCodes.REFERENCE_NOT_FOUND:
      case ErrorCodes.TABLE_NOT_FOUND:
      case ErrorCodes.COLUMN_NOT_FOUND:
      case ErrorCodes.CONSTRAINT_VIOLATION:
      case ErrorCodes.INTERNAL_SERVER_ERROR:
        return ErrorSeverity.CRITICAL;

      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  // Generate unique error ID
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Send to external logging service (placeholder)
  private sendToExternalLogging(logEntry: ErrorLogEntry): void {
    // In a real implementation, you would send to services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - CloudWatch
    // - etc.
    
    // For now, we'll just log to console in production
    if (process.env.NODE_ENV === 'production') {
      console.log('📊 Sending to external logging service:', logEntry.id);
    }
  }

  // Handle uncaught exceptions
  public handleUncaughtException(error: Error): void {
    console.error('💥 UNCAUGHT EXCEPTION:', error);
    console.error('Stack trace:', error.stack);
    
    // In production, you might want to:
    // 1. Send notification to team
    // 2. Gracefully shutdown the application
    // 3. Restart the process
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  // Handle unhandled promise rejections
  public handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    console.error('💥 UNHANDLED PROMISE REJECTION:', reason);
    console.error('Promise:', promise);
    
    // In production, you might want to:
    // 1. Send notification to team
    // 2. Log the error
    // 3. Continue running the application
    
    if (process.env.NODE_ENV === 'production') {
      // Don't exit the process for unhandled rejections in production
      // Just log and continue
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandlerMiddleware.getInstance();

// Export middleware function for Express
export const errorHandlerMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  errorHandler.handle(error, req, res, next);
};

// Setup global error handlers
export const setupGlobalErrorHandlers = (): void => {
  process.on('uncaughtException', (error: Error) => {
    errorHandler.handleUncaughtException(error);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    errorHandler.handleUnhandledRejection(reason, promise);
  });
};
