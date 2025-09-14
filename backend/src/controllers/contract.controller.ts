import { Request, Response, NextFunction } from 'express';
import { contractService } from '@/services/contract.service';
import { CreateContractDTO, UpdateContractDTO } from '@/types/contract.types';
import {
  UUID_REGEX,
  CONTRACT_TYPES,
  ESCROW_STATUSES,
  ACTIVE_ESCROW_STATUSES,
  validateUUID,
  validateObject,
  CONTRACT_CREATION_SCHEMA,
  validateEnum,
  validateMonetaryAmount,
  validateStringLength
} from '@/utils/validation';
import { HTTP_STATUS } from '../types/api.type';
import {
  buildSuccessResponse,
  buildListResponse,
  buildErrorResponse,
} from '../utils/responseBuilder';
import {
  ValidationError,
  BusinessLogicError,
  NotFoundError,
  BadRequestError,
  mapSupabaseError
} from '@/utils/AppError';

/**
 * Creates a new contract between a freelancer and client
 * @param {Request} req - Express request object
 * @param {CreateContractDTO} req.body - Contract creation data
 * @param {string} req.body.contract_type - Type of contract ('project' or 'service')
 * @param {string} req.body.freelancer_id - UUID of the freelancer
 * @param {string} req.body.client_id - UUID of the client
 * @param {string} req.body.contract_on_chain_id - On-chain contract identifier
 * @param {number} req.body.amount_locked - Amount locked in the contract (must be > 0)
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 * @returns {Promise<void>} - Returns void, sends JSON response with created contract
 *
 * @example
 * POST /api/contracts
 * {
 *   "contract_type": "project",
 *   "freelancer_id": "123e4567-e89b-12d3-a456-426614174000",
 *   "client_id": "987fcdeb-51a2-43d7-8f9e-123456789abc",
 *   "contract_on_chain_id": "chain_contract_123",
 *   "amount_locked": 1000
 * }
 *
 * @throws {422} - ValidationError for invalid input data
 * @throws {400} - BusinessLogicError for business rule violations
 * @throws {500} - DatabaseError for database operation failures
 */
export const createContractHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const contractData: CreateContractDTO = req.body;

    // Use standardized validation
    const validationResult = validateObject(contractData, CONTRACT_CREATION_SCHEMA);
    
    if (!validationResult.isValid) {
      throw new ValidationError('Contract validation failed', validationResult.errors);
    }

    const newContract = await contractService.createContract(contractData);

    res
      .status(HTTP_STATUS.CREATED)
      .json(buildSuccessResponse(newContract, 'Contract created successfully'));
  } catch (error: any) {
    // Handle specific business logic errors
    if (error.message === 'Freelancer or client not found') {
      throw new BusinessLogicError('Freelancer or client not found', 'USER_NOT_FOUND');
    }

    if (error.message === 'Freelancer and client cannot be the same user') {
      throw new BusinessLogicError('Freelancer and client cannot be the same user', 'SAME_USER_OPERATION');
    }

    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    // Handle validation errors from service layer
    if (error.message.includes('is required for')) {
      throw new ValidationError(error.message);
    }

    if (error.message.includes('Invalid')) {
      throw new BadRequestError(error.message);
    }

    next(error);
  }
};

/**
 * Retrieves a contract by its unique identifier
 * @param {Request} req - Express request object
 * @param {string} req.params.id - Contract UUID to retrieve
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 * @returns {Promise<void>} - Returns void, sends JSON response with contract details
 *
 * @example
 * GET /api/contracts/123e4567-e89b-12d3-a456-426614174000
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Contract retrieved successfully",
 *   "data": {
 *     "id": "123e4567-e89b-12d3-a456-426614174000",
 *     "contract_type": "project",
 *     "escrow_status": "pending",
 *     "amount_locked": 1000
 *   }
 * }
 *
 * @throws {400} - BadRequestError for invalid contract ID format
 * @throws {404} - NotFoundError for contract not found
 * @throws {500} - DatabaseError for database operation failures
 */
export const getContractByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Use standardized UUID validation
    if (!validateUUID(id)) {
      throw new BadRequestError('Invalid contract ID format', 'INVALID_UUID');
    }

    const contract = await contractService.getContractById(id);

    if (!contract) {
      throw new NotFoundError('Contract not found', 'CONTRACT_NOT_FOUND');
    }

    res
      .status(HTTP_STATUS.OK)
      .json(buildSuccessResponse(contract, 'Contract retrieved successfully'));
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    next(error);
  }
};

/**
 * Updates the escrow status of an existing contract
 * @param {Request} req - Express request object
 * @param {string} req.params.id - Contract UUID to update
 * @param {UpdateContractDTO} req.body - Contract update data
 * @param {string} req.body.escrow_status - New escrow status ('funded', 'released', or 'disputed')
 * @param {string} req.body.user_id - ID of the user making the update (from auth middleware)
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 * @returns {Promise<void>} - Returns void, sends JSON response with updated contract
 *
 * @example
 * PATCH /api/contracts/123e4567-e89b-12d3-a456-426614174000/status
 * {
 *   "escrow_status": "funded",
 *   "user_id": "user-uuid-here"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Contract status updated successfully",
 *   "data": {
 *     "id": "123e4567-e89b-12d3-a456-426614174000",
 *     "escrow_status": "funded"
 *   }
 * }
 *
 * @throws {400} - BadRequestError for invalid contract ID format or invalid status
 * @throws {422} - ValidationError for missing required fields
 * @throws {404} - NotFoundError for contract not found
 * @throws {500} - DatabaseError for database operation failures
 */
export const updateContractStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateContractDTO = req.body;
    const userId = req.body.user_id; // In a real app, this would come from auth middleware

    // Use standardized UUID validation
    if (!validateUUID(id)) {
      throw new BadRequestError('Invalid contract ID format', 'INVALID_UUID');
    }

    // Validate required fields
    const { escrow_status } = updateData;

    if (!escrow_status) {
      throw new ValidationError('escrow_status is required');
    }

    // Use standardized enum validation
    if (!validateEnum(escrow_status, ACTIVE_ESCROW_STATUSES)) {
      throw new BadRequestError(
        'escrow_status must be \'funded\', \'released\', or \'disputed\'',
        'INVALID_ENUM_VALUE'
      );
    }

    const updatedContract = await contractService.updateContractStatus(
      id,
      updateData,
      userId
    );

    if (!updatedContract) {
      throw new NotFoundError('Contract not found', 'CONTRACT_NOT_FOUND');
    }

    res
      .status(HTTP_STATUS.OK)
      .json(
        buildSuccessResponse(
          updatedContract,
          'Contract status updated successfully'
        )
      );
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    next(error);
  }
};

/**
 * Retrieves all contracts associated with a specific user
 * @param {Request} req - Express request object
 * @param {string} req.params.userId - User UUID to fetch contracts for
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 * @returns {Promise<void>} - Returns void, sends JSON response with array of user's contracts
 *
 * @example
 * GET /api/contracts/user/123e4567-e89b-12d3-a456-426614174000
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "User contracts retrieved successfully",
 *   "data": [
 *     {
 *       "id": "contract-uuid-1",
 *       "contract_type": "project",
 *       "escrow_status": "funded",
 *       "amount_locked": 1000
 *     },
 *     {
 *       "id": "contract-uuid-2",
 *       "contract_type": "service",
 *       "escrow_status": "pending",
 *       "amount_locked": 500
 *     }
 *   ]
 * }
 *
 * @throws {400} - BadRequestError for invalid user ID format
 * @throws {500} - DatabaseError for database operation failures
 */
export const getContractsByUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    // Use standardized UUID validation
    if (!validateUUID(userId)) {
      throw new BadRequestError('Invalid user ID format', 'INVALID_UUID');
    }

    const contracts = await contractService.getContractsByUser(userId);

    res
      .status(HTTP_STATUS.OK)
      .json(
        buildListResponse(contracts, 'User contracts retrieved successfully')
      );
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    next(error);
  }
};

/**
 * Retrieves all contracts filtered by their escrow status
 * @param {Request} req - Express request object
 * @param {string} req.params.status - Escrow status to filter by ('pending', 'funded', 'released', or 'disputed')
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 * @returns {Promise<void>} - Returns void, sends JSON response with filtered contracts
 *
 * @example
 * GET /api/contracts/status/funded
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Contracts by status retrieved successfully",
 *   "data": [
 *     {
 *       "id": "contract-uuid-1",
 *       "contract_type": "project",
 *       "escrow_status": "funded",
 *       "amount_locked": 1500,
 *       "freelancer_id": "freelancer-uuid",
 *       "client_id": "client-uuid"
 *     }
 *   ]
 * }
 *
 * @throws {400} - BadRequestError for invalid or missing status
 * @throws {500} - DatabaseError for database operation failures
 */
export const getContractsByStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.params;

    if (!status || !validateEnum(status, ESCROW_STATUSES)) {
      throw new BadRequestError(
        'Valid status is required: pending, funded, released, or disputed',
        'INVALID_ENUM_VALUE'
      );
    }

    const contracts = await contractService.getContractsByStatus(status);

    res
      .status(HTTP_STATUS.OK)
      .json(
        buildListResponse(
          contracts,
          'Contracts by status retrieved successfully'
        )
      );
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    next(error);
  }
};