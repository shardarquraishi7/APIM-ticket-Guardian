"use client";

import Link from "next/link";
import { useUser, logout } from "@/components/OAuthWrapper";

export default function AuthExamplePage() {
  const user = useUser();

  return (
    <div className="container mx-auto px-4 py-12">
      <nav className="mb-8">
        <Link href="/examples" className="text-telus-purple hover:underline">
          ← Back to Examples
        </Link>
      </nav>
      
      <h1 className="text-3xl font-bold text-telus-purple mb-6">Authentication Examples</h1>
      <p className="mb-8">
        This page demonstrates OAuth authentication using the TELUS OAuth service.
        The entire application is protected by the OAuthWrapper component.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* User Profile Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-telus-purple">Your Profile</h2>
          </div>
          <div className="card-body">
            {user ? (
              <div>
                <div className="mb-6 p-4 bg-telus-light-grey rounded-lg">
                  <h3 className="font-bold mb-2">User Information</h3>
                  <p className="mb-1"><span className="font-medium">Name:</span> {user.name || 'Not provided'}</p>
                  <p className="mb-1"><span className="font-medium">Email:</span> {user.email || 'Not provided'}</p>
                  <p className="mb-1"><span className="font-medium">Subject:</span> {user.sub || 'Not provided'}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Token Information</h3>
                  <p className="text-sm mb-2">Your session is authenticated with a secure JWT token.</p>
                  {user.exp && (
                    <p className="text-sm">
                      <span className="font-medium">Expires:</span>{' '}
                      {new Date(user.exp * 1000).toLocaleString()}
                    </p>
                  )}
                </div>
                
                <button 
                  onClick={() => logout()}
                  className="btn btn-primary w-full"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="text-center p-4">
                <p>Loading user information...</p>
              </div>
            )}
          </div>
        </div>
        
        {/* OAuth Info Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-telus-purple">About TELUS OAuth</h2>
          </div>
          <div className="card-body">
            <p className="mb-4">
              This application uses TELUS OAuth for secure authentication. The OAuth flow:
            </p>
            
            <ol className="list-decimal pl-5 mb-6 space-y-2">
              <li>User attempts to access the application</li>
              <li>OAuthWrapper component checks for a valid token</li>
              <li>If no valid token exists, user is redirected to TELUS OAuth service</li>
              <li>After authentication, user is redirected back with a token</li>
              <li>Token is validated and user session is established</li>
            </ol>
            
            <div className="p-4 bg-telus-light-grey rounded-lg mb-4">
              <h3 className="font-bold mb-2">Implementation Details</h3>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                <li>JWT tokens with secure signature validation</li>
                <li>Server-side validation via Cloudflare Functions</li>
                <li>Automatic token refresh handling</li>
                <li>Secure storage of user information</li>
              </ul>
            </div>
            
            <p className="text-sm text-telus-grey">
              For more information about TELUS OAuth integration, refer to the documentation.
            </p>
          </div>
        </div>
      </div>
      
      {/* JWT Token Information */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-telus-purple mb-4">JWT Token Security</h2>
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold text-telus-purple">How It Works</h3>
          </div>
          <div className="card-body">
            <p className="mb-4">
              The OAuth integration uses JWT (JSON Web Tokens) for secure authentication:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-telus-light-grey rounded-lg">
                <h4 className="font-bold mb-2">Header</h4>
                <p className="text-sm">Contains metadata about the token type and signing algorithm.</p>
                <pre className="mt-2 bg-gray-100 text-gray-800 p-2 rounded text-xs overflow-x-auto border">
                  {`{
  "alg": "RS256",
  "kid": "key-id",
  "typ": "JWT"
}`}
                </pre>
              </div>
              
              <div className="p-4 bg-telus-light-grey rounded-lg">
                <h4 className="font-bold mb-2">Payload</h4>
                <p className="text-sm">Contains user information and token expiration details.</p>
                <pre className="mt-2 bg-gray-100 text-gray-800 p-2 rounded text-xs overflow-x-auto border">
                  {`{
  "sub": "user-id",
  "name": "User Name",
  "email": "user@example.com",
  "exp": 1623456789
}`}
                </pre>
              </div>
              
              <div className="p-4 bg-telus-light-grey rounded-lg">
                <h4 className="font-bold mb-2">Signature</h4>
                <p className="text-sm">Verifies the token hasn&apos;t been tampered with.</p>
                <pre className="mt-2 bg-gray-100 text-gray-800 p-2 rounded text-xs overflow-x-auto border">
                  {`HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)`}
                </pre>
              </div>
            </div>
            
            <p className="text-sm">
              The token is validated on both the client and server side to ensure maximum security.
              Server-side validation uses the TELUS JWKS (JSON Web Key Set) to verify the token signature.
            </p>
          </div>
        </div>
      </section>
      
      {/* Implementation Guide */}
      <div className="bg-telus-light-grey p-6 rounded-lg">
        <h3 className="text-lg font-bold text-telus-purple mb-3">Implementation Details</h3>
        <p className="mb-4">
          This OAuth implementation includes:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">JWT-based authentication with RSA signature validation</li>
          <li className="mb-2">Server-side token validation via Cloudflare Functions</li>
          <li className="mb-2">Secure storage of user information in localStorage</li>
          <li className="mb-2">Automatic token expiration handling</li>
          <li className="mb-2">Seamless integration with the TELUS OAuth service</li>
        </ul>
        <p>
          The implementation is designed to be secure, reliable, and easy to integrate into any TELUS application.
        </p>
      </div>
    </div>
  );
}