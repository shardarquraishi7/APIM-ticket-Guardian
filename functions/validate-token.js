/**
 * Cloudflare Function to validate JWT tokens using TELUS JWKS
 * This runs server-side, avoiding CORS issues
 */

const TELUS_JWKS_URL = 'https://apigw-pr.telus.com/id/jwks';
// TELUS issuer URL for future token issuer validation if needed
// const TELUS_ISSUER = 'https://apigw-pr.telus.com';

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { token } = await context.request.json();
    
    if (!token) {
      return new Response(JSON.stringify({ valid: false, error: 'No token provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await validateToken(token);
    
    return new Response(JSON.stringify(result), {
      status: result.valid ? 200 : 401,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return new Response(JSON.stringify({ valid: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function validateToken(idToken) {
  try {
    // 1. Parse JWT payload
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const [, payloadB64] = parts;
    const payload = JSON.parse(atob(payloadB64));
    
    // 2. Check basic claims
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }
    
    // 3. Verify signature against TELUS JWKS
    const isValid = await verifyTokenSignature(idToken);
    if (!isValid) {
      throw new Error('Invalid token signature');
    }
    
    return { valid: true, payload };
    
  } catch (error) {
    console.error('Token validation failed:', error);
    return { valid: false, error: error.message };
  }
}

async function verifyTokenSignature(idToken) {
  try {
    // Parse JWT header to get kid and algorithm
    const [headerB64] = idToken.split('.');
    const header = JSON.parse(atob(headerB64));
    const kid = header.kid;
    const alg = header.alg;
    
    if (!kid) {
      throw new Error('No key ID found in token header');
    }
    
    // Fetch JWKS from TELUS (server-side, no CORS issues)
    console.log('Fetching JWKS from:', TELUS_JWKS_URL);
    const jwksResponse = await fetch(TELUS_JWKS_URL);
    if (!jwksResponse.ok) {
      throw new Error(`Failed to fetch JWKS from ${TELUS_JWKS_URL}: ${jwksResponse.status}`);
    }
    
    const jwks = await jwksResponse.json();
    
    // Find matching key
    const key = jwks.keys?.find(k => k.kid === kid);
    if (!key) {
      throw new Error(`No key found for kid: ${kid}`);
    }
    
    // Import public key
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      key,
      { 
        name: 'RSASSA-PKCS1-v1_5', 
        hash: alg === 'RS256' ? 'SHA-256' : 'SHA-512' 
      },
      false,
      ['verify']
    );
    
    // Verify signature
    const [headerPart, payloadPart, signaturePart] = idToken.split('.');
    const data = new TextEncoder().encode(`${headerPart}.${payloadPart}`);
    const sig = base64UrlDecode(signaturePart);
    
    return await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      sig,
      data
    );
    
  } catch (error) {
    console.error('JWT signature verification failed:', error);
    return false;
  }
}

function base64UrlDecode(str) {
  // Convert base64url to base64
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad if necessary
  while (str.length % 4) {
    str += '=';
  }
  // Decode base64 to Uint8Array
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}