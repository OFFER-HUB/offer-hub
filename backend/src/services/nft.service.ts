import { supabase } from '@/lib/supabase/supabase';
import {
  CreateNFTAwardedDTO,
  NFTAwarded,
  NFTAwardedWithUser,
} from '@/types/nft.types';
import { InternalServerError,ConflictError, NotFoundError, ValidationError } from '@/utils/AppError';
class NFTService {
  async registerMintedNFT(nftData: CreateNFTAwardedDTO): Promise<NFTAwarded> {
    const { user_id, nft_type, token_id_on_chain } = nftData;

    // First, verify that the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      throw new NotFoundError('User not found');
    }

    // Check if this NFT has already been registered for this user
    const { data: existingNFT, error: checkError } = await supabase
      .from('nfts_awarded')
      .select('id')
      .eq('user_id', user_id)
      .eq('nft_type', nft_type)
      .eq('token_id_on_chain', token_id_on_chain)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected
      throw new InternalServerError(`Failed to check existing NFT: ${checkError.message}`);
    }

    if (existingNFT) {
      throw new ConflictError('This NFT has already been registered for this user');
    }

    // Register the NFT
    const { data: nft, error } = await supabase
      .from('nfts_awarded')
      .insert({
        user_id,
        nft_type: nft_type.trim(),
        token_id_on_chain: token_id_on_chain.trim(),
        minted_at: new Date().toISOString(),
      })
      .select(
        `
        id,
        user_id,
        nft_type,
        token_id_on_chain,
        minted_at
      `
      )
      .single();

    if (error) {
      throw new InternalServerError(`Failed to register NFT: ${error.message}`);
    }

    return nft;
  }

  async getNFTsByUser(userId: string): Promise<NFTAwardedWithUser[]> {
    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new ValidationError('Invalid user ID format');
    }

    // First, verify that the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new NotFoundError('User not found');
    }

    // Get all NFTs for the user with user information
    const { data: nfts, error } = await supabase
      .from('nfts_awarded')
      .select(
        `
        id,
        user_id,
        nft_type,
        token_id_on_chain,
        minted_at,
        users!inner (
          id,
          name,
          username,
          email
        )
      `
      )
      .eq('user_id', userId)
      .order('minted_at', { ascending: false });

    if (error) {
      throw new InternalServerError(`Failed to fetch user NFTs: ${error.message}`);
    }

    // Transform the data to include user info
    const nftsWithUser: NFTAwardedWithUser[] = (nfts || []).map((nft: any) => {
      // Handle the case where users might be an array or object
      const user = Array.isArray(nft.users) ? nft.users[0] : nft.users;

      return {
        id: nft.id,
        user_id: nft.user_id,
        nft_type: nft.nft_type,
        token_id_on_chain: nft.token_id_on_chain,
        minted_at: nft.minted_at,
        user: {
          id: user?.id,
          name: user?.name,
          username: user?.username,
          email: user?.email,
        },
      };
    });

    return nftsWithUser;
  }

  async getNFTById(nftId: string): Promise<NFTAwardedWithUser | null> {
    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(nftId)) {
      throw new ValidationError('Invalid NFT ID format');
    }

    const { data: nft, error } = await supabase
      .from('nfts_awarded')
      .select(
        `
        id,
        user_id,
        nft_type,
        token_id_on_chain,
        minted_at,
        users!inner (
          id,
          name,
          username,
          email
        )
      `
      )
      .eq('id', nftId)
      .single();

    if (error || !nft) {
      return null;
    }

    // Handle the case where users might be an array or object
    const user = Array.isArray(nft.users) ? nft.users[0] : nft.users;

    return {
      id: nft.id,
      user_id: nft.user_id,
      nft_type: nft.nft_type,
      token_id_on_chain: nft.token_id_on_chain,
      minted_at: nft.minted_at,
      user: {
        id: user?.id,
        name: user?.name,
        username: user?.username,
        email: user?.email,
      },
    };
  }

  // Additional utility methods
  async getNFTsByType(nftType: string): Promise<NFTAwardedWithUser[]> {
    const { data: nfts, error } = await supabase
      .from('nfts_awarded')
      .select(
        `
        id,
        user_id,
        nft_type,
        token_id_on_chain,
        minted_at,
        users!inner (
          id,
          name,
          username,
          email
        )
      `
      )
      .eq('nft_type', nftType)
      .order('minted_at', { ascending: false });

    if (error) {
      throw new InternalServerError(`Failed to fetch NFTs by type: ${error.message}`);
    }

    // Transform the data to include user info
    const nftsWithUser: NFTAwardedWithUser[] = (nfts || []).map((nft: any) => {
      // Handle the case where users might be an array or object
      const user = Array.isArray(nft.users) ? nft.users[0] : nft.users;

      return {
        id: nft.id,
        user_id: nft.user_id,
        nft_type: nft.nft_type,
        token_id_on_chain: nft.token_id_on_chain,
        minted_at: nft.minted_at,
        user: {
          id: user?.id,
          name: user?.name,
          username: user?.username,
          email: user?.email,
        },
      };
    });

    return nftsWithUser;
  }

  async getNFTTypes(): Promise<string[]> {
    const { data: types, error } = await supabase
      .from('nfts_awarded')
      .select('nft_type');

    if (error) {
      throw new InternalServerError(`Failed to fetch NFT types: ${error.message}`);
    }

    // Get unique NFT types
    const uniqueTypes = [
      ...new Set(types?.map((item: any) => item.nft_type as string) || []),
    ] as string[];
    return uniqueTypes.sort();
  }
}

export const nftService = new NFTService(); 