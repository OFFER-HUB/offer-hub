import { Request, Response, NextFunction } from 'express';
import { nftService } from '@/services/nft.service';
import { CreateNFTAwardedDTO } from '@/types/nft.types';
import { buildSuccessResponse, buildErrorResponse } from '../utils/responseBuilder';

export const registerMintedNFTHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

    const nftData: CreateNFTAwardedDTO = req.body;

    // Validate required fields
    const { user_id, nft_type, token_id_on_chain } = nftData;

    if (!user_id || !nft_type || !token_id_on_chain) {
      res.status(400).json(
        buildErrorResponse('Missing required fields: user_id, nft_type, token_id_on_chain')
      );
      return;
    }

    // Validate UUID format for user_id
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user_id)) {
      res.status(400).json(
        buildErrorResponse('Invalid user ID format')
      );
      return;
    }

    // Validate string fields are not empty
    if (nft_type.trim().length === 0 || token_id_on_chain.trim().length === 0) {
      res.status(400).json(
        buildErrorResponse('nft_type and token_id_on_chain cannot be empty')
      );
      return;
    }

    const newNFT = await nftService.registerMintedNFT(nftData);

    res.status(201).json(
      buildSuccessResponse(newNFT, 'NFT minting recorded successfully')
    );
  
};

export const getNFTsByUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

    const { id } = req.params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json(
        buildErrorResponse('Invalid user ID format')
      );
      return;
    }

    const nfts = await nftService.getNFTsByUser(id);

    res.status(200).json(
      buildSuccessResponse(nfts, 'User NFTs retrieved successfully')
    );
  
};

export const getNFTByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

    const { id } = req.params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json(
        buildErrorResponse('Invalid NFT ID format')
      );
      return;
    }

    const nft = await nftService.getNFTById(id);

    if (!nft) {
      res.status(404).json(
        buildErrorResponse('NFT not found')
      );
      return;
    }

    res.status(200).json(
      buildSuccessResponse(nft, 'NFT retrieved successfully')
    );
  
};

export const getNFTsByTypeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
 
    const { type } = req.params;

    if (!type || type.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'NFT type is required',
      });
      return;
    }

    const nfts = await nftService.getNFTsByType(type.trim());

    res.status(200).json({
      success: true,
      message: 'NFTs by type retrieved successfully',
      data: nfts,
    });
 
};

export const getNFTTypesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

    const types = await nftService.getNFTTypes();

    res.status(200).json({
      success: true,
      message: 'NFT types retrieved successfully',
      data: types,
    });
  
}; 