import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { ValidationError as ValidationErrorType } from './validation';

// Base AppError class
export class AppError extends Error {
	public statusCode: number;
	public errorCode: string;
	public details?: any;
	public timestamp: string;

	constructor(
		message: string, 
		statusCode = 400, 
		errorCode = 'GENERIC_ERROR',
		details?: any
	) {
		super(message);
		this.statusCode = statusCode;
		this.errorCode = errorCode;
		this.details = details;
		this.timestamp = new Date().toISOString();
		Error.captureStackTrace(this, this.constructor);
	}
}

// Specific error types
export class ValidationError extends AppError {
	constructor(message: string, validationErrors?: ValidationErrorType[]) {
		super(message, 422, 'VALIDATION_ERROR', validationErrors);
	}
}

export class DatabaseError extends AppError {
	constructor(message: string, details?: any) {
		super(message, 500, 'DATABASE_ERROR', details);
	}
}

export class BusinessLogicError extends AppError {
	constructor(message: string, errorCode = 'BUSINESS_LOGIC_ERROR', details?: any) {
		super(message, 400, errorCode, details);
	}
}

export class AuthenticationError extends AppError {
	constructor(message: string, details?: any) {
		super(message, 401, 'AUTHENTICATION_ERROR', details);
	}
}

export class AuthorizationError extends AppError {
	constructor(message: string, details?: any) {
		super(message, 403, 'AUTHORIZATION_ERROR', details);
	}
}

export class NotFoundError extends AppError {
	constructor(message: string, errorCode = 'RESOURCE_NOT_FOUND') {
		super(message, 404, errorCode);
	}
}

export class BadRequestError extends AppError {
	constructor(message: string, errorCode = 'BAD_REQUEST') {
		super(message, 400, errorCode);
	}
}

export class InternalServerError extends AppError {
	constructor(message: string, details?: any) {
		super(message, 500, 'INTERNAL_SERVER_ERROR', details);
	}
}

export class ConflictError extends AppError {
	constructor(message: string, errorCode = 'CONFLICT') {
		super(message, 409, errorCode);
	}
}

export class RequiredFieldsError extends AppError {
	constructor(message: string, missingFields?: string[]) {
		super(message, 422, 'MISSING_REQUIRED_FIELDS', missingFields);
	}
}

export class InvalidPayloadError extends AppError {
	constructor(message: string, details?: any) {
		super(message, 400, 'INVALID_PAYLOAD', details);
	}
}

export class MissingFieldsError extends AppError {
	constructor(message: string, missingFields?: string[]) {
		super(message, 422, 'MISSING_FIELDS', missingFields);
	}
}

export class ForbiddenError extends AppError {
	constructor(message: string, details?: any) {
		super(message, 403, 'FORBIDDEN', details);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message: string, details?: any) {
		super(message, 401, 'UNAUTHORIZED', details);
	}
}

// Supabase error mapping
export const mapSupabaseError = (error: any): AppError => {
	if (!error || !error.code) {
		return new DatabaseError('Database operation failed', error);
	}

	switch (error.code) {
		case '23505': // Unique violation
			return new ConflictError('Duplicate entry', 'DUPLICATE_ENTRY');
		case '23503': // Foreign key violation
			return new BusinessLogicError('Referenced record not found', 'REFERENCE_NOT_FOUND');
		case '42501': // Insufficient privilege
			return new AuthorizationError('Insufficient database permissions');
		case '42P01': // Undefined table
			return new DatabaseError('Table does not exist', error);
		case '42703': // Undefined column
			return new DatabaseError('Column does not exist', error);
		case '23502': // Not null violation
			return new ValidationError('Required field is missing');
		case '22P02': // Invalid text representation
			return new ValidationError('Invalid data format');
		case '23514': // Check violation
			return new ValidationError('Data constraint violation');
		default:
			return new DatabaseError('Database operation failed', error);
	}
};

// Enhanced error handler with consistent response format
export function ErrorHandler(
	err: unknown,
	req: Request,
	res: Response,
	_next: NextFunction
) {
	let statusCode = 500;
	let message = 'Internal server error';
	let errorCode = 'INTERNAL_SERVER_ERROR';
	let details: any = undefined;

	if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;
		errorCode = err.errorCode;
		details = err.details;
	} else if (err instanceof Error) {
		message = err.message;
		errorCode = 'UNKNOWN_ERROR';
	} else if (typeof err === 'string') {
		message = err;
		errorCode = 'STRING_ERROR';
	} else {
		errorCode = 'UNKNOWN_ERROR_TYPE';
		details = err;
	}

	// Log error for debugging (in development)
	if (process.env.NODE_ENV === 'development') {
		console.error('Error details:', {
			message,
			errorCode,
			statusCode,
			details,
			stack: err instanceof Error ? err.stack : undefined,
			url: req.url,
			method: req.method,
			timestamp: new Date().toISOString()
		});
	}

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
				stack: err instanceof Error ? err.stack : undefined,
				url: req.url,
				method: req.method
			})
		}
	};

	return res.status(statusCode).json(errorResponse);
}

// Utility function to create validation errors from validation results
export const createValidationError = (validationResult: { isValid: boolean; errors: any[] }): ValidationError => {
	if (validationResult.isValid) {
		throw new Error('Cannot create validation error from valid result');
	}
	
	const message = 'Validation failed';
	return new ValidationError(message, validationResult.errors);
};

// Utility function to check if error is a specific type
export const isAppError = (error: any): error is AppError => {
	return error instanceof AppError;
};

export const isValidationError = (error: any): error is ValidationError => {
	return error instanceof ValidationError;
};

export const isDatabaseError = (error: any): error is DatabaseError => {
	return error instanceof DatabaseError;
};

export const isBusinessLogicError = (error: any): error is BusinessLogicError => {
	return error instanceof BusinessLogicError;
};
  