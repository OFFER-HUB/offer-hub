import { Router } from 'express';
import {
  registerMintedNFTHandler,
  getNFTsByUserHandler,
  getNFTByIdHandler,
  getNFTsByTypeHandler,
  getNFTTypesHandler,
} from '@/controllers/nft.controller';
import { verifyToken } from '@/middlewares/auth.middleware';

const router = Router();

// POST /api/nfts-awarded - Record NFT minting
// Protected route - requires authentication
router.post('/', verifyToken, registerMintedNFTHandler);

// GET /api/nfts-awarded/user/:id - Get all NFTs earned by user
// Public route - no authentication required
router.get('/user/:id', getNFTsByUserHandler);

// GET /api/nfts-awarded/:id - Get NFT details by ID
// Public route - no authentication required
router.get('/:id', getNFTByIdHandler);

// GET /api/nfts-awarded/type/:type - Get all NFTs by type
// Public route - no authentication required
router.get('/type/:type', getNFTsByTypeHandler);

// GET /api/nfts-awarded/types/list - Get all available NFT types
// Public route - no authentication required
router.get('/types/list', getNFTTypesHandler);

export default router;
