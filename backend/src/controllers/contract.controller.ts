import { Request, Response, NextFunction } from "express";
import { contractService } from "@/services/contract.service";
import { CreateContractDTO, UpdateContractDTO } from "@/types/contract.types";
import {
  UUID_REGEX,
  CONTRACT_TYPES,
  ESCROW_STATUSES,
  ACTIVE_ESCROW_STATUSES,
} from "@/utils/validation";
import { HTTP_STATUS } from "../types/api.type";
import {
  buildSuccessResponse,
  buildListResponse,
} from "../utils/responseBuilder";

/**
 * Creates a new contract between a freelancer and client
 * @param {Request} req - Express request object
 * @param {CreateContractDTO} req.body - Contract creation data including contract_type, freelancer_id, client_id, contract_on_chain_id, amount_locked, and optional project_id or service_request_id
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 * @returns {Promise<void>} - Returns void, sends JSON response with created contract data
 *
 * @example
 * POST /api/contracts
 * {
 *   "contract_type": "project",
 *   "project_id": "550e8400-e29b-41d4-a716-446655440000",
 *   "freelancer_id": "550e8400-e29b-41d4-a716-446655440001",
 *   "client_id": "550e8400-e29b-41d4-a716-446655440002",
 *   "contract_on_chain_id": "0x1234567890abcdef",
 *   "amount_locked": 1000
 * }
 *
 * @throws {400} - Missing required fields (contract_type, freelancer_id, client_id, contract_on_chain_id, amount_locked)
 * @throws {400} - Invalid contract type (must be 'project' or 'service')
 * @throws {400} - Invalid amount_locked (must be greater than 0)
 * @throws {400} - Empty contract_on_chain_id
 * @throws {400} - Freelancer and client cannot be the same user
 * @throws {400} - Missing project_id for project contracts or service_request_id for service contracts
 * @throws {404} - Freelancer or client not found
 * @throws {500} - Internal server error
 */
export const createContractHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const contractData: CreateContractDTO = req.body;

    // Validate required fields
    const {
      contract_type,
      freelancer_id,
      client_id,
      contract_on_chain_id,
      amount_locked,
    } = contractData;

    if (
      !contract_type ||
      !freelancer_id ||
      !client_id ||
      !contract_on_chain_id ||
      amount_locked === undefined
    ) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message:
          "Missing required fields: contract_type, freelancer_id, client_id, contract_on_chain_id, amount_locked",
      });
      return;
    }

    // Validate contract type
    if (!CONTRACT_TYPES.includes(contract_type)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "contract_type must be 'project' or 'service'",
      });
      return;
    }

    // Validate amount
    if (amount_locked <= 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "amount_locked must be greater than 0",
      });
      return;
    }

    // Validate string fields are not empty
    if (contract_on_chain_id.trim().length === 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "contract_on_chain_id cannot be empty",
      });
      return;
    }

    const newContract = await contractService.createContract(contractData);

    res
      .status(HTTP_STATUS.CREATED)
      .json(buildSuccessResponse(newContract, "Contract created successfully"));
  } catch (error: any) {
    if (error.message === "Freelancer or client not found") {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Freelancer or client not found",
      });
      return;
    }

    if (error.message === "Freelancer and client cannot be the same user") {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Freelancer and client cannot be the same user",
      });
      return;
    }

    if (error.message.includes("is required for")) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error.message.includes("Invalid")) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
};

/**
 * Retrieves a specific contract by its ID
 * @param {Request} req - Express request object
 * @param {string} req.params.id - Contract UUID to retrieve
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 * @returns {Promise<void>} - Returns void, sends JSON response with contract data including freelancer and client information
 *
 * @example
 * GET /api/contracts/550e8400-e29b-41d4-a716-446655440000
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Contract retrieved successfully",
 *   "data": {
 *     "id": "550e8400-e29b-41d4-a716-446655440000",
 *     "contract_type": "project",
 *     "freelancer_id": "550e8400-e29b-41d4-a716-446655440001",
 *     "client_id": "550e8400-e29b-41d4-a716-446655440002",
 *     "escrow_status": "pending",
 *     "amount_locked": 1000,
 *     "freelancer": { "id": "...", "name": "John Doe" },
 *     "client": { "id": "...", "name": "Jane Smith" }
 *   }
 * }
 *
 * @throws {400} - Invalid contract ID format (must be valid UUID)
 * @throws {404} - Contract not found
 * @throws {500} - Internal server error
 */
export const getContractByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

    const { id } = req.params;

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid contract ID format",
      });
      return;
    }

    const contract = await contractService.getContractById(id);

    if (!contract) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Contract not found",
      });
      return;
    }

    res
      .status(HTTP_STATUS.OK)
      .json(buildSuccessResponse(contract, "Contract retrieved successfully"));
  
};

/**
 * Updates the escrow status of an existing contract
 * @param {Request} req - Express request object
 * @param {string} req.params.id - Contract UUID to update
 * @param {UpdateContractDTO} req.body - Update data containing escrow_status and user_id
 * @param {string} req.body.escrow_status - New escrow status ('funded', 'released', or 'disputed')
 * @param {string} req.body.user_id - ID of user making the status update (for authorization)
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 * @returns {Promise<void>} - Returns void, sends JSON response with updated contract data
 *
 * @example
 * PUT /api/contracts/550e8400-e29b-41d4-a716-446655440000/status
 * {
 *   "escrow_status": "funded",
 *   "user_id": "550e8400-e29b-41d4-a716-446655440002"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Contract status updated successfully",
 *   "data": { "id": "...", "escrow_status": "funded", ... }
 * }
 *
 * @throws {400} - Invalid contract ID format (must be valid UUID)
 * @throws {400} - Missing escrow_status field
 * @throws {400} - Invalid escrow_status (must be 'funded', 'released', or 'disputed')
 * @throws {400} - Invalid status transition (e.g., cannot go from 'released' to 'pending')
 * @throws {403} - User not authorized to update this contract status
 * @throws {404} - Contract not found
 * @throws {500} - Internal server error
 */
export const updateContractStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

    const { id } = req.params;
    const updateData: UpdateContractDTO = req.body;
    const userId = req.body.user_id; // In a real app, this would come from auth middleware

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid contract ID format",
      });
      return;
    }

    // Validate required fields
    const { escrow_status } = updateData;

    if (!escrow_status) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "escrow_status is required",
      });
      return;
    }

    // Validate escrow status
    if (!ACTIVE_ESCROW_STATUSES.includes(escrow_status)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "escrow_status must be 'funded', 'released', or 'disputed'",
      });
      return;
    }

    const updatedContract = await contractService.updateContractStatus(
      id,
      updateData,
      userId
    );

    if (!updatedContract) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Contract not found",
      });
      return;
    }

    res
      .status(HTTP_STATUS.OK)
      .json(
        buildSuccessResponse(
          updatedContract,
          "Contract status updated successfully"
        )
      );
  
};

/**
 * Retrieves all contracts associated with a specific user (as either freelancer or client)
 * @param {Request} req - Express request object
 * @param {string} req.params.userId - User UUID to retrieve contracts for
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 * @returns {Promise<void>} - Returns void, sends JSON response with array of contracts including user information
 *
 * @example
 * GET /api/contracts/user/550e8400-e29b-41d4-a716-446655440001
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "User contracts retrieved successfully",
 *   "data": [
 *     {
 *       "id": "550e8400-e29b-41d4-a716-446655440000",
 *       "contract_type": "project",
 *       "freelancer_id": "550e8400-e29b-41d4-a716-446655440001",
 *       "client_id": "550e8400-e29b-41d4-a716-446655440002",
 *       "escrow_status": "funded",
 *       "amount_locked": 1000,
 *       "freelancer": { "id": "...", "name": "John Doe" },
 *       "client": { "id": "...", "name": "Jane Smith" }
 *     }
 *   ]
 * }
 *
 * @throws {400} - Invalid user ID format (must be valid UUID)
 * @throws {500} - Internal server error
 */
export const getContractsByUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

    const { userId } = req.params;

    // Validate UUID format
    if (!UUID_REGEX.test(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    const contracts = await contractService.getContractsByUser(userId);

    res
      .status(HTTP_STATUS.OK)
      .json(
        buildListResponse(contracts, "User contracts retrieved successfully")
      );
  
};

/**
 * Retrieves all contracts filtered by their escrow status
 * @param {Request} req - Express request object
 * @param {string} req.params.status - Escrow status to filter by ('pending', 'funded', 'released', or 'disputed')
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 * @returns {Promise<void>} - Returns void, sends JSON response with array of contracts matching the specified status
 *
 * @example
 * GET /api/contracts/status/pending
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Contracts by status retrieved successfully",
 *   "data": [
 *     {
 *       "id": "550e8400-e29b-41d4-a716-446655440000",
 *       "contract_type": "project",
 *       "escrow_status": "pending",
 *       "amount_locked": 1000,
 *       "freelancer": { "id": "...", "name": "John Doe" },
 *       "client": { "id": "...", "name": "Jane Smith" }
 *     }
 *   ]
 * }
 *
 * @throws {400} - Invalid or missing status (must be 'pending', 'funded', 'released', or 'disputed')
 * @throws {500} - Internal server error
 */
export const getContractsByStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  
    const { status } = req.params;

    if (!status || !ESCROW_STATUSES.includes(status as any)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message:
          "Valid status is required: pending, funded, released, or disputed",
      });
      return;
    }

    const contracts = await contractService.getContractsByStatus(status);

    res
      .status(HTTP_STATUS.OK)
      .json(
        buildListResponse(
          contracts,
          "Contracts by status retrieved successfully"
        )
      );
  
};
