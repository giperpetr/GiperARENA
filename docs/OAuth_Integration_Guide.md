# OAuth Integration Guide for ArenaHUB

This document outlines the OAuth integration strategy for ArenaHUB platform using Supabase Auth.

## Overview

ArenaHUB supports multiple OAuth providers for seamless user authentication across different regions and gaming communities.

## Supported Providers

### Global Providers
- **Email + Captcha** - Default authentication method (hCaptcha/reCAPTCHA)
- **Google** - Worldwide
- **Facebook** - Worldwide
- **Discord** - Gaming community favorite
- **Twitch** - Gaming streaming community

### Regional Providers

#### Russia/CIS
- **Yandex** - Largest Russian search engine
- **VKontakte (VK)** - Largest Russian social network

#### China
- **WeChat** - Super-app with 1B+ users
- **QQ** - Tencent's messaging platform

## Architecture

```
User → ArenaHUB Frontend → Supabase Auth → OAuth Provider
                                ↓
                         JWT Token Generation
                                ↓
                    User Profile Creation/Update
                                ↓
                          Role Assignment
```

## Implementation Steps

### 1. Supabase Auth Configuration

Navigate to Supabase Dashboard → Authentication → Providers

#### Enable Providers

**Google OAuth 2.0:**
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```
- Create credentials at: https://console.cloud.google.com/apis/credentials
- Authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

**Facebook OAuth:**
```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```
- Create app at: https://developers.facebook.com/apps/
- Valid OAuth Redirect URIs: `https://your-project.supabase.co/auth/v1/callback`

**Discord OAuth:**
```env
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```
- Create application at: https://discord.com/developers/applications
- Redirects: `https://your-project.supabase.co/auth/v1/callback`

**Twitch OAuth:**
```env
TWITCH_CLIENT_ID=your-twitch-client-id
TWITCH_CLIENT_SECRET=your-twitch-client-secret
```
- Register app at: https://dev.twitch.tv/console/apps
- OAuth Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

**Yandex OAuth:**
```env
YANDEX_CLIENT_ID=your-yandex-client-id
YANDEX_CLIENT_SECRET=your-yandex-client-secret
```
- Create app at: https://oauth.yandex.com/client/new
- Callback URI: `https://your-project.supabase.co/auth/v1/callback`

**VK (VKontakte) OAuth:**
```env
VK_APP_ID=your-vk-app-id
VK_APP_SECRET=your-vk-app-secret
```
- Create app at: https://vk.com/apps?act=manage
- Authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

**WeChat OAuth:**
```env
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
```
- Register app at: https://open.weixin.qq.com/
- Note: Requires verified Chinese business entity

**QQ OAuth:**
```env
QQ_APP_ID=your-qq-app-id
QQ_APP_SECRET=your-qq-app-secret
```
- Create app at: https://connect.qq.com/manage.html
- Callback URL: `https://your-project.supabase.co/auth/v1/callback`

### 2. Frontend Integration

**Supabase Client Setup:**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

**OAuth Sign In Functions:**

```typescript
// src/lib/auth.ts
import { supabase } from './supabase';
import type { Provider } from '@supabase/supabase-js';

export async function signInWithOAuth(provider: Provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('OAuth sign in error:', error);
    throw error;
  }

  return data;
}

// Provider-specific functions
export const signInWithGoogle = () => signInWithOAuth('google');
export const signInWithFacebook = () => signInWithOAuth('facebook');
export const signInWithDiscord = () => signInWithOAuth('discord');
export const signInWithTwitch = () => signInWithOAuth('twitch');

// Custom provider integrations (if needed)
export const signInWithYandex = () => signInWithOAuth('yandex' as Provider);
export const signInWithVK = () => signInWithOAuth('vk' as Provider);
export const signInWithWeChat = () => signInWithOAuth('wechat' as Provider);
export const signInWithQQ = () => signInWithOAuth('qq' as Provider);
```

**OAuth Callback Handler:**

```typescript
// src/app/auth/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the auth code from URL
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data?.session) {
          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          // Create profile if doesn't exist
          if (!profile) {
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email,
                username: data.session.user.user_metadata.preferred_username ||
                         data.session.user.email?.split('@')[0],
                avatar_url: data.session.user.user_metadata.avatar_url,
                full_name: data.session.user.user_metadata.full_name,
                oauth_provider: data.session.user.app_metadata.provider,
              });

            if (insertError) throw insertError;
          }

          // Redirect to dashboard
          router.push('/dashboard/player');
        } else {
          throw new Error('No session found');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message);
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
```

**OAuth Buttons Component:**

```typescript
// src/components/auth/OAuthButtons.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithDiscord,
  signInWithTwitch,
  signInWithYandex,
  signInWithVK,
  signInWithWeChat,
  signInWithQQ,
} from '@/lib/auth';

interface OAuthButtonsProps {
  region?: 'global' | 'russia' | 'china';
}

export function OAuthButtons({ region = 'global' }: OAuthButtonsProps) {
  const handleOAuthClick = async (signInFn: () => Promise<any>, providerName: string) => {
    try {
      await signInFn();
    } catch (error: any) {
      console.error(`${providerName} OAuth error:`, error);
      alert(`Failed to sign in with ${providerName}: ${error.message}`);
    }
  };

  const globalProviders = (
    <>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthClick(signInWithGoogle, 'Google')}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          {/* Google logo SVG */}
        </svg>
        Continue with Google
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthClick(signInWithFacebook, 'Facebook')}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          {/* Facebook logo SVG */}
        </svg>
        Continue with Facebook
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthClick(signInWithDiscord, 'Discord')}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          {/* Discord logo SVG */}
        </svg>
        Continue with Discord
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthClick(signInWithTwitch, 'Twitch')}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          {/* Twitch logo SVG */}
        </svg>
        Continue with Twitch
      </Button>
    </>
  );

  const russianProviders = (
    <>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthClick(signInWithYandex, 'Yandex')}
      >
        Yandex
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthClick(signInWithVK, 'VKontakte')}
      >
        VKontakte
      </Button>
    </>
  );

  const chineseProviders = (
    <>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthClick(signInWithWeChat, 'WeChat')}
      >
        WeChat
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthClick(signInWithQQ, 'QQ')}
      >
        QQ
      </Button>
    </>
  );

  return (
    <div className="space-y-3">
      {region === 'global' && globalProviders}
      {region === 'russia' && russianProviders}
      {region === 'china' && chineseProviders}
      {region === 'global' && (
        <div className="text-center text-sm text-muted-foreground">
          <p>More providers available based on your region</p>
        </div>
      )}
    </div>
  );
}
```

### 3. Database Schema Updates

**Update Users Table:**

```sql
-- Add OAuth-related columns to users table
ALTER TABLE arenahub.users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50);
ALTER TABLE arenahub.users ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255);
ALTER TABLE arenahub.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE arenahub.users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE arenahub.users ADD COLUMN IF NOT EXISTS locale VARCHAR(10);

-- Create index for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON arenahub.users(oauth_provider);
CREATE INDEX IF NOT EXISTS idx_users_oauth_id ON arenahub.users(oauth_id);
```

### 4. Session Management

**Auth Context Provider:**

```typescript
// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 5. Protected Routes

**Auth Middleware:**

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Arena owner routes
  if (req.nextUrl.pathname.startsWith('/dashboard/arena-owner')) {
    // Check if user has arena_owner role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session?.user.id)
      .single();

    if (profile?.role !== 'arena_owner' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/player', req.url));
    }
  }

  // Admin routes
  if (req.nextUrl.pathname.startsWith('/dashboard/admin')) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session?.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/player', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/arena/:path*'],
};
```

## Security Considerations

### 1. CSRF Protection
- Supabase Auth includes built-in CSRF protection
- Always use HTTPS in production

### 2. Token Management
- JWT tokens auto-refresh via Supabase client
- Session stored in httpOnly cookies
- 15-minute access token expiry
- 30-day refresh token expiry

### 3. Rate Limiting
- Implement rate limiting on auth endpoints
- Use Supabase Edge Functions for custom rate limits

### 4. Data Privacy
- Store minimal user data from OAuth providers
- GDPR compliance for EU users
- CCPA compliance for California users
- User consent for data collection

## Testing

### 1. Local Testing
```bash
# Use Supabase CLI for local development
npx supabase start
npx supabase functions serve

# Set environment variables
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
```

### 2. Provider Testing
- Test each OAuth provider in isolated environment
- Verify callback handling
- Check profile creation/update logic
- Test error scenarios

## Deployment Checklist

- [ ] Configure all OAuth providers in Supabase Dashboard
- [ ] Add callback URLs to each provider's settings
- [ ] Update environment variables in production
- [ ] Test OAuth flow in production environment
- [ ] Monitor auth error rates
- [ ] Set up alerts for failed auth attempts

## Troubleshooting

### Common Issues

**1. Redirect URI Mismatch:**
- Ensure callback URL matches exactly in provider settings
- Check for trailing slashes
- Verify HTTPS in production

**2. Missing User Data:**
- Some providers require additional scopes
- Check provider-specific documentation

**3. Session Not Persisting:**
- Verify cookie settings
- Check domain configuration
- Ensure HTTPS in production

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [Provider-Specific Documentation](https://supabase.com/docs/guides/auth/social-login)

---

**Last Updated:** October 29, 2025
**Status:** Implementation Ready
**Priority:** High (Final task for 100% completion)
