// NFTs Controller - Handle NFT marketplace operations
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { NFTsService } from '../services/NFTsService';

export class NFTsController {
  private nftsService: NFTsService;

  constructor() {
    this.nftsService = new NFTsService();
  }

  // Get all NFTs with filters
  async getNFTs(req: Request, res: Response) {
    try {
      const { nft_type, owner_id, is_listed, limit = 20, offset = 0 } = req.query;

      const filters: any = {};

      if (nft_type) filters.nft_type = nft_type;
      if (owner_id) filters.owner_id = owner_id;
      if (is_listed !== undefined) filters.is_listed = is_listed === 'true';

      const nfts = await this.nftsService.getNFTs(
        filters,
        Number(limit),
        Number(offset)
      );

      return res.json({
        success: true,
        data: nfts,
      });
    } catch (error) {
      console.error('Get NFTs error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch NFTs',
      });
    }
  }

  // Get NFT by ID
  async getNFTById(req: Request, res: Response) {
    try {
      const { nftId } = req.params;

      const nft = await this.nftsService.getNFTById(nftId);

      if (!nft) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'NFT not found',
        });
      }

      return res.json({
        success: true,
        data: nft,
      });
    } catch (error) {
      console.error('Get NFT error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch NFT',
      });
    }
  }

  // Get user's NFTs
  async getUserNFTs(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { nft_type, limit = 20, offset = 0 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const nfts = await this.nftsService.getUserNFTs(
        userId,
        nft_type as string | undefined,
        Number(limit),
        Number(offset)
      );

      return res.json({
        success: true,
        data: nfts,
      });
    } catch (error) {
      console.error('Get user NFTs error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch user NFTs',
      });
    }
  }

  // Mint NFT (admin/system only - usually called from blockchain service)
  async mintNFT(req: AuthRequest, res: Response) {
    try {
      const {
        owner_id,
        nft_type,
        name,
        description,
        mint_address,
        metadata_uri,
        rarity,
        attributes,
      } = req.body;

      // Validate required fields
      const requiredFields = ['owner_id', 'nft_type', 'name', 'mint_address'];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      const nft = await this.nftsService.mintNFT({
        owner_id,
        nft_type,
        name,
        description,
        mint_address,
        metadata_uri,
        rarity: rarity || 'common',
        attributes,
      });

      return res.status(201).json({
        success: true,
        data: nft,
      });
    } catch (error) {
      console.error('Mint NFT error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to mint NFT',
      });
    }
  }

  // List NFT for sale
  async listNFTForSale(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { nftId } = req.params;
      const { price } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      if (!price || price <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Valid price is required',
        });
      }

      // Verify ownership
      const nft = await this.nftsService.getNFTById(nftId);

      if (!nft) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'NFT not found',
        });
      }

      if (nft.owner_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only list your own NFTs',
        });
      }

      const updatedNFT = await this.nftsService.listNFTForSale(nftId, price);

      return res.json({
        success: true,
        data: updatedNFT,
      });
    } catch (error) {
      console.error('List NFT for sale error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to list NFT for sale',
      });
    }
  }

  // Unlist NFT from sale
  async unlistNFT(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { nftId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // Verify ownership
      const nft = await this.nftsService.getNFTById(nftId);

      if (!nft) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'NFT not found',
        });
      }

      if (nft.owner_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only unlist your own NFTs',
        });
      }

      const updatedNFT = await this.nftsService.unlistNFT(nftId);

      return res.json({
        success: true,
        data: updatedNFT,
      });
    } catch (error) {
      console.error('Unlist NFT error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to unlist NFT',
      });
    }
  }

  // Buy NFT
  async buyNFT(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { nftId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const result = await this.nftsService.buyNFT(nftId, userId);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Buy NFT error:', error);

      if (error.message === 'NFT not listed for sale') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'This NFT is not listed for sale',
        });
      }

      if (error.message === 'Cannot buy your own NFT') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'You cannot buy your own NFT',
        });
      }

      if (error.message === 'Insufficient balance') {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Insufficient PAC balance to buy this NFT',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to buy NFT',
      });
    }
  }

  // Transfer NFT
  async transferNFT(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { nftId } = req.params;
      const { to_user_id } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      if (!to_user_id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Recipient user ID is required',
        });
      }

      // Verify ownership
      const nft = await this.nftsService.getNFTById(nftId);

      if (!nft) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'NFT not found',
        });
      }

      if (nft.owner_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only transfer your own NFTs',
        });
      }

      const updatedNFT = await this.nftsService.transferNFT(nftId, to_user_id);

      return res.json({
        success: true,
        data: updatedNFT,
      });
    } catch (error) {
      console.error('Transfer NFT error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to transfer NFT',
      });
    }
  }
}
