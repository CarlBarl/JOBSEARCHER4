/**
 * Advanced Search Functions
 * Specialized search functions leveraging both JobAd and JobSearch APIs
 */

import { searchAllJobs } from '../lib/jobApi';

/**
 * Search for student-relevant jobs with flexible parameters
 * @param {Object} options - Search options
 * @returns {Promise<Object>} - Combined search results
 */
export async function searchStudentJobs({
  keyword = '',            // General search keyword
  location = '',           // Location (city/municipality)
  field = '',              // Field of study/occupation field
  partTime = false,        // Include part-time positions
  entryLevel = false,      // Include entry-level positions
  remote = false,          // Include remote positions
  internship = false,      // Include internships
  maxResults = 50,         // Maximum results to return
  useApis = 'both'         // Which APIs to use
} = {}) {
  // Build the query string with student-relevant terms
  let query = keyword ? keyword : '';
  
  // Add student-specific terms if no specific keyword provided
  if (!keyword) {
    query = 'student';
  }
  
  // Add part-time related terms
  if (partTime) {
    query += ' deltid "part time" "part-time"';
  }
  
  // Add entry-level related terms
  if (entryLevel) {
    query += ' junior trainee "entry level" "entry-level" nybörjare "ingen erfarenhet"';
  }
  
  // Add internship related terms
  if (internship) {
    query += ' praktik internship "work placement" "summer job" "sommerjobb"';
  }
  
  // Prepare search parameters
  const searchParams = {
    q: query.trim(),
    municipality: location,
    occupationField: field,
    remote: remote,
    limit: maxResults,
    sort: 'relevance', // Sort by relevance for student searches
    useApis: useApis
  };
  
  // Execute the combined search
  return await searchAllJobs(searchParams);
}

/**
 * Search for jobs that match a specific academic degree
 * @param {string} degree - The academic degree (e.g., "Bachelor of Science", "Master in IT")
 * @param {string} location - Optional location to filter by
 * @param {string} useApis - Which APIs to use
 * @returns {Promise<Object>} - Combined search results
 */
export async function searchByDegree(degree, location = '', useApis = 'both') {
  if (!degree) {
    throw new Error('Degree is required');
  }
  
  // Map common degree abbreviations to full terms
  const degreeMap = {
    'BSc': 'Bachelor of Science',
    'BA': 'Bachelor of Arts',
    'MSc': 'Master of Science',
    'MA': 'Master of Arts',
    'PhD': 'PhD Doctorate',
    'MBA': 'Master of Business Administration'
  };
  
  // Expand the degree if it's an abbreviation
  const expandedDegree = degreeMap[degree] || degree;
  
  // Prepare degree-related search terms
  const searchTerms = [
    expandedDegree,
    degree, // Also include the original abbreviation
    'utbildning', // Swedish for "education"
    'degree',
    'examen' // Swedish for "degree"
  ];
  
  const searchParams = {
    q: searchTerms.join(' '),
    municipality: location,
    limit: 50,
    useApis: useApis
  };
  
  return await searchAllJobs(searchParams);
}

/**
 * Find jobs that are suitable for recent graduates
 * @param {string} field - Field of study or occupation
 * @param {string} location - Optional location
 * @param {string} useApis - Which APIs to use
 * @returns {Promise<Object>} - Combined search results
 */
export async function findRecentGraduateJobs(field = '', location = '', useApis = 'both') {
  const graduateTerms = [
    'recent graduate',
    'nyexaminerad', // Swedish for "recently graduated"
    'new graduate',
    'graduate program',
    'graduate scheme',
    'graduate position',
    'junior',
    'entry-level',
    'entry level',
    'trainee',
    'graduate trainee'
  ];
  
  const searchParams = {
    q: graduateTerms.join(' ') + (field ? ` ${field}` : ''),
    municipality: location,
    occupationField: field ? field : '',
    limit: 50,
    sort: 'pubdate-desc', // Recent jobs first
    useApis: useApis
  };
  
  return await searchAllJobs(searchParams);
}

/**
 * Find summer jobs and seasonal positions
 * @param {string} location - Optional location
 * @param {string} field - Optional field/industry
 * @param {string} useApis - Which APIs to use
 * @returns {Promise<Object>} - Combined search results
 */
export async function findSeasonalJobs(location = '', field = '', useApis = 'both') {
  const seasonalTerms = [
    'summer job',
    'sommarjobb', // Swedish for "summer job"
    'seasonal',
    'säsong', // Swedish for "season"
    'sommar', // Swedish for "summer"
    'summer work',
    'summer internship',
    'summer position'
  ];
  
  const searchParams = {
    q: seasonalTerms.join(' ') + (field ? ` ${field}` : ''),
    municipality: location,
    occupationField: field ? field : '',
    limit: 100, // Higher limit for seasonal jobs
    sort: 'pubdate-desc',
    useApis: useApis
  };
  
  return await searchAllJobs(searchParams);
}

/**
 * Find jobs with flexible working hours (suitable for students)
 * @param {string} location - Optional location
 * @param {string} useApis - Which APIs to use
 * @returns {Promise<Object>} - Combined search results
 */
export async function findFlexibleHourJobs(location = '', useApis = 'both') {
  const flexibleTerms = [
    'flexible hours',
    'flexible working',
    'flexibla tider', // Swedish for "flexible times"
    'flex time',
    'flextime',
    'flextid', // Swedish for "flex time"
    'part time',
    'part-time',
    'deltid', // Swedish for "part time"
    'evening work',
    'weekend work',
    'kvällsarbete', // Swedish for "evening work"
    'helgarbete' // Swedish for "weekend work"
  ];
  
  const searchParams = {
    q: flexibleTerms.join(' '),
    municipality: location,
    limit: 50,
    sort: 'pubdate-desc',
    useApis: useApis
  };
  
  return await searchAllJobs(searchParams);
}

/**
 * Find internships and practical training positions
 * @param {string} field - Field of study or occupation
 * @param {string} location - Optional location
 * @param {boolean} paid - Whether to focus on paid internships
 * @param {string} useApis - Which APIs to use
 * @returns {Promise<Object>} - Combined search results
 */
export async function findInternships(field = '', location = '', paid = false, useApis = 'both') {
  let internshipTerms = [
    'internship',
    'praktik', // Swedish for "internship"
    'practical training',
    'praktikplats', // Swedish for "internship position"
    'trainee',
    'traineeprogram', // Swedish for "trainee program"
    'work placement',
    'thesis project',
    'examensarbete', // Swedish for "thesis project"
    'degree project'
  ];
  
  if (paid) {
    internshipTerms = internshipTerms.concat([
      'paid internship',
      'paid trainee',
      'betald praktik', // Swedish for "paid internship"
      'stipend',
      'stipendium', // Swedish for "stipend"
      'salary',
      'lön' // Swedish for "salary"
    ]);
  }
  
  const searchParams = {
    q: internshipTerms.join(' ') + (field ? ` ${field}` : ''),
    municipality: location,
    occupationField: field ? field : '',
    limit: 50,
    sort: 'pubdate-desc',
    useApis: useApis
  };
  
  return await searchAllJobs(searchParams);
}

/**
 * Search for jobs with specific skill requirements
 * @param {Array<string>} skills - Array of skills to search for
 * @param {string} location - Optional location
 * @param {string} useApis - Which APIs to use
 * @returns {Promise<Object>} - Combined search results
 */
export async function searchBySkills(skills = [], location = '', useApis = 'both') {
  if (!skills.length) {
    throw new Error('At least one skill is required');
  }
  
  const searchParams = {
    q: skills.join(' '),
    municipality: location,
    limit: 50,
    sort: 'relevance',
    useApis: useApis
  };
  
  return await searchAllJobs(searchParams);
}

/**
 * Find jobs that don't require prior experience
 * @param {string} field - Optional field/industry
 * @param {string} location - Optional location
 * @param {string} useApis - Which APIs to use
 * @returns {Promise<Object>} - Combined search results
 */
export async function findNoExperienceJobs(field = '', location = '', useApis = 'both') {
  const noExperienceTerms = [
    'no experience',
    'ingen erfarenhet', // Swedish for "no experience"
    'no prior experience',
    'ingen tidigare erfarenhet', // Swedish for "no previous experience"
    'entry level',
    'entry-level',
    'nybörjare', // Swedish for "beginner"
    'junior',
    'graduate'
  ];
  
  const searchParams = {
    q: noExperienceTerms.join(' ') + (field ? ` ${field}` : ''),
    municipality: location,
    occupationField: field ? field : '',
    limit: 50,
    sort: 'pubdate-desc',
    useApis: useApis
  };
  
  return await searchAllJobs(searchParams);
}

/**
 * Combine multiple search strategies for a comprehensive student job search
 * @param {Object} options - Search options
 * @returns {Promise<Object>} - Combined search results
 */
export async function comprehensiveStudentSearch({
  field = '',
  location = '',
  keywords = [],
  flexible = false,
  remote = false,
  noExperience = true,
  maxResults = 100,
  useApis = 'both'
} = {}) {
  // Prepare a search query with multiple student-relevant terms
  const baseTerms = ['student', 'part-time', 'deltid'];
  const allTerms = [...baseTerms, ...keywords];
  
  if (noExperience) {
    allTerms.push('no experience', 'ingen erfarenhet', 'junior', 'entry-level');
  }
  
  if (flexible) {
    allTerms.push('flexible hours', 'flexibla tider', 'kvällsarbete', 'helgarbete');
  }
  
  const searchParams = {
    q: allTerms.join(' '),
    municipality: location,
    occupationField: field ? field : '',
    remote: remote,
    limit: maxResults,
    sort: 'relevance',
    useApis: useApis
  };
  
  return await searchAllJobs(searchParams);
}

/**
 * Search for on-campus jobs at universities
 * @param {string} university - University name
 * @param {string} useApis - Which APIs to use
 * @returns {Promise<Object>} - Combined search results
 */
export async function findCampusJobs(university = '', useApis = 'both') {
  if (!university) {
    throw new Error('University name is required');
  }
  
  const campusTerms = [
    'campus',
    'on campus',
    'university',
    'student job',
    'student assistant',
    'teaching assistant',
    'research assistant'
  ];
  
  const searchParams = {
    q: `${university} ${campusTerms.join(' ')}`,
    limit: 30,
    sort: 'pubdate-desc',
    useApis: useApis
  };
  
  return await searchAllJobs(searchParams);
}