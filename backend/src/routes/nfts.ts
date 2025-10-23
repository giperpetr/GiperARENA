// NFT routes
import { Router } from 'express';
import { NFTsController } from '../controllers/NFTsController';
import { authenticate } from '../middleware/auth';
import { apiLimiter, strictLimiter } from '../middleware/rateLimit';

const router = Router();
const nftsController = new NFTsController();

// Get all NFTs (public)
router.get('/', apiLimiter, (req, res) => nftsController.getNFTs(req, res));

// Get NFT by ID (public)
router.get('/:nftId', apiLimiter, (req, res) => nftsController.getNFTById(req, res));

// All routes below require authentication
router.use(authenticate);

// Get user's NFTs
router.get('/my/nfts', apiLimiter, (req, res) => nftsController.getUserNFTs(req, res));

// Mint NFT (admin/system only)
router.post('/mint', strictLimiter, (req, res) => nftsController.mintNFT(req, res));

// List NFT for sale
router.post('/:nftId/list', apiLimiter, (req, res) =>
  nftsController.listNFTForSale(req, res)
);

// Unlist NFT
router.delete('/:nftId/list', apiLimiter, (req, res) =>
  nftsController.unlistNFT(req, res)
);

// Buy NFT
router.post('/:nftId/buy', strictLimiter, (req, res) => nftsController.buyNFT(req, res));

// Transfer NFT
router.post('/:nftId/transfer', apiLimiter, (req, res) =>
  nftsController.transferNFT(req, res)
);

export default router;
