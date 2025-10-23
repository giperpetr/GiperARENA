// NFTs Service - Business logic for NFT operations
import { pool } from '../config/database';
import { supabaseAdmin } from '../config/supabase';
import redis from '../config/redis';

export class NFTsService {
  // Get NFTs with filters
  async getNFTs(filters: any, limit: number, offset: number) {
    let query = supabaseAdmin
      .from('nfts')
      .select(
        `
        id,
        owner_id,
        nft_type,
        name,
        description,
        mint_address,
        metadata_uri,
        image_url,
        rarity,
        attributes,
        is_listed,
        list_price,
        created_at,
        users(id, username, avatar_url)
      `
      );

    // Apply filters
    if (filters.nft_type) {
      query = query.eq('nft_type', filters.nft_type);
    }
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }
    if (filters.is_listed !== undefined) {
      query = query.eq('is_listed', filters.is_listed);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data;
  }

  // Get NFT by ID
  async getNFTById(nftId: string) {
    const cacheKey = `nft:${nftId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await supabaseAdmin
      .from('nfts')
      .select(
        `
        *,
        users(id, username, avatar_url)
      `
      )
      .eq('id', nftId)
      .single();

    if (error) throw error;

    // Cache for 5 minutes
    if (data) {
      await redis.setex(cacheKey, 300, JSON.stringify(data));
    }

    return data;
  }

  // Get user's NFTs
  async getUserNFTs(userId: string, nftType?: string, limit?: number, offset?: number) {
    let query = supabaseAdmin
      .from('nfts')
      .select(
        `
        id,
        nft_type,
        name,
        description,
        mint_address,
        image_url,
        rarity,
        attributes,
        is_listed,
        list_price,
        created_at
      `
      )
      .eq('owner_id', userId);

    if (nftType) {
      query = query.eq('nft_type', nftType);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset || 0, (offset || 0) + (limit || 20) - 1);

    if (error) throw error;

    return data;
  }

  // Mint NFT
  async mintNFT(nftData: any) {
    const { data, error } = await supabaseAdmin
      .from('nfts')
      .insert({
        owner_id: nftData.owner_id,
        nft_type: nftData.nft_type,
        name: nftData.name,
        description: nftData.description,
        mint_address: nftData.mint_address,
        metadata_uri: nftData.metadata_uri,
        image_url: nftData.image_url,
        rarity: nftData.rarity || 'common',
        attributes: nftData.attributes || {},
        is_listed: false,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // List NFT for sale
  async listNFTForSale(nftId: string, price: number) {
    const { data, error } = await supabaseAdmin
      .from('nfts')
      .update({
        is_listed: true,
        list_price: price,
      })
      .eq('id', nftId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await redis.del(`nft:${nftId}`);

    return data;
  }

  // Unlist NFT
  async unlistNFT(nftId: string) {
    const { data, error } = await supabaseAdmin
      .from('nfts')
      .update({
        is_listed: false,
        list_price: null,
      })
      .eq('id', nftId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await redis.del(`nft:${nftId}`);

    return data;
  }

  // Buy NFT
  async buyNFT(nftId: string, buyerId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get NFT
      const nftResult = await client.query('SELECT * FROM giperarena.nfts WHERE id = $1', [
        nftId,
      ]);

      const nft = nftResult.rows[0];

      if (!nft) {
        throw new Error('NFT not found');
      }

      // Check if NFT is listed
      if (!nft.is_listed || !nft.list_price) {
        throw new Error('NFT not listed for sale');
      }

      // Check if buyer is not the owner
      if (nft.owner_id === buyerId) {
        throw new Error('Cannot buy your own NFT');
      }

      const price = parseFloat(nft.list_price);

      // Get buyer wallet
      const buyerWalletResult = await client.query(
        'SELECT * FROM giperarena.wallets WHERE user_id = $1',
        [buyerId]
      );

      const buyerWallet = buyerWalletResult.rows[0];

      if (!buyerWallet) {
        throw new Error('Buyer wallet not found');
      }

      // Check buyer balance
      if (parseFloat(buyerWallet.pac_balance) < price) {
        throw new Error('Insufficient balance');
      }

      // Deduct from buyer
      await client.query(
        'UPDATE giperarena.wallets SET pac_balance = pac_balance - $1 WHERE user_id = $2',
        [price, buyerId]
      );

      // Add to seller (with 5% platform fee)
      const platformFee = price * 0.05;
      const sellerAmount = price - platformFee;

      await client.query(
        'UPDATE giperarena.wallets SET pac_balance = pac_balance + $1 WHERE user_id = $2',
        [sellerAmount, nft.owner_id]
      );

      // Transfer NFT ownership
      await client.query(
        `
        UPDATE giperarena.nfts
        SET owner_id = $1, is_listed = false, list_price = NULL
        WHERE id = $2
      `,
        [buyerId, nftId]
      );

      // Create transactions
      await client.query(
        `
        INSERT INTO giperarena.transactions (
          user_id, type, amount, token_type, status, reference_id
        )
        VALUES
          ($1, 'nft_purchase', $2, 'PAC', 'completed', $3),
          ($4, 'nft_sale', $5, 'PAC', 'completed', $3)
      `,
        [buyerId, price, nftId, nft.owner_id, sellerAmount]
      );

      await client.query('COMMIT');

      // Invalidate caches
      await redis.del(`nft:${nftId}`);
      await redis.del(`wallet:${buyerId}`);
      await redis.del(`wallet:${nft.owner_id}`);

      return {
        nft_id: nftId,
        buyer_id: buyerId,
        seller_id: nft.owner_id,
        price,
        platform_fee: platformFee,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Transfer NFT
  async transferNFT(nftId: string, toUserId: string) {
    const { data, error } = await supabaseAdmin
      .from('nfts')
      .update({
        owner_id: toUserId,
        is_listed: false,
        list_price: null,
      })
      .eq('id', nftId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await redis.del(`nft:${nftId}`);

    return data;
  }
}
