//  Interface for Review!!
export interface GetReview {
  id: string;
  from_id: string;
  to_id: string;
  contract_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

// Interface for create reaciew data!!
export interface PostReview {
  from_id: string;
  to_id: string;
  contract_id: string;
  rating: number;
  comment?: string;
}
