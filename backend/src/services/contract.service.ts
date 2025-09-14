import { supabase } from '@/lib/supabase/supabase';
import {
  CreateContractDTO,
  UpdateContractDTO,
  Contract,
  ContractWithUsers,
} from '@/types/contract.types';
import { UUID_REGEX } from '@/utils/validation';
import { MissingFieldsError ,ValidationError,ForbiddenError,NotFoundError,InternalServerError, BadRequestError} from '@/utils/AppError';
class ContractService {
  async createContract(contractData: CreateContractDTO): Promise<Contract> {
    const {
      contract_type,
      project_id,
      service_request_id,
      freelancer_id,
      client_id,
      contract_on_chain_id,
      amount_locked,
    } = contractData;

    // Validate contract type and required fields
    if (contract_type === 'project' && !project_id) {
      throw new MissingFieldsError('project_id is required for project contracts');
    }

    if (contract_type === 'service' && !service_request_id) {
      throw new MissingFieldsError('service_request_id is required for service contracts');
    }

    // Validate UUID format

    if (!UUID_REGEX.test(freelancer_id) || !UUID_REGEX.test(client_id)) {
      throw new ValidationError('Invalid freelancer_id or client_id format');
    }

    if (project_id && !UUID_REGEX.test(project_id)) {
      throw new ValidationError('Invalid project_id format');
    }

    if (service_request_id && !UUID_REGEX.test(service_request_id)) {
      throw new ValidationError('Invalid service_request_id format');
    }

    // Verify that users exist
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .in('id', [freelancer_id, client_id]);

    if (usersError || !users || users.length !== 2) {
      throw new NotFoundError('Freelancer or client not found');
    }

    // Verify that freelancer and client are different
    if (freelancer_id === client_id) {
      throw new ForbiddenError('Freelancer and client cannot be the same user');
    }

    // Create the contract
    const { data: contract, error } = await supabase
      .from('contracts')
      .insert({
        contract_type,
        project_id,
        service_request_id,
        freelancer_id,
        client_id,
        contract_on_chain_id: contract_on_chain_id.trim(),
        escrow_status: 'pending',
        amount_locked,
        created_at: new Date().toISOString(),
      })
      .select(
        `
        id,
        contract_type,
        project_id,
        service_request_id,
        freelancer_id,
        client_id,
        contract_on_chain_id,
        escrow_status,
        amount_locked,
        created_at
      `
      )
      .single();

    if (error) {
      throw new InternalServerError(`Failed to create contract: ${error.message}`);
    }

    return contract;
  }

  async getContractById(contractId: string): Promise<ContractWithUsers | null> {
    // Validate UUID format
    if (!UUID_REGEX.test(contractId)) {
      throw new ValidationError('Invalid contract ID format');
    }

    const { data: contract, error } = await supabase
      .from('contracts')
      .select(
        `
        id,
        contract_type,
        project_id,
        service_request_id,
        freelancer_id,
        client_id,
        contract_on_chain_id,
        escrow_status,
        amount_locked,
        created_at,
        freelancer:freelancer_id (
          id,
          name,
          username,
          email
        ),
        client:client_id (
          id,
          name,
          username,
          email
        )
      `
      )
      .eq('id', contractId)
      .single();

    if (error || !contract) {
      return null;
    }

    // Transform the data to include user info
    const freelancer = Array.isArray(contract.freelancer)
      ? contract.freelancer[0]
      : contract.freelancer;
    const client = Array.isArray(contract.client)
      ? contract.client[0]
      : contract.client;

    return {
      id: contract.id,
      contract_type: contract.contract_type,
      project_id: contract.project_id,
      service_request_id: contract.service_request_id,
      freelancer_id: contract.freelancer_id,
      client_id: contract.client_id,
      contract_on_chain_id: contract.contract_on_chain_id,
      escrow_status: contract.escrow_status,
      amount_locked: contract.amount_locked,
      created_at: contract.created_at,
      freelancer: {
        id: freelancer?.id,
        name: freelancer?.name,
        username: freelancer?.username,
        email: freelancer?.email,
      },
      client: {
        id: client?.id,
        name: client?.name,
        username: client?.username,
        email: client?.email,
      },
    };
  }

  async updateContractStatus(
    contractId: string,
    updateData: UpdateContractDTO,
    userId?: string
  ): Promise<Contract | null> {
    // Validate UUID format
    if (!UUID_REGEX.test(contractId)) {
      throw new ValidationError('Invalid contract ID format');
    }

    // Get current contract
    const { data: currentContract, error: fetchError } = await supabase
      .from('contracts')
      .select('id, client_id, freelancer_id, escrow_status')
      .eq('id', contractId)
      .single();

    if (fetchError || !currentContract) {
      return null;
    }

    // Validate escrow status transitions
    const { escrow_status } = updateData;
    if (escrow_status) {
      const validTransitions: Record<string, string[]> = {
        pending: ['funded'],
        funded: ['released', 'disputed'],
        released: [], // No further transitions
        disputed: [], // No further transitions
      };

      const currentStatus = currentContract.escrow_status;
      const allowedTransitions = validTransitions[currentStatus] || [];

      if (!allowedTransitions.includes(escrow_status)) {
        throw new BadRequestError(
          `Invalid status transition from ${currentStatus} to ${escrow_status}`
        );
      }

      // Validate user permissions
      if (userId) {
        if (escrow_status === 'funded' && userId !== currentContract.client_id) {
          throw new ForbiddenError('Only the client can fund the escrow');
        }

        if (escrow_status === 'released' && userId !== currentContract.client_id) {
          throw new ForbiddenError('Only the client can release the escrow');
        }

        if (
          escrow_status === 'disputed' &&
          userId !== currentContract.client_id &&
          userId !== currentContract.freelancer_id
        ) {
          throw new ForbiddenError('Only the client or freelancer can dispute');
        }
      }
    }

    // Update the contract
    const { data: contract, error } = await supabase
      .from('contracts')
      .update({
        escrow_status: escrow_status,
      })
      .eq('id', contractId)
      .select(
        `
        id,
        contract_type,
        project_id,
        service_request_id,
        freelancer_id,
        client_id,
        contract_on_chain_id,
        escrow_status,
        amount_locked,
        created_at
      `
      )
      .single();

    if (error) {
      throw new InternalServerError(`Failed to update contract: ${error.message}`);
    }

    return contract;
  }

  // Additional utility methods
  async getContractsByUser(userId: string): Promise<ContractWithUsers[]> {
    // Validate UUID format
    if (!UUID_REGEX.test(userId)) {
      throw new ValidationError('Invalid user ID format');
    }

    const { data: contracts, error } = await supabase
      .from('contracts')
      .select(
        `
        id,
        contract_type,
        project_id,
        service_request_id,
        freelancer_id,
        client_id,
        contract_on_chain_id,
        escrow_status,
        amount_locked,
        created_at,
        freelancer:freelancer_id (
          id,
          name,
          username,
          email
        ),
        client:client_id (
          id,
          name,
          username,
          email
        )
      `
      )
      .or(`freelancer_id.eq.${userId},client_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerError(`Failed to fetch user contracts: ${error.message}`);
    }

    // Transform the data to include user info
    const contractsWithUsers: ContractWithUsers[] = (contracts || []).map((contract: any) => {
      const freelancer = Array.isArray(contract.freelancer)
        ? contract.freelancer[0]
        : contract.freelancer;
      const client = Array.isArray(contract.client)
        ? contract.client[0]
        : contract.client;

      return {
        id: contract.id,
        contract_type: contract.contract_type,
        project_id: contract.project_id,
        service_request_id: contract.service_request_id,
        freelancer_id: contract.freelancer_id,
        client_id: contract.client_id,
        contract_on_chain_id: contract.contract_on_chain_id,
        escrow_status: contract.escrow_status,
        amount_locked: contract.amount_locked,
        created_at: contract.created_at,
        freelancer: {
          id: freelancer?.id,
          name: freelancer?.name,
          username: freelancer?.username,
          email: freelancer?.email,
        },
        client: {
          id: client?.id,
          name: client?.name,
          username: client?.username,
          email: client?.email,
        },
      };
    });

    return contractsWithUsers;
  }

  async getContractsByStatus(status: string): Promise<ContractWithUsers[]> {
    const { data: contracts, error } = await supabase
      .from('contracts')
      .select(
        `
        id,
        contract_type,
        project_id,
        service_request_id,
        freelancer_id,
        client_id,
        contract_on_chain_id,
        escrow_status,
        amount_locked,
        created_at,
        freelancer:freelancer_id (
          id,
          name,
          username,
          email
        ),
        client:client_id (
          id,
          name,
          username,
          email
        )
      `
      )
      .eq('escrow_status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerError(`Failed to fetch contracts by status: ${error.message}`);
    }

    // Transform the data to include user info
    const contractsWithUsers: ContractWithUsers[] = (contracts || []).map((contract: any) => {
      const freelancer = Array.isArray(contract.freelancer)
        ? contract.freelancer[0]
        : contract.freelancer;
      const client = Array.isArray(contract.client)
        ? contract.client[0]
        : contract.client;

      return {
        id: contract.id,
        contract_type: contract.contract_type,
        project_id: contract.project_id,
        service_request_id: contract.service_request_id,
        freelancer_id: contract.freelancer_id,
        client_id: contract.client_id,
        contract_on_chain_id: contract.contract_on_chain_id,
        escrow_status: contract.escrow_status,
        amount_locked: contract.amount_locked,
        created_at: contract.created_at,
        freelancer: {
          id: freelancer?.id,
          name: freelancer?.name,
          username: freelancer?.username,
          email: freelancer?.email,
        },
        client: {
          id: client?.id,
          name: client?.name,
          username: client?.username,
          email: client?.email,
        },
      };
    });

    return contractsWithUsers;
  }
}

export const contractService = new ContractService(); 