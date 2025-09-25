// Base contract interface
export interface Contract {
  id: string;
  contract_type: 'project' | 'service';
  project_id?: string;
  service_request_id?: string;
  freelancer_id: string;
  client_id: string;
  contract_on_chain_id: string;
  escrow_status: 'pending' | 'funded' | 'released' | 'disputed';
  amount_locked: number;
  created_at: string;
}

// Contract creation DTO
export interface CreateContractDTO {
  contract_type: 'project' | 'service';
  project_id?: string;
  service_request_id?: string;
  freelancer_id: string;
  client_id: string;
  contract_on_chain_id: string;
  amount_locked: number;
}

// Contract update DTO
export interface UpdateContractDTO {
  escrow_status?: 'funded' | 'released' | 'disputed';
}

// Contract with user information
export interface ContractWithUsers extends Contract {
  freelancer: {
    id: string;
    name?: string;
    username?: string;
    email?: string;
  };
  client: {
    id: string;
    name?: string;
    username?: string;
    email?: string;
  };
}

// Database table structure (for reference)
export interface ContractTable {
  id: string; // UUID primary key
  contract_type: string; // 'project' or 'service'
  project_id?: string; // UUID foreign key to projects table
  service_request_id?: string; // UUID foreign key to service_requests table
  freelancer_id: string; // UUID foreign key to users table
  client_id: string; // UUID foreign key to users table
  contract_on_chain_id: string; // TEXT NOT NULL
  escrow_status: string; // 'pending', 'funded', 'released', 'disputed'
  amount_locked: number; // DECIMAL NOT NULL
  created_at: string; // TIMESTAMP DEFAULT NOW()
}
