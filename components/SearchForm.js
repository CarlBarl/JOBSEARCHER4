// components/SearchForm.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { getPopularLocations } from '../lib/jobApi';

export default function SearchForm({ initialValues = {} }) {
  const router = useRouter();
  const [q, setQ] = useState(initialValues.q || '');
  const [location, setLocation] = useState(initialValues.location || '');
  const [isRemote, setIsRemote] = useState(initialValues.remote === 'true');
  const [isAbroad, setIsAbroad] = useState(initialValues.abroad === 'true');
  
  // Get popular locations for municipality codes
  const popularLocations = getPopularLocations();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build query params, removing empty values
    const params = {};
    
    // Only add non-empty values for search query
    if (q.trim()) {
      params.q = q.trim();
    }
    
    // Handle location search - use EITHER municipality code OR add to free text
    if (location.trim()) {
      // Try to match a known municipality code
      const matchedLocation = popularLocations.find(
        loc => loc.name.toLowerCase() === location.trim().toLowerCase()
      );
      
      if (matchedLocation && matchedLocation.code) {
        // If we found a match with a code, use the code as municipality
        params.municipality = matchedLocation.code;
      } else {
        // For unknown locations, add it to the q parameter
        if (params.q) {
          params.q = `${params.q} ${location.trim()}`;
        } else {
          params.q = location.trim();
        }
      }
    }
    
    // Add remote and abroad parameters if selected
    if (isRemote) {
      params.remote = 'true';
    }
    
    if (isAbroad) {
      params.abroad = 'true';
    }
    
    // Log the search parameters for debugging
    console.log('Search params:', params);
    
    // Only navigate if we have at least one search parameter
    if (Object.keys(params).length > 0) {
      router.push({
        pathname: '/search',
        query: params
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="q" className="sr-only">What job are you looking for?</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="q"
              type="text"
              className="block w-full pl-11 pr-4 py-3.5 bg-secondary-50 border border-gray-200 rounded-lg shadow-soft placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Job title, keyword, or company"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1">
          <label htmlFor="location" className="sr-only">Where?</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              id="location"
              type="text"
              className="block w-full pl-11 pr-4 py-3.5 bg-secondary-50 border border-gray-200 rounded-lg shadow-soft placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="City or region"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              list="popular-locations"
            />
            <datalist id="popular-locations">
              {popularLocations.map(loc => (
                <option key={loc.code || loc.conceptId || loc.name} value={loc.name} />
              ))}
            </datalist>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!q.trim() && !location.trim() && !isRemote && !isAbroad}
          className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 px-6 rounded-lg shadow-soft hover:shadow-soft-md transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Search Jobs
        </button>
      </div>
      
      <div className="mt-4 ml-1 flex flex-wrap gap-x-6">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="rounded-sm text-primary-600 border-gray-300 shadow-sm focus:ring-primary-500 w-4 h-4 transition-colors"
            checked={isRemote}
            onChange={(e) => setIsRemote(e.target.checked)}
          />
          <span className="ml-2.5 text-secondary-700">Remote Work</span>
        </label>
        
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="rounded-sm text-primary-600 border-gray-300 shadow-sm focus:ring-primary-500 w-4 h-4 transition-colors"
            checked={isAbroad}
            onChange={(e) => setIsAbroad(e.target.checked)}
          />
          <span className="ml-2.5 text-secondary-700">Include Jobs Abroad</span>
        </label>
      </div>
    </form>
  );
}