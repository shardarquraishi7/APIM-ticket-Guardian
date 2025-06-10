/**
 * OAuth Wrapper Component - Drop-in Authentication for TELUS Apps
 * 
 * Usage: Just wrap your app content with this component
 *
 * Example:
 * import OAuthWrapper from '@/components/OAuthWrapper'
 *
 * <OAuthWrapper>
 *   <YourAppContent />
 * </OAuthWrapper>
 */
'use client'
import { useEffect, useState } from 'react'

// Configuration - Update these for your setup
const OAUTH_WORKER_URL = 'https://cio-cf-oauth-worker.telus.workers.dev'

// Define types for our state
interface UserProfile {
  sub?: string;
  name?: string;
  email?: string;
  exp?: number;
  // Allow additional properties with unknown type
  [key: string]: unknown;
}

type AuthState = {
  loading: boolean;
  authenticated: boolean;
  user: UserProfile | null;
  error: string | null;
}

export default function OAuthWrapper({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    loading: true,
    authenticated: false,
    user: null,
    error: null
  })

  // Check if we're running on localhost (development mode)
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.startsWith('192.168.') ||
     window.location.hostname.endsWith('.local'))

  useEffect(() => {
    async function checkAuth() {
      // Skip OAuth entirely for localhost development
      if (isLocalhost) {
        console.log('🚀 Development mode: Skipping OAuth authentication')
        setAuthState({
          loading: false,
          authenticated: true,
          user: {
            sub: 'dev-user',
            name: 'Development User',
            email: 'dev@localhost',
            exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
          },
          error: null
        })
        return
      }
      try {
        // Check for token in URL
        const url = new URL(window.location.href)
        const idToken = url.searchParams.get('id_token')
        
        if (idToken) {
          const result = await validateToken(idToken)
          if (result.valid) {
            // Clean URL and store token
            url.searchParams.delete('id_token')
            window.history.replaceState({}, document.title, url.toString())
            setAuthState({
              loading: false,
              authenticated: true,
              user: result.payload,
              error: null
            })
            return
          } else {
            // Invalid token from URL
            url.searchParams.delete('id_token')
            window.history.replaceState({}, document.title, url.toString())
            
            if (result.isExpired) {
              // Expired token - redirect for fresh login
              redirectToOAuth()
              return
            } else {
              // Invalid token - show error
              setAuthState({
                loading: false,
                authenticated: false,
                user: null,
                error: 'Oops! We had trouble signing you in. This sometimes happens when there are temporary authentication issues. Please try refreshing the page or signing in again.'
              })
              return
            }
          }
        }

        // Check stored token
        const storedToken = getStoredToken()
        if (storedToken) {
          setAuthState({
            loading: false,
            authenticated: true,
            user: storedToken.payload,
            error: null
          })
          return
        }

        // No valid token - redirect to OAuth
        redirectToOAuth()
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthState({
          loading: false,
          authenticated: false,
          user: null,
          error: 'Authentication error. Please try again.'
        })
      }
    }

    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // We intentionally want this to run only once on mount


  async function validateToken(token: string) {
    try {
      // Parse JWT payload
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format')
      }
      
      const [, payloadB64] = parts
      const payload = JSON.parse(atob(payloadB64))
      
      // Check expiration
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        throw new Error('Token expired')
      }

      // Use server-side validation if available
      try {
        const response = await fetch('/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
        
        const result = await response.json()
        if (!result.valid) {
          throw new Error('Server validation failed')
        }
      } catch (/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _serverError
      ) {
        console.warn('Server validation unavailable, using client-side only')
      }

      // Store valid token
      localStorage.setItem('oauth_token', token)
      localStorage.setItem('oauth_user', JSON.stringify(payload))
      
      return { valid: true, payload }
    } catch (error: unknown) {
      console.error('Token validation failed:', error)
      clearStoredToken()
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        valid: false,
        error: errorMessage,
        isExpired: errorMessage === 'Token expired'
      }
    }
  }

  function getStoredToken() {
    try {
      const token = localStorage.getItem('oauth_token')
      const userInfo = localStorage.getItem('oauth_user')
      
      if (token && userInfo) {
        const payload = JSON.parse(userInfo)
        
        // Check if stored token is expired
        const now = Math.floor(Date.now() / 1000)
        if (payload.exp && payload.exp < now) {
          clearStoredToken()
          return null
        }
        
        return { token, payload }
      }
    } catch (error) {
      console.error('Error reading stored token:', error)
      clearStoredToken()
    }
    return null
  }

  function clearStoredToken() {
    localStorage.removeItem('oauth_token')
    localStorage.removeItem('oauth_user')
  }

  function redirectToOAuth() {
    const currentUrl = encodeURIComponent(window.location.href)
    const oauthUrl = `${OAUTH_WORKER_URL}/?goto=${currentUrl}`
    window.location.href = oauthUrl
  }

  // Error UI
  if (authState.error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        fontFamily: 'Arial, sans-serif',
        color: '#d32f2f', 
        backgroundColor: '#ffebee', 
        border: '1px solid #ffcdd2',
        borderRadius: '8px', 
        margin: '20px', 
        maxWidth: '500px', 
        marginLeft: 'auto', 
        marginRight: 'auto'
      }}>
        <h2 style={{ marginTop: 0 }}>Sign In Issue</h2>
        <p style={{ lineHeight: '1.5' }}>{authState.error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px', 
            backgroundColor: '#1976d2', 
            color: 'white',
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontSize: '16px',
            marginTop: '10px'
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  // Don't render anything while checking auth or if not authenticated (transparent redirect)
  if (authState.loading || !authState.authenticated) {
    return null
  }

  // Render children for authenticated users
  return children
}

// Export logout function for use in apps
export function logout() {
  localStorage.removeItem('oauth_token')
  localStorage.removeItem('oauth_user')
  window.location.href = `${OAUTH_WORKER_URL}/logout`
}

// Export user info hook for apps that need user data
export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null)
  
  useEffect(() => {
    // Check if we're running on localhost (development mode)
    const isLocalhost = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.startsWith('192.168.') ||
       window.location.hostname.endsWith('.local'))

    if (isLocalhost) {
      // Return mock user data for development
      setUser({
        sub: 'dev-user',
        name: 'Development User',
        email: 'dev@localhost',
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      })
      return
    }

    try {
      const userInfo = localStorage.getItem('oauth_user')
      if (userInfo) {
        setUser(JSON.parse(userInfo))
      }
    } catch (error) {
      console.error('Error reading user info:', error)
    }
  }, [])
  
  return user
}