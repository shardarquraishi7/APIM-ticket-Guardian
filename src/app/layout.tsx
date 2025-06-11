import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import OAuthWrapper from "@/components/OAuthWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TELUS NextJS Cloudflare Starter Kit",
  description: "A Next.js starter kit for Cloudflare Workers with TELUS styling for experimentation and prototyping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <OAuthWrapper>
          <header className="header">
            <div className="container flex justify-between items-center">
              <div className="flex items-center">
                <img
                  src="/telus-logo-black-and-white.png"
                  alt="TELUS"
                  className="h-8 mr-2"
                />
                <span className="text-sm font-medium">Next.js Cloudflare Workers Starter Kit</span>
              </div>
              <nav className="hidden md:block">
                <ul className="flex space-x-6">
                  <li><Link href="/" className="hover:text-telus-light-green">Home</Link></li>
                  <li><Link href="/dashboard" className="hover:text-telus-light-green">Dashboard</Link></li>
                  <li><Link href="/examples" className="hover:text-telus-light-green">Examples</Link></li>
                </ul>
              </nav>
              <div className="md:hidden">
                <button className="p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </header>
          
          <main className="flex-grow">
            {children}
          </main>
          
          <footer className="footer mt-auto">
            <div className="container">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center mb-4">
                    <img
                      src="/telus-logo-black-and-white.png"
                      alt="TELUS"
                      className="h-6"
                    />
                    <span className="ml-2 text-lg font-bold">Starter Kit</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    A Next.js starter kit for Cloudflare Workers with TELUS styling.
                    For experimentation and prototyping only.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4">Resources</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/docs" className="hover:text-telus-light-green">Documentation</Link></li>
                    <li><Link href="/examples" className="hover:text-telus-light-green">Examples</Link></li>
                    <li><a href="https://developers.cloudflare.com/workers/" className="hover:text-telus-light-green" target="_blank" rel="noopener noreferrer">Cloudflare Workers</a></li>
                    <li><a href="https://nextjs.org/docs" className="hover:text-telus-light-green" target="_blank" rel="noopener noreferrer">Next.js Docs</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4">Support</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="mailto:kevin.ng@telus.com" className="hover:text-telus-light-green flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        kevin.ng@telus.com
                      </a>
                    </li>
                    <li>
                      <a href="https://telus.enterprise.slack.com/archives/C08NL78AAPM" className="hover:text-telus-light-green flex items-center" target="_blank" rel="noopener noreferrer">
                        <img src="/slack-logo-bw.png" alt="Slack" className="h-4 w-4 mr-2" />
                        #tmp-simplify-deployment-experience
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4">Important Note</h3>
                  <p className="text-sm text-gray-300">
                    This starter kit is designed for experimentation and prototyping only.
                    Not intended for production use.
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
                <div className="flex items-center justify-center">
                  <img
                    src="/telus-logo-black-and-white.png"
                    alt="TELUS"
                    className="h-4 mr-2"
                  />
                  <span>&copy; {new Date().getFullYear()} TELUS. For experimental use only.</span>
                </div>
              </div>
            </div>
          </footer>
        </OAuthWrapper>
      </body>
    </html>
  );
}
