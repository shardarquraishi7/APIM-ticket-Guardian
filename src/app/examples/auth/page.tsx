"use client";

import Link from "next/link";

export default function AuthExamplePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <nav className="mb-8">
        <Link href="/examples" className="text-telus-purple hover:underline">
          ← Back to Examples
        </Link>
      </nav>
      
      <h1 className="text-3xl font-bold text-telus-purple mb-6">Authentication Examples</h1>
      <p className="mb-8">
        This page demonstrates various authentication flows that could be implemented in your application.
        Note that these are static examples for demonstration purposes.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Login Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-telus-purple">Login</h2>
          </div>
          <div className="card-body">
            <form className="mb-4">
              <div className="form-control">
                <label className="form-label" htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="form-input" 
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="form-control">
                <label className="form-label" htmlFor="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  className="form-input" 
                  placeholder="Enter your password"
                />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded" />
                  <span className="text-sm">Remember me</span>
                </label>
                
                <a href="#" className="text-sm text-telus-purple hover:underline">
                  Forgot password?
                </a>
              </div>
              
              <button 
                type="button" 
                className="btn btn-primary w-full mt-6"
                onClick={() => alert('This is a demo. Login is not implemented in this example.')}
              >
                Sign In
              </button>
            </form>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-telus-grey">Or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button" 
                className="btn btn-outline flex items-center justify-center gap-2"
                onClick={() => alert('This is a demo. Google login is not implemented in this example.')}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                </svg>
                Google
              </button>
              
              <button 
                type="button" 
                className="btn btn-outline flex items-center justify-center gap-2"
                onClick={() => alert('This is a demo. GitHub login is not implemented in this example.')}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>
            
            <p className="text-center mt-6 text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="text-telus-purple hover:underline">Sign up</a>
            </p>
          </div>
        </div>
        
        {/* Registration Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-telus-purple">Register</h2>
          </div>
          <div className="card-body">
            <form className="mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="form-label" htmlFor="firstName">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    className="form-input" 
                    placeholder="First name"
                  />
                </div>
                
                <div className="form-control">
                  <label className="form-label" htmlFor="lastName">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    className="form-input" 
                    placeholder="Last name"
                  />
                </div>
              </div>
              
              <div className="form-control">
                <label className="form-label" htmlFor="regEmail">Email</label>
                <input 
                  type="email" 
                  id="regEmail" 
                  className="form-input" 
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="form-control">
                <label className="form-label" htmlFor="regPassword">Password</label>
                <input 
                  type="password" 
                  id="regPassword" 
                  className="form-input" 
                  placeholder="Create a password"
                />
                <div className="text-xs text-telus-grey mt-1">
                  Password must be at least 8 characters long and include a number and a special character.
                </div>
              </div>
              
              <div className="form-control">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  className="form-input" 
                  placeholder="Confirm your password"
                />
              </div>
              
              <div className="form-control mt-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded" />
                  <span className="text-sm">I agree to the Terms of Service and Privacy Policy</span>
                </label>
              </div>
              
              <button 
                type="button" 
                className="btn btn-primary w-full mt-6"
                onClick={() => alert('This is a demo. Registration is not implemented in this example.')}
              >
                Create Account
              </button>
            </form>
            
            <p className="text-center mt-6 text-sm">
              Already have an account?{" "}
              <a href="#" className="text-telus-purple hover:underline">Sign in</a>
            </p>
          </div>
        </div>
      </div>
      
      {/* Two-Factor Authentication */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-telus-purple mb-4">Two-Factor Authentication</h2>
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold text-telus-purple">Enter Verification Code</h3>
          </div>
          <div className="card-body">
            <p className="mb-4">
              We&apos;ve sent a verification code to your email. Please enter the code below to complete the authentication process.
            </p>
            
            <div className="flex justify-center gap-2 mb-6">
              <input type="text" maxLength={1} className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-md" />
              <input type="text" maxLength={1} className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-md" />
              <input type="text" maxLength={1} className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-md" />
              <input type="text" maxLength={1} className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-md" />
              <input type="text" maxLength={1} className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-md" />
              <input type="text" maxLength={1} className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-md" />
            </div>
            
            <div className="text-center">
              <button 
                type="button" 
                className="btn btn-primary px-8"
                onClick={() => alert('This is a demo. 2FA is not implemented in this example.')}
              >
                Verify
              </button>
              
              <p className="mt-4 text-sm">
                Didn&apos;t receive a code?{" "}
                <a href="#" className="text-telus-purple hover:underline">Resend code</a>
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Implementation Guide */}
      <div className="bg-telus-light-grey p-6 rounded-lg">
        <h3 className="text-lg font-bold text-telus-purple mb-3">Implementation Guide</h3>
        <p className="mb-4">
          In a real application, authentication would be implemented using:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">Secure password hashing (e.g., bcrypt)</li>
          <li className="mb-2">JWT or session-based authentication</li>
          <li className="mb-2">HTTPS for secure data transmission</li>
          <li className="mb-2">OAuth for social login integration</li>
          <li className="mb-2">Two-factor authentication for enhanced security</li>
        </ul>
        <p>
          These examples are static representations. In a real application, you would implement 
          proper authentication flows with server-side validation and security measures.
        </p>
      </div>
    </div>
  );
}