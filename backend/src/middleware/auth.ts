// Authentication middleware
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Verify user exists in database
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, email, is_active')
        .eq('id', decoded.sub || decoded.id)
        .single();

      if (error || !user || !user.is_active) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or inactive user',
        });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
      };

      next();
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token',
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  // Try to authenticate, but don't fail if it doesn't work
  authenticate(req, res, next).catch(() => next());
}
