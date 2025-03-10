/**
 * Integrated Job API Client
 * Combines both JobAd API and JobSearch API for a comprehensive job search experience
 * 
 * JobAd API: https://links.api.jobtechdev.se
 * JobSearch API: https://jobsearch.api.jobtechdev.se
 */

// API base URLs
const JOBAD_API_URL = 'https://links.api.jobtechdev.se';
const JOBSEARCH_API_URL = 'https://jobsearch.api.jobtechdev.se';

// Default search settings
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MAX_OFFSET = 2000;

/**
 * Search for jobs across both APIs and combine results
 * @param {Object} options Search options
 * @returns {Promise<Object>} Combined search results
 */
export async function searchAllJobs({
  q = '',                   // Free text search query
  occupationField = '',     // Concept ID for occupation field
  occupationGroup = '',     // Concept ID for occupation group
  municipality = '',        // Concept ID or code for municipality
  region = '',              // Concept ID or code for region
  country = '',             // Concept ID for country
  employer = '',            // Employer organization number or prefix
  remote = false,           // Whether to filter for remote work
  publishedAfter = '',      // Date to filter ads published after
  excludeSource = '',       // Source to exclude from results
  sort = 'pubdate-desc',    // Sort order (pubdate-desc, pubdate-asc, relevance)
  limit = DEFAULT_LIMIT,    // Number of results to return (1-100)
  offset = 0,               // Pagination offset (0-2000)
  abroad = false,           // Include jobs from abroad alongside Swedish regional jobs
  position = null,          // Geographical position as 'latitude,longitude' string
  positionRadius = null,    // Radius in km for position-based search
  language = '',            // Filter by language concept ID
  useApis = 'both'          // Which APIs to use: 'jobad', 'jobsearch', or 'both'
} = {}) {
  try {
    // Validate useApis parameter
    if (!['jobad', 'jobsearch', 'both'].includes(useApis)) {
      useApis = 'both'; // Default to both if invalid
    }
    
    // Adjust limit to fit within our strategy
    const adjustedLimit = Math.min(MAX_LIMIT, Math.max(1, limit));
    const adjustedOffset = Math.max(0, Math.min(MAX_OFFSET, offset));
    
    // Split the limit between APIs if using both
    const apiLimit = useApis === 'both' ? Math.ceil(adjustedLimit / 2) : adjustedLimit;
    
    // Prepare API calls based on useApis parameter
    const apiCalls = [];
    
    if (useApis === 'jobad' || useApis === 'both') {
      apiCalls.push(searchJobAdAPI({
        q, occupationField, occupationGroup, municipality, region, country, 
        employer, remote, publishedAfter, excludeSource, sort, 
        limit: apiLimit, offset: adjustedOffset, abroad, position, 
        positionRadius, language
      }));
    }
    
    if (useApis === 'jobsearch' || useApis === 'both') {
      apiCalls.push(searchJobSearchAPI({
        q, occupationField, occupationGroup, municipality, region, country, 
        employer, remote, publishedAfter, excludeSource, sort, 
        limit: apiLimit, offset: adjustedOffset, abroad, position, 
        positionRadius, language
      }));
    }
    
    // Execute API calls in parallel
    const results = await Promise.all(apiCalls);
    
    // Combine results
    if (results.length === 1) {
      // If only one API was used, return those results directly
      return results[0];
    } else {
      // If both APIs were used, combine and deduplicate results
      return combineSearchResults(results[0], results[1], adjustedLimit);
    }
  } catch (error) {
    console.error('Error searching jobs:', error);
    return { 
      hits: [], 
      total: 0, 
      error: error.message,
      sources: [] // Empty sources indicates no successful API calls
    };
  }
}

/**
 * Search for jobs using the JobAd API
 * @param {Object} options Search options
 * @returns {Promise<Object>} Search results with hits and total count
 */
export async function searchJobAdAPI({
  q = '',
  occupationField = '',
  occupationGroup = '',
  municipality = '',
  region = '',
  country = '',
  employer = '',
  remote = false,
  publishedAfter = '',
  excludeSource = '',
  sort = 'pubdate-desc',
  limit = DEFAULT_LIMIT,
  offset = 0,
  abroad = false,
  position = null,
  positionRadius = null,
  language = ''
} = {}) {
  try {
    const params = new URLSearchParams();
    
    // Add free text query parameter if provided
    if (q?.trim()) {
      params.append('q', q.trim());
    }
    
    // Add geographical filters
    if (municipality?.trim()) {
      params.append('municipality', municipality.trim());
    }
    
    if (region?.trim()) {
      params.append('region', region.trim());
    }
    
    if (country?.trim()) {
      params.append('country', country.trim());
    }
    
    // Add position-based search if coordinates are provided
    if (position) {
      params.append('position', position);
      
      // Add radius if specified (in kilometers)
      if (positionRadius && !isNaN(positionRadius)) {
        params.append('position.radius', positionRadius.toString());
      }
    }
    
    // Add occupation filters
    if (occupationField?.trim()) {
      params.append('occupation-field', occupationField.trim());
    }
    
    if (occupationGroup?.trim()) {
      params.append('occupation-group', occupationGroup.trim());
    }
    
    // Add employer filter if provided
    if (employer?.trim()) {
      params.append('employer', employer.trim());
    }
    
    // Add language filter if provided
    if (language?.trim()) {
      params.append('language', language.trim());
    }
    
    // Add remote work filter
    if (remote) {
      params.append('remote', 'true');
    }
    
    // Add abroad filter if specified
    if (abroad) {
      params.append('abroad', 'true');
    }
    
    // Add source exclusion if specified
    if (excludeSource?.trim()) {
      params.append('exclude_source', excludeSource.trim());
    }
    
    // Add date filter if provided
    if (publishedAfter) {
      params.append('published-after', formatPublishedAfterDate(publishedAfter));
    }
    
    // Pagination parameters with validation
    params.append('limit', Math.min(MAX_LIMIT, Math.max(1, limit)).toString());
    params.append('offset', Math.max(0, Math.min(MAX_OFFSET, offset)).toString());
    
    // Add sort parameter
    if (sort && ['pubdate-desc', 'pubdate-asc', 'relevance'].includes(sort)) {
      params.append('sort', sort);
    }
    
    const url = `${JOBAD_API_URL}/joblinks?${params.toString()}`;
    console.log('JobAd API request URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`JobAd API error: ${response.status}`);
      return { 
        hits: [], 
        total: 0, 
        error: getErrorMessageForStatus(response.status),
        source: 'jobad'
      };
    }
    
    const data = await response.json();
    
    return {
      hits: data.hits || [],
      total: data.total || 0,
      source: 'jobad',
      query: url
    };
  } catch (error) {
    console.error('JobAd API search error:', error);
    return { 
      hits: [], 
      total: 0, 
      error: error.message,
      source: 'jobad'
    };
  }
}

/**
 * Search for jobs using the JobSearch API
 * @param {Object} options Search options
 * @returns {Promise<Object>} Search results with hits and total count
 */
export async function searchJobSearchAPI({
  q = '',
  occupationField = '',
  occupationGroup = '',
  municipality = '',
  region = '',
  country = '',
  employer = '',
  remote = false,
  publishedAfter = '',
  excludeSource = '',
  sort = 'pubdate-desc',
  limit = DEFAULT_LIMIT,
  offset = 0,
  abroad = false,
  position = null,
  positionRadius = null,
  language = ''
} = {}) {
  try {
    const params = new URLSearchParams();
    
    // Add free text query parameter if provided
    if (q?.trim()) {
      params.append('q', q.trim());
    }
    
    // Add geographical filters - some parameter names might differ
    if (municipality?.trim()) {
      params.append('municipality', municipality.trim());
    }
    
    if (region?.trim()) {
      params.append('region', region.trim());
    }
    
    if (country?.trim()) {
      params.append('country', country.trim());
    }
    
    // Add position-based search if coordinates are provided
    if (position) {
      params.append('position', position);
      
      // Add radius if specified (in kilometers)
      if (positionRadius && !isNaN(positionRadius)) {
        params.append('position.radius', positionRadius.toString());
      }
    }
    
    // Add occupation filters
    if (occupationField?.trim()) {
      params.append('occupation-field', occupationField.trim());
    }
    
    if (occupationGroup?.trim()) {
      params.append('occupation-group', occupationGroup.trim());
    }
    
    // Add employer filter if provided
    if (employer?.trim()) {
      params.append('employer', employer.trim());
    }
    
    // Add language filter if provided
    if (language?.trim()) {
      params.append('language', language.trim());
    }
    
    // Add remote work filter
    if (remote) {
      params.append('remote', 'true');
    }
    
    // Add abroad filter if specified
    if (abroad) {
      params.append('abroad', 'true');
    }
    
    // Add date filter if provided
    if (publishedAfter) {
      params.append('published-after', formatPublishedAfterDate(publishedAfter));
    }
    
    // Pagination parameters with validation
    params.append('limit', Math.min(MAX_LIMIT, Math.max(1, limit)).toString());
    params.append('offset', Math.max(0, Math.min(MAX_OFFSET, offset)).toString());
    
    // Add sort parameter - translate if needed
    if (sort) {
      // JobSearch API might use different sorting parameters
      const sortMap = {
        'pubdate-desc': 'pubdate-desc',
        'pubdate-asc': 'pubdate-asc',
        'relevance': 'relevance'
      };
      params.append('sort', sortMap[sort] || 'pubdate-desc');
    }
    
    const url = `${JOBSEARCH_API_URL}/search?${params.toString()}`;
    console.log('JobSearch API request URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`JobSearch API error: ${response.status}`);
      return { 
        hits: [], 
        total: 0, 
        error: getErrorMessageForStatus(response.status),
        source: 'jobsearch'
      };
    }
    
    const data = await response.json();
    
    // Normalize the response to match our expected format
    return {
      hits: normalizeJobSearchHits(data.hits || []),
      total: typeof data.total === 'object' ? data.total.value : data.total || 0,
      source: 'jobsearch',
      query: url
    };
  } catch (error) {
    console.error('JobSearch API error:', error);
    return { 
      hits: [], 
      total: 0, 
      error: error.message,
      source: 'jobsearch'
    };
  }
}

/**
 * Normalize JobSearch API results to match JobAd API format
 * @param {Array} hits - Original hits from JobSearch API
 * @returns {Array} Normalized hits
 */
function normalizeJobSearchHits(hits) {
  return hits.map(hit => {
    // Maps fields that might have different structures between APIs
    return {
      ...hit,
      id: hit.id || '',
      // If JobSearch API has a different format for these fields, normalize them
      headline: hit.headline || hit.title || '',
      employer: hit.employer || { name: hit.employer_name || 'Unknown' },
      workplace_address: normalizeAddress(hit.workplace_address || hit.workplace_addresses),
      application_deadline: hit.application_deadline || '',
      source_type: 'jobsearch',
      // Add a flag to indicate this came from JobSearch API
      source_api: 'jobsearch'
    };
  });
}

/**
 * Normalize address format between APIs
 * @param {Object} address - Original address object
 * @returns {Object} Normalized address
 */
function normalizeAddress(address) {
  if (!address) return {};
  
  // Handle cases where address might be an array in one API
  const addr = Array.isArray(address) ? address[0] : address;
  
  return {
    municipality: addr.municipality || '',
    region: addr.region || '',
    country: addr.country || '',
    coordinates: addr.coordinates || null
  };
}

/**
 * Combine search results from both APIs and remove duplicates
 * @param {Object} jobAdResults - Results from JobAd API
 * @param {Object} jobSearchResults - Results from JobSearch API
 * @param {number} limit - Maximum number of results to return
 * @returns {Object} Combined search results
 */
function combineSearchResults(jobAdResults, jobSearchResults, limit) {
  // Check if either API had an error
  const errors = [];
  if (jobAdResults.error) errors.push(`JobAd API: ${jobAdResults.error}`);
  if (jobSearchResults.error) errors.push(`JobSearch API: ${jobSearchResults.error}`);
  
  // Combine hits from both APIs
  const allHits = [...(jobAdResults.hits || []), ...(jobSearchResults.hits || [])];
  
  // Remove duplicates by id (prefer JobAd API results)
  const uniqueHits = [];
  const seenIds = new Set();
  
  for (const hit of allHits) {
    if (!seenIds.has(hit.id)) {
      seenIds.add(hit.id);
      uniqueHits.push(hit);
    }
  }
  
  // Sort by publication date (newest first) if available
  const sortedHits = uniqueHits.sort((a, b) => {
    if (!a.publication_date || !b.publication_date) return 0;
    return new Date(b.publication_date) - new Date(a.publication_date);
  });
  
  // Limit to requested number
  const limitedHits = sortedHits.slice(0, limit);
  
  // Calculate total across both APIs (accounting for duplicates)
  const estimatedTotal = Math.max(
    jobAdResults.total || 0,
    jobSearchResults.total || 0
  );
  
  return {
    hits: limitedHits,
    total: estimatedTotal,
    sources: [
      jobAdResults.error ? null : 'jobad',
      jobSearchResults.error ? null : 'jobsearch'
    ].filter(Boolean),
    error: errors.length > 0 ? errors.join('; ') : null
  };
}

/**
 * Get typeahead suggestions from both APIs and combine results
 * @param {string} q - Partial search query
 * @param {string} useApis - Which APIs to use ('jobad', 'jobsearch', or 'both')
 * @returns {Promise<Array>} Combined typeahead suggestions
 */
export async function getTypeaheadSuggestions(q, useApis = 'both') {
  if (!q?.trim()) {
    return [];
  }
  
  try {
    // Validate useApis parameter
    if (!['jobad', 'jobsearch', 'both'].includes(useApis)) {
      useApis = 'both'; // Default to both if invalid
    }
    
    // Prepare API calls based on useApis parameter
    const apiCalls = [];
    
    if (useApis === 'jobad' || useApis === 'both') {
      apiCalls.push(getJobAdTypeahead(q));
    }
    
    if (useApis === 'jobsearch' || useApis === 'both') {
      apiCalls.push(getJobSearchTypeahead(q));
    }
    
    // Execute API calls in parallel
    const results = await Promise.all(apiCalls);
    
    // Combine and deduplicate results
    const allSuggestions = results.flat();
    
    // Create a map to track suggestion occurrences
    const suggestionMap = new Map();
    
    for (const suggestion of allSuggestions) {
      const value = suggestion.value || suggestion.term;
      if (!value) continue;
      
      // If this suggestion is already in our map, update the occurrences
      if (suggestionMap.has(value)) {
        const existing = suggestionMap.get(value);
        suggestionMap.set(value, {
          value,
          occurrences: existing.occurrences + (suggestion.occurrences || 1)
        });
      } else {
        // Otherwise add it
        suggestionMap.set(value, {
          value,
          occurrences: suggestion.occurrences || 1
        });
      }
    }
    
    // Convert map back to array and sort by occurrences (descending)
    return Array.from(suggestionMap.values())
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10); // Limit to top 10 suggestions
    
  } catch (error) {
    console.error('Typeahead error:', error);
    return [];
  }
}

/**
 * Get typeahead suggestions from JobAd API
 * @param {string} q - Partial search query
 * @returns {Promise<Array>} Typeahead suggestions
 */
async function getJobAdTypeahead(q) {
  try {
    const response = await fetch(`${JOBAD_API_URL}/complete?q=${encodeURIComponent(q.trim())}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`JobAd typeahead API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data?.typeahead || [];
  } catch (error) {
    console.error('JobAd typeahead error:', error);
    return [];
  }
}

/**
 * Get typeahead suggestions from JobSearch API
 * @param {string} q - Partial search query
 * @returns {Promise<Array>} Typeahead suggestions
 */
async function getJobSearchTypeahead(q) {
  try {
    const response = await fetch(`${JOBSEARCH_API_URL}/complete?q=${encodeURIComponent(q.trim())}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`JobSearch typeahead API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    // Normalize JobSearch typeahead results to match our format
    return (data?.typeahead || []).map(item => ({
      value: item.value || item.term,
      occurrences: item.occurrences || 1
    }));
  } catch (error) {
    console.error('JobSearch typeahead error:', error);
    return [];
  }
}

/**
 * Get a specific job ad by ID from both APIs
 * @param {string} id - Job ad ID
 * @returns {Promise<Object>} Job ad details or error object
 */
export async function getJobById(id) {
  if (!id) {
    return { error: 'Job ID is required' };
  }
  
  try {
    // Try JobAd API first
    const jobAdResult = await getJobFromAPI(id, 'jobad');
    
    // If JobAd API returned a valid result, use it
    if (!jobAdResult.error) {
      return jobAdResult;
    }
    
    // Otherwise try JobSearch API
    const jobSearchResult = await getJobFromAPI(id, 'jobsearch');
    
    // Return whichever result has no error, or the JobSearch one if both have errors
    return jobSearchResult;
  } catch (error) {
    console.error(`Failed to get job with ID ${id}:`, error);
    return { error: 'Network error when fetching job details' };
  }
}

/**
 * Get a job ad from a specific API
 * @param {string} id - Job ad ID
 * @param {string} api - Which API to use ('jobad' or 'jobsearch')
 * @returns {Promise<Object>} Job ad details or error object
 */
async function getJobFromAPI(id, api) {
  try {
    const baseUrl = api === 'jobad' ? JOBAD_API_URL : JOBSEARCH_API_URL;
    const endpoint = api === 'jobad' ? '/ad/' : '/ad/';
    
    const response = await fetch(`${baseUrl}${endpoint}${id}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      return { 
        error: getErrorMessageForStatus(response.status, id),
        status: response.status,
        source: api
      };
    }
    
    const data = await response.json();
    if (!data) {
      return { error: 'Empty response from API', source: api };
    }
    
    // Add a source field to indicate which API provided this data
    return { ...data, source_api: api };
  } catch (error) {
    return { 
      error: `${api} API error: ${error.message}`,
      source: api
    };
  }
}

/**
 * Get URL for employer logo
 * @param {string} id - Job ad ID
 * @param {string} api - Which API to use ('jobad', 'jobsearch', or null to try both)
 * @returns {string|null} Logo URL or null if not available
 */
export function getJobLogoUrl(id, api = null) {
  if (!id) return null;
  
  // If API is specified, use that one
  if (api === 'jobad') {
    return `${JOBAD_API_URL}/ad/${id}/logo`;
  } else if (api === 'jobsearch') {
    return `${JOBSEARCH_API_URL}/ad/${id}/logo`;
  }
  
  // Otherwise, prefer JobAd API (client code can try the other if this fails)
  return `${JOBAD_API_URL}/ad/${id}/logo`;
}

/**
 * Check if an image URL returns a valid logo
 * @param {string} imageUrl - Logo URL to check
 * @returns {Promise<boolean>} Whether the logo is valid
 */
export async function isValidLogo(imageUrl) {
  if (!imageUrl) return false;
  
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    // Logo endpoint returns a 1x1 white pixel if no logo exists
    // We need to check for actual content
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    return response.ok && 
           contentType?.startsWith('image/') && 
           (!contentLength || parseInt(contentLength, 10) > 100);
  } catch (error) {
    console.error('Error checking logo:', error);
    return false;
  }
}

/**
 * Format a date for the API's published-after parameter
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date string in ISO 8601 format (YYYY-MM-DDThh:mm:ssZ)
 */
export function formatPublishedAfterDate(date) {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Ensure format matches documentation example: "2025-01-01T00:00:00Z"
  return dateObj.toISOString();
}

/**
 * Get error message for HTTP status code
 * @param {number} status - HTTP status code
 * @param {string} [id] - Optional job ID for 404 errors
 * @returns {string} Human-readable error message
 */
function getErrorMessageForStatus(status, id = '') {
  switch (status) {
    case 400:
      return 'Bad Request: Something is wrong with the query parameters';
    case 404:
      return id ? `Missing Ad: The requested ad with ID ${id} is not available` : 'Resource not found';
    case 429:
      return 'Rate limit exceeded: You have sent too many requests in a given amount of time';
    case 500:
      return 'Internal Server Error: Server-side issue';
    default:
      return `HTTP Error: ${status}`;
  }
}

/**
 * Get popular locations in Sweden with their concept IDs
 * @returns {Array<{name: string, conceptId: string, code: string}>} Location options
 */
export function getPopularLocations() {
  return [
    { name: 'Stockholm', conceptId: 'tfRE_hXa_eq7', code: '0180' },
    { name: 'Göteborg', conceptId: null, code: '1480' },
    { name: 'Malmö', conceptId: null, code: '1280' },
    { name: 'Uppsala', conceptId: null, code: '0380' },
    { name: 'Linköping', conceptId: null, code: '0580' },
    { name: 'Örebro', conceptId: null, code: '1880' },
    { name: 'Umeå', conceptId: null, code: '2480' },
    { name: 'Luleå', conceptId: null, code: '2580' }
  ];
}

/**
 * Get Occupation Field Codes relevant for students with concept IDs
 * @returns {Array<{name: string, conceptId: string, code: string}>} Occupation fields
 */
export function getStudentOccupationFields() {
  return [
    { name: 'Data/IT', conceptId: 'apaJ_2ja_LuF', code: '3' },
    { name: 'Education', conceptId: null, code: '5' },
    { name: 'Natural Sciences/Research', conceptId: null, code: '9' },
    { name: 'Economics/Administration', conceptId: null, code: '11' },
    { name: 'Healthcare', conceptId: null, code: '12' },
    { name: 'Technology/Engineering', conceptId: null, code: '18' },
    { name: 'Culture/Media/Design', conceptId: null, code: '22' }
  ];
}

/**
 * Get student-specific search strategies as documented
 * @returns {Array<{name: string, url: string, description: string}>} Search strategies
 */
export function getStudentSearchStrategies() {
  return [
    {
      name: 'Part-time positions',
      url: 'https://links.api.jobtechdev.se/joblinks?q=deltid%20student',
      description: 'Finds part-time jobs suitable for students'
    },
    {
      name: 'Entry-level positions',
      url: 'https://links.api.jobtechdev.se/joblinks?q=junior%20trainee%20praktik',
      description: 'Finds junior, trainee, and internship positions'
    },
    {
      name: 'IT Field + Student',
      url: 'https://links.api.jobtechdev.se/joblinks?occupation-field=apaJ_2ja_LuF&q=student',
      description: 'Searches for student jobs in IT/Data field'
    },
    {
      name: 'Stockholm Student Jobs',
      url: 'https://links.api.jobtechdev.se/joblinks?municipality=0180&q=student%20deltid',
      description: 'Searches for part-time student jobs in Stockholm'
    }
  ];
}

/**
 * Advanced search example: Combining multiple parameters
 * @param {Object} options - Options for the advanced search
 * @returns {Promise<Object>} Search results
 */
export async function advancedStudentSearch({
  field = 'Data/IT',
  location = 'Stockholm',
  keywords = '',
  remote = false,
  useApis = 'both'
} = {}) {
  // Map field name to concept ID
  const fieldMap = {
    'Data/IT': 'apaJ_2ja_LuF',
    'Education': null, // Add concept IDs for other fields as needed
    'Healthcare': null
  };
  
  // Map location name to concept ID or code
  const locationMap = {
    'Stockholm': '0180',
    'Göteborg': '1480',
    'Malmö': '1280'
  };
  
  const searchParams = {
    q: keywords || 'student',
    municipality: locationMap[location] || '',
    occupationField: fieldMap[field] || '',
    remote: remote,
    sort: 'pubdate-desc',
    limit: 20,
    useApis: useApis
  };
  
  return searchAllJobs(searchParams);
}

/**
 * Find jobs that match specific Swedish language requirements abroad
 * @param {string} useApis - Which APIs to use ('jobad', 'jobsearch', or 'both')
 * @returns {Promise<Object>} Search results
 */
export async function findSwedishJobsAbroad(useApis = 'both') {
  // Svenska language concept ID
  const swedishLanguageId = 'zSLA_vw2_FXN';
  
  // Sverige country concept ID (with minus to exclude)
  const swedenCountryId = '-i46j_HmG_v64';
  
  return searchAllJobs({
    language: swedishLanguageId,
    country: swedenCountryId,
    limit: 50,
    sort: 'pubdate-desc',
    useApis: useApis
  });
}

/**
 * Search for jobs in the public sector (government)
 * @param {string} keyword - Search term
 * @param {string} useApis - Which APIs to use ('jobad', 'jobsearch', or 'both')
 * @returns {Promise<Object>} Search results
 */
export async function findPublicSectorJobs(keyword = '', useApis = 'both') {
  // All government employers in Sweden have org numbers starting with 2
  return searchAllJobs({
    employer: '2',
    q: keyword,
    limit: 50,
    sort: 'pubdate-desc',
    useApis: useApis
  });
}

/**
 * Perform a negative search to exclude specific terms
 * @param {string} include - Term to include
 * @param {string} exclude - Term to exclude
 * @param {string} useApis - Which APIs to use ('jobad', 'jobsearch', or 'both')
 * @returns {Promise<Object>} Search results
 */
export async function performNegativeSearch(include, exclude, useApis = 'both') {
  if (!include) return { hits: [], total: 0, error: 'Include term is required' };
  if (!exclude) return searchAllJobs({ q: include, useApis });
  
  return searchAllJobs({
    q: `${include} -${exclude}`,
    limit: 50,
    sort: 'pubdate-desc',
    useApis: useApis
  });
}

/**
 * Search for jobs using wildcard matching
 * @param {string} prefix - Term prefix for wildcard search
 * @param {string} useApis - Which APIs to use ('jobad', 'jobsearch', or 'both')
 * @returns {Promise<Object>} Search results
 */
export async function wildcardSearch(prefix, useApis = 'both') {
  if (!prefix) return { hits: [], total: 0, error: 'Prefix is required' };
  
  return searchAllJobs({
    q: `${prefix}*`,
    limit: 50,
    sort: 'pubdate-desc',
    useApis: useApis
  });
}

/**
 * Search for jobs with exact phrase matching
 * @param {string} phrase - Exact phrase to match
 * @param {string} useApis - Which APIs to use ('jobad', 'jobsearch', or 'both')
 * @returns {Promise<Object>} Search results
 */
export async function exactPhraseSearch(phrase, useApis = 'both') {
  if (!phrase) return { hits: [], total: 0, error: 'Phrase is required' };
  
  return searchAllJobs({
    q: `"${phrase}"`,
    limit: 50,
    sort: 'pubdate-desc',
    useApis: useApis
  });
}

/**
 * Legacy wrapper for searchJobSearchAPI for backward compatibility
 * @param {Object} options - Search parameters
 * @returns {Promise<Object>} Search results
 */
export async function searchJobs(options = {}) {
  return searchJobSearchAPI(options);
}