// services/review.service.ts
import { supabase } from "@/lib/supabase/supabase";
import { GetReview, PostReview } from "../types/review.types";
import { AppError } from "../utils/AppError";

export class ReviewService {
  async createReview(data: PostReview): Promise<GetReview> {
    const { from_id, to_id, contract_id, rating, comment } = data;

    if (rating < 1 || rating > 5) {
      throw new AppError("Rating_OverFlow", 400);
    }

    if (from_id === to_id) {
      throw new AppError("Cannot_Review_yourself", 400);
    }

    const { data: existingReview, error: er1 } = await supabase
      .from("reviews")
      .select("id")
      .eq("from_id", from_id)
      .eq("contract_id", contract_id)
      .maybeSingle();

    if (er1) this.handleDbError(er1);

    if (existingReview) {
      throw new AppError("Already_reviewed_this_contract", 409);
    }

    const { data: contract, error: er2 } = await supabase
      .from("contracts")
      .select("client_id, freelancer_id, escrow_status")
      .eq("id", contract_id)
      .single();

    if (er2) this.handleDbError(er2);
    if (!contract) throw new AppError("Contract_not_found", 404);

    if (contract.escrow_status !== "released") {
      throw new AppError("Contract_not_released_yet", 400);
    }

    if (contract.client_id !== from_id && contract.freelancer_id !== from_id) {
      throw new AppError("You_are_not_part_of_this_contract", 403);
    }

    const expectedToUser =
      contract.client_id === from_id
        ? contract.freelancer_id
        : contract.client_id;

    if (to_id !== expectedToUser) {
      throw new AppError(
        "You_can_only_review_the_other_party_in_the_contract",
        400
      );
    }

    const { data: review, error: er3 } = await supabase
      .from("reviews")
      .insert({
        from_id,
        to_id,
        contract_id,
        rating,
        comment,
      })
      .select("id, from_id, to_id, contract_id, rating, comment, created_at")
      .single();

    if (er3) this.handleDbError(er3);
    if (!review) throw new AppError("Failed_to_create_review", 500);

    return review;
  }

  async getReviewsByUser(userId: string): Promise<GetReview[]> {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(
        `
        id,
        from_id,
        to_id,
        contract_id,
        rating,
        comment,
        created_at,
        from_user:users!from_id(
          id,
          username,
          avatar_url
        )
      `
      )
      .eq("to_id", userId)
      .order("created_at", { ascending: false });

    if (error) this.handleDbError(error);

    return reviews ?? [];
  }

  private handleDbError(error: any): never {
    console.error("Supabase error:", error);
    throw new AppError("Internal_server_error", 500);
  }
}

export const reviewService = new ReviewService();
