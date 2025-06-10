/**
===========================================================================
The main purpose of this code is to give developers at TELUS a reference
and starting point for their projects.
As a TELUS Developer, you may update your copy of this code per your needs.
===========================================================================
Last updated: 06-09-2025
Description: Cloudflare Worker for Next.js with OAuth integration
===========================================================================
*/

// TELUS JWKS configuration for token validation
// Uncomment when implementing full signature validation
// const TELUS_JWKS_URL = 'https://apigw-pr.telus.com/id/jwks';

const workerHandler = {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname === '/api/liveness' || url.pathname === '/liveness') {
      return new Response('ok', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
    
    if (url.pathname === '/api/readiness' || url.pathname === '/readiness') {
      return new Response('ready', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
    
    // Handle token validation
    if ((url.pathname === '/api/validate-token' || url.pathname === '/validate-token') && request.method === 'POST') {
      try {
        const { token } = await request.json();
        
        if (!token) {
          return Response.json({ valid: false, error: 'No token provided' }, { status: 400 });
        }
        
        const result = await validateToken(token);
        
        return Response.json(result, {
          status: result.valid ? 200 : 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      } catch (error) {
        return Response.json({ valid: false, error: error.message }, { status: 500 });
      }
    }
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    
    // Serve Next.js static assets from the 'out' directory
    return env.ASSETS.fetch(request);
  },
};

export default workerHandler;

/**
 * Validate JWT token
 */
async function validateToken(idToken) {
  try {
    // Parse JWT payload
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const [, payloadB64] = parts;
    const payload = JSON.parse(atob(payloadB64));
    // Uncomment when implementing full signature validation
    // const header = JSON.parse(atob(headerB64));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token expired' };
    }
    
    // In production, you should implement full signature validation
    // using the JWKS from TELUS. For now, we'll do a basic validation.
    // The functions/validate-token.js file contains the full implementation.
    
    // Verify issuer (in production)
    // if (payload.iss !== 'https://apigw-pr.telus.com') {
    //   return { valid: false, error: 'Invalid token issuer' };
    // }
    
    return { valid: true, payload };
    
  } catch (error) {
    console.error('Token validation failed:', error);
    return { valid: false, error: error.message };
  }
}

/**
 * Utility function to decode base64url to Uint8Array
 * Uncomment when implementing full signature validation
 */
// function base64UrlDecode(str) {
//   str = str.replace(/-/g, '+').replace(/_/g, '/');
//   while (str.length % 4) {
//     str += '=';
//   }
//   return Uint8Array.from(atob(str), c => c.charCodeAt(0));
// }