// components/Header.js
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">StudentJobs</Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li><Link href="/search" className="hover:underline">Jobs</Link></li>
              <li><Link href="/tips" className="hover:underline">Job Search Tips</Link></li>
              <li><Link href="/about" className="hover:underline">About</Link></li>
            </ul>
          </nav>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4">
            <ul className="flex flex-col space-y-2">
              <li><Link href="/" className="block hover:bg-blue-700 px-3 py-2 rounded">Home</Link></li>
              <li><Link href="/search" className="block hover:bg-blue-700 px-3 py-2 rounded">Jobs</Link></li>
              <li><Link href="/tips" className="block hover:bg-blue-700 px-3 py-2 rounded">Job Search Tips</Link></li>
              <li><Link href="/about" className="block hover:bg-blue-700 px-3 py-2 rounded">About</Link></li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}