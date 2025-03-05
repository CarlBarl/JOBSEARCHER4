/**
 * JobTech Search API client
 * Provides methods for searching and retrieving job ads from the Swedish JobTech API
 * Based on the documentation at https://links.api.jobtechdev.se
 */

// API base URL as specified in documentation
const API_BASE_URL = 'https://links.api.jobtechdev.se';

/**
 * Search for jobs based on multiple criteria
 * @param {Object} options Search options
 * @returns {Promise<Object>} Search results with hits and total count
 */
export async function searchJobs({
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
  limit = 20,               // Number of results to return (1-100)
  offset = 0,               // Pagination offset (0-2000)
  abroad = false            // Include jobs from abroad alongside Swedish regional jobs
} = {}) {
  try {
    const params = new URLSearchParams();
    
    // Add free text query parameter if provided
    if (q?.trim()) {
      params.append('q', q.trim());
    }
    
    // Add geographical filters (accepts both concept IDs and numerical codes)
    if (municipality?.trim()) {
      // Special handling for Stockholm: always use the code
      if (municipality.trim() === 'Stockholm') {
        params.append('municipality', '0180');
      } 
      // Special handling for concept IDs with underscores
      else if (municipality.trim().includes('_')) {
        params.append('municipality', municipality.trim());
      }
      // Special handling for known municipality codes (numeric)
      else if (/^\d+$/.test(municipality.trim())) {
        params.append('municipality', municipality.trim());
      }
      // Otherwise pass the value as-is
      else {
        params.append('municipality', municipality.trim());
      }
    }
    
    if (region?.trim()) {
      params.append('region', region.trim());
    }
    
    if (country?.trim()) {
      // Support for negative search with country (e.g., -i46j_HmG_v64 to exclude Sweden)
      params.append('country', country.trim());
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
    
    // Add remote work filter - uses the dedicated parameter as per documentation
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
    params.append('limit', Math.min(100, Math.max(1, limit)).toString());
    params.append('offset', Math.max(0, Math.min(2000, offset)).toString());
    
    // Add sort parameter
    // Documentation supports: pubdate-desc, pubdate-asc, relevance
    if (sort && ['pubdate-desc', 'pubdate-asc', 'relevance'].includes(sort)) {
      params.append('sort', sort);
    }
    
    const url = `${API_BASE_URL}/joblinks?${params.toString()}`;
    console.log('Search request URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Search API error: ${response.status}`);
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        try {
          const errorData = await response.json();
          return { hits: [], total: 0, error: errorData.message || `API error: ${response.status}` };
        } catch (e) {
          return { hits: [], total: 0, error: `API error: ${response.status}` };
        }
      }
      
      return { hits: [], total: 0, error: getErrorMessageForStatus(response.status) };
    }
    
    const data = await response.json();
    
    return {
      hits: data.hits || [],
      total: data.total || 0,
      query: url
    };
  } catch (error) {
    console.error('Search error:', error);
    return { hits: [], total: 0, error: error.message };
  }
}

/**
 * Get a specific job ad by ID
 * @param {string} id - Job ad ID
 * @returns {Promise<Object>} Job ad details or error object
 */
export async function getJobById(id) {
  if (!id) {
    return { error: 'Job ID is required' };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/ad/${id}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Error fetching job ${id}: ${response.status}`);
      return { 
        error: getErrorMessageForStatus(response.status, id),
        status: response.status 
      };
    }
    
    const data = await response.json();
    if (!data) {
      return { error: 'Empty response from API' };
    }
    
    return data;
  } catch (error) {
    console.error(`Failed to get job with ID ${id}:`, error);
    return { error: 'Network error when fetching job details' };
  }
}

/**
 * Get URL for employer logo
 * @param {string} id - Job ad ID
 * @returns {string|null} Logo URL or null if not available
 */
export function getJobLogoUrl(id) {
  if (!id) return null;
  return `${API_BASE_URL}/ad/${id}/logo`;
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
  remote = false
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
    limit: 20
  };
  
  return searchJobs(searchParams);
}