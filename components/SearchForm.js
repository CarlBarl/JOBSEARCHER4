// components/SearchForm.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getPopularLocations, getTypeaheadSuggestions } from '../lib/jobApi';

export default function SearchForm({ initialValues = {} }) {
  const router = useRouter();
  const [q, setQ] = useState(initialValues.q || '');
  const [location, setLocation] = useState(initialValues.municipality || '');
  const [isRemote, setIsRemote] = useState(initialValues.remote === 'true');
  const [isAbroad, setIsAbroad] = useState(initialValues.abroad === 'true');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [position, setPosition] = useState(initialValues.position || null);
  const [radius, setRadius] = useState(initialValues.positionRadius || 10);
  const [apiChoice, setApiChoice] = useState(initialValues.useApis || 'both');
  
  // Typeahead suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef(null);
  
  // Get popular locations for municipality codes
  const popularLocations = getPopularLocations();
  
  // Fetch typeahead suggestions when user types
  useEffect(() => {
    if (!q.trim() || q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const results = await getTypeaheadSuggestions(q, apiChoice);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce the API call
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [q, apiChoice]);
  
  // Handle getting user's current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition(`${latitude},${longitude}`);
          setUseCurrentLocation(true);
          
          // Clear the location field since we're using coordinates
          setLocation('');
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your current location. Please check your browser permissions.');
          setUseCurrentLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setUseCurrentLocation(false);
    }
  };
  
  // Handle clicking a suggestion
  const handleSuggestionClick = (suggestion) => {
    setQ(suggestion.value);
    setShowSuggestions(false);
    // Focus back on the input for better UX
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build query params, removing empty values
    const params = {};
    
    // Only add non-empty values
    if (q.trim()) {
      params.q = q.trim();
    }
    
    // If using current location with coordinates
    if (useCurrentLocation && position) {
      params.position = position;
      params.positionRadius = radius.toString();
    } 
    // Otherwise use location field
    else if (location.trim()) {
      // Try to find a matching location from our popular locations
      const matchedLocation = popularLocations.find(
        loc => loc.name.toLowerCase() === location.trim().toLowerCase()
      );
      
      if (matchedLocation) {
        // For Stockholm, we know the code works better
        if (matchedLocation.name === 'Stockholm') {
          params.municipality = matchedLocation.code; // Use code (0180) for Stockholm
        } 
        // For other locations, prefer concept ID if available, fall back to code
        else if (matchedLocation.conceptId) {
          params.municipality = matchedLocation.conceptId;
        } else if (matchedLocation.code) {
          params.municipality = matchedLocation.code;
        } else {
          params.municipality = location.trim();
        }
        
        // Add debugging in dev mode
        if (process.env.NODE_ENV === 'development') {
          console.log(`Matched location: ${matchedLocation.name}`, {
            code: matchedLocation.code,
            conceptId: matchedLocation.conceptId,
            using: params.municipality
          });
        }
      } else {
        // Otherwise, just pass the raw text as municipality
        params.municipality = location.trim();
      }
    }
    
    // Add remote and abroad parameters if selected
    if (isRemote) {
      params.remote = 'true';
    }
    
    if (isAbroad) {
      params.abroad = 'true';
    }
    
    // Add API choice parameter
    params.useApis = apiChoice;
    
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
              ref={searchInputRef}
              className="block w-full pl-11 pr-4 py-3.5 bg-secondary-50 border border-gray-200 rounded-lg shadow-soft placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Job title, keyword, or company"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => q.trim().length >= 2 && setShowSuggestions(true)}
              onBlur={() => {
                // Delay hiding suggestions to allow for clicks
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />
            
            {/* Typeahead suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-primary-50 cursor-pointer flex justify-between items-center"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span>{suggestion.value}</span>
                    <span className="text-xs text-gray-500">{suggestion.occurrences} jobs</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
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
              className={`block w-full pl-11 pr-10 py-3.5 bg-secondary-50 border border-gray-200 rounded-lg shadow-soft placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${useCurrentLocation ? 'opacity-50' : ''}`}
              placeholder="City or region"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              list="popular-locations"
              disabled={useCurrentLocation}
            />
            <datalist id="popular-locations">
              {popularLocations.map(loc => (
                <option key={loc.code || loc.conceptId || loc.name} value={loc.name} />
              ))}
            </datalist>
            
            {/* Location detection button */}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-500 hover:text-primary-700"
              title={useCurrentLocation ? "Using your current location" : "Use my current location"}
            >
              {useCurrentLocation ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={(!q.trim() && !location.trim() && !useCurrentLocation) && !isRemote && !isAbroad}
          className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 px-6 rounded-lg shadow-soft hover:shadow-soft-md transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Search Jobs
        </button>
      </div>
      
      <div className="mt-4 ml-1 flex flex-wrap gap-x-6 gap-y-2">
        <div className="flex-1 min-w-0">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="rounded-sm text-primary-600 border-gray-300 shadow-sm focus:ring-primary-500 w-4 h-4 transition-colors"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
            />
            <span className="ml-2.5 text-secondary-700">Remote Work</span>
          </label>
          
          <label className="inline-flex items-center ml-6">
            <input
              type="checkbox"
              className="rounded-sm text-primary-600 border-gray-300 shadow-sm focus:ring-primary-500 w-4 h-4 transition-colors"
              checked={isAbroad}
              onChange={(e) => setIsAbroad(e.target.checked)}
            />
            <span className="ml-2.5 text-secondary-700">Include Jobs Abroad</span>
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="apiChoice" className="text-sm text-secondary-700 whitespace-nowrap">
            Search using:
          </label>
          <select
            id="apiChoice"
            value={apiChoice}
            onChange={(e) => setApiChoice(e.target.value)}
            className="rounded border border-gray-300 text-sm py-1 px-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="both">Both APIs</option>
            <option value="jobad">JobAd API</option>
            <option value="jobsearch">JobSearch API</option>
          </select>
        </div>
        
        {useCurrentLocation && (
          <div className="flex items-center ml-auto">
            <label htmlFor="radius" className="text-sm text-secondary-700 mr-2">
              Search radius:
            </label>
            <select
              id="radius"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="rounded border border-gray-300 text-sm py-1 px-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
            </select>
          </div>
        )}
      </div>
    </form>
  );
}