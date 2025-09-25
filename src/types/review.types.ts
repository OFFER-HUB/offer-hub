export interface Review {
  id: string;
  from_id: string;
  to_id: string;
  contract_id: string;
  rating: number; // 1..5
  comment?: string;
  created_at: string; // ISO
}

export interface CreateReviewDTO {
  from_id: string;
  to_id: string;
  contract_id: string;
  rating: number; // 1..5
  comment?: string;
}

export type ReviewsFetchResponse = {
  success: true;
  message: 'Reviews_fetched_successfully';
  data: Review[];
  count: number;
};

export type ReviewCreateResponse = {
  success: true;
  message: 'Review_created_successfully';
  data: Review;
};

export type ReviewErrorResponse = {
  success: false;
  message: string;
  data?: unknown;
};

export type ReviewUpdateResponse = {
  success: true;
  message: 'Review_updated_successfully';
  data: Review;
};

export type ReviewDeleteResponse = {
  success: true;
  message: 'Review_deleted_successfully';
  data: { id: string };
};

export type ReviewResponse =
  | ReviewsFetchResponse
  | ReviewCreateResponse
  | ReviewUpdateResponse
  | ReviewDeleteResponse
  | ReviewErrorResponse;
