import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SearchForm from '../components/SearchForm';
import JobCard from '../components/JobCard';
import { searchAllJobs, getPopularLocations } from '../lib/jobApi';

export default function SearchPage({ initialResults, searchParams, locations }) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialResults?.hits || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiSources, setApiSources] = useState(initialResults?.sources || []);
  
  // Make sure we convert total to a number - it might be returned as an object {value: number}
  const [totalJobs, setTotalJobs] = useState(
    typeof initialResults?.total === 'object' && initialResults?.total?.value !== undefined
      ? initialResults.total.value
      : typeof initialResults?.total === 'number'
      ? initialResults.total
      : 0
  );
  
  // Pagination settings
  const jobsPerPage = 15;
  const currentPage = parseInt(router.query.page || '1', 10);
  const totalPages = Math.ceil(totalJobs / jobsPerPage);
  
  // Reset jobs when search params change (except page)
  useEffect(() => {
    if (!router.isReady) return;
    
    // Only reset when core search parameters change (not page)
    if (
      router.query.q !== searchParams?.q ||
      router.query.municipality !== searchParams?.municipality ||
      router.query.remote !== searchParams?.remote ||
      router.query.occupationField !== searchParams?.occupationField ||
      router.query.position !== searchParams?.position ||
      router.query.useApis !== searchParams?.useApis
    ) {
      setJobs([]);
      // Page change will be handled by router
    }
  }, [router.isReady, router.query, searchParams]);
  
  // Fetch jobs when query parameters change (including page)
  useEffect(() => {
    // Only fetch data when router is ready
    if (!router.isReady) return;
    
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const offset = (currentPage - 1) * jobsPerPage;
        
        const data = await searchAllJobs({
          q: router.query.q || '',
          remote: router.query.remote === 'true',
          occupationField: router.query.occupationField || '',
          occupationGroup: router.query.occupationGroup || '',
          municipality: router.query.municipality || '',
          region: router.query.region || '',
          country: router.query.country || '',
          employer: router.query.employer || '',
          publishedAfter: router.query.publishedAfter || '',
          excludeSource: router.query.excludeSource || '',
          sort: router.query.sort || 'pubdate-desc',
          limit: jobsPerPage,
          offset,
          abroad: router.query.abroad === 'true',
          position: router.query.position || null,
          positionRadius: router.query.positionRadius || null,
          language: router.query.language || '',
          useApis: router.query.useApis || 'both'
        });

        if (data.error) {
          setError(data.error);
          setJobs([]);
          setTotalJobs(0);
          setApiSources([]);
        } else {
          console.log(`Fetched ${data.hits.length} jobs, total:`, data.total);
          console.log('API sources used:', data.sources);
          
          setJobs(data.hits || []);
          setApiSources(data.sources || []);
          
          // Handle different total formats - could be a number or {value: number}
          if (typeof data.total === 'object' && data.total?.value !== undefined) {
            setTotalJobs(Number(data.total.value) || 0);
          } else {
            setTotalJobs(Number(data.total) || 0);
          }
          
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to fetch jobs. Please try again later.');
        setJobs([]);
        setTotalJobs(0);
        setApiSources([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [router.isReady, router.query]);
  
  // Function to change page
  const changePage = (newPage) => {
    const query = {
      ...router.query,
      page: newPage.toString()
    };
    
    // Remove page param if it's 1 (default)
    if (newPage === 1) {
      delete query.page;
    }
    
    router.push({
      pathname: router.pathname,
      query
    }, undefined, { scroll: true });
  };
  
  // Generate array of page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Current page neighborhood
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    // Sort and remove duplicates
    return [...new Set(pageNumbers)].sort((a, b) => a - b);
  };
  
  const pageNumbers = getPageNumbers();
  
  // Format the search title based on parameters
  const getSearchTitle = () => {
    const parts = [];
    
    if (router.query.q) {
      parts.push(`"${router.query.q}"`);
    }
    
    if (router.query.municipality) {
      // Try to get readable name from municipality code
      const locationName = locations?.find(loc => 
        loc.code === router.query.municipality || loc.conceptId === router.query.municipality
      )?.name;
      
      parts.push(`in ${locationName || router.query.municipality}`);
    }
    
    if (router.query.position) {
      parts.push(`near your location`);
    }
    
    if (router.query.remote === 'true') {
      parts.push('(Remote)');
    }
    
    return parts.length > 0 ? parts.join(' ') : 'All Jobs';
  };
  
  return (
    <Layout 
      title={`${getSearchTitle()} - Jobs for Students in Sweden`}
      description="Search results for student jobs, internships, and part-time work across Sweden"
    >
      {/* Search Form Section */}
      <section className="bg-blue-600 py-8">
        <div className="container mx-auto px-4">
          <SearchForm initialValues={router.query} />
        </div>
      </section>
      
      {/* Results Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Results Summary */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {loading ? (
                'Searching...'
              ) : error ? (
                'Search Error'
              ) : totalJobs > 0 ? (
                `${totalJobs.toLocaleString()} Jobs Found${router.query.q ? ` for "${router.query.q}"` : ''}`
              ) : (
                `No Jobs Found${router.query.q ? ` for "${router.query.q}"` : ''}`
              )}
            </h1>
            
            {!error && totalJobs > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-4">
                <p className="text-gray-600">
                  Showing {(currentPage - 1) * jobsPerPage + 1} - {Math.min(currentPage * jobsPerPage, totalJobs)} of {totalJobs.toLocaleString()} jobs
                </p>
                
                {apiSources && apiSources.length > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">Sources:</span>
                    <div className="flex space-x-1">
                      {apiSources.includes('jobad') && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">JobAd API</span>
                      )}
                      {apiSources.includes('jobsearch') && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full">JobSearch API</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Active Filters */}
          {Object.keys(router.query).length > 0 && !loading && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {router.query.q && (
                  <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
                    Search: {router.query.q}
                    <button
                      type="button"
                      className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-primary-600 hover:bg-primary-200 hover:text-primary-800 focus:outline-none"
                      onClick={() => {
                        const newQuery = { ...router.query };
                        delete newQuery.q;
                        router.push({ pathname: router.pathname, query: newQuery });
                      }}
                    >
                      <span className="sr-only">Remove keyword filter</span>
                      <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6.707 6.707a1 1 0 011.414 0L10 8.586l1.879-1.879a1 1 0 111.414 1.414L11.414 10l1.879 1.879a1 1 0 11-1.414 1.414L10 11.414l-1.879 1.879a1 1 0 01-1.414-1.414L8.586 10 6.707 8.121a1 1 0 010-1.414z" />
                      </svg>
                    </button>
                  </span>
                )}
                
                {router.query.position && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    Near current location
                    <button
                      type="button"
                      className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-green-600 hover:bg-green-200 hover:text-green-800 focus:outline-none"
                      onClick={() => {
                        const newQuery = { ...router.query };
                        delete newQuery.position;
                        delete newQuery.positionRadius;
                        router.push({ pathname: router.pathname, query: newQuery });
                      }}
                    >
                      <span className="sr-only">Remove location filter</span>
                      <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6.707 6.707a1 1 0 011.414 0L10 8.586l1.879-1.879a1 1 0 111.414 1.414L11.414 10l1.879 1.879a1 1 0 11-1.414 1.414L10 11.414l-1.879 1.879a1 1 0 01-1.414-1.414L8.586 10 6.707 8.121a1 1 0 010-1.414z" />
                      </svg>
                    </button>
                  </span>
                )}
                
                {router.query.municipality && (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                    Location: {locations?.find(loc => 
                      loc.code === router.query.municipality || loc.conceptId === router.query.municipality
                    )?.name || router.query.municipality}
                    <button
                      type="button"
                      className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-yellow-600 hover:bg-yellow-200 hover:text-yellow-800 focus:outline-none"
                      onClick={() => {
                        const newQuery = { ...router.query };
                        delete newQuery.municipality;
                        router.push({ pathname: router.pathname, query: newQuery });
                      }}
                    >
                      <span className="sr-only">Remove municipality filter</span>
                      <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6.707 6.707a1 1 0 011.414 0L10 8.586l1.879-1.879a1 1 0 111.414 1.414L11.414 10l1.879 1.879a1 1 0 11-1.414 1.414L10 11.414l-1.879 1.879a1 1 0 01-1.414-1.414L8.586 10 6.707 8.121a1 1 0 010-1.414z" />
                      </svg>
                    </button>
                  </span>
                )}
                
                {router.query.remote === 'true' && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    Remote work
                    <button
                      type="button"
                      className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800 focus:outline-none"
                      onClick={() => {
                        const newQuery = { ...router.query };
                        delete newQuery.remote;
                        router.push({ pathname: router.pathname, query: newQuery });
                      }}
                    >
                      <span className="sr-only">Remove remote filter</span>
                      <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6.707 6.707a1 1 0 011.414 0L10 8.586l1.879-1.879a1 1 0 111.414 1.414L11.414 10l1.879 1.879a1 1 0 11-1.414 1.414L10 11.414l-1.879 1.879a1 1 0 01-1.414-1.414L8.586 10 6.707 8.121a1 1 0 010-1.414z" />
                      </svg>
                    </button>
                  </span>
                )}

                {router.query.useApis && router.query.useApis !== 'both' && (
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                    Using: {router.query.useApis === 'jobad' ? 'JobAd API' : 'JobSearch API'}
                    <button
                      type="button"
                      className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-purple-600 hover:bg-purple-200 hover:text-purple-800 focus:outline-none"
                      onClick={() => {
                        const newQuery = { ...router.query };
                        delete newQuery.useApis;
                        router.push({ pathname: router.pathname, query: newQuery });
                      }}
                    >
                      <span className="sr-only">Reset to both APIs</span>
                      <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6.707 6.707a1 1 0 011.414 0L10 8.586l1.879-1.879a1 1 0 111.414 1.414L11.414 10l1.879 1.879a1 1 0 11-1.414 1.414L10 11.414l-1.879 1.879a1 1 0 01-1.414-1.414L8.586 10 6.707 8.121a1 1 0 010-1.414z" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          
          {/* Debug Information - Visible only in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 p-4 rounded-md mb-6 text-xs font-mono">
              <h3 className="font-bold mb-2">Debug Info:</h3>
              <p>Search query (q): {router.query.q || 'None'}</p>
              <p>Municipality: {router.query.municipality || 'None'}</p>
              <p>Position: {router.query.position || 'None'}</p>
              <p>Position Radius: {router.query.positionRadius || 'None'} km</p>
              <p>Occupation Field: {router.query.occupationField || 'None'}</p>
              <p>Occupation Group: {router.query.occupationGroup || 'None'}</p>
              <p>Region: {router.query.region || 'None'}</p>
              <p>Country: {router.query.country || 'None'}</p>
              <p>Remote: {router.query.remote === 'true' ? 'Yes' : 'No'}</p>
              <p>Abroad: {router.query.abroad === 'true' ? 'Yes' : 'No'}</p>
              <p>Exclude Source: {router.query.excludeSource || 'None'}</p>
              <p>Language: {router.query.language || 'None'}</p>
              <p>Using APIs: {router.query.useApis || 'both'}</p>
              <p>API Sources Used: {apiSources?.join(', ') || 'None'}</p>
              <p>Total jobs: {typeof totalJobs === 'number' ? totalJobs : 'N/A'}</p>
              <p>Jobs on page: {jobs.length}</p>
              <p>Page: {currentPage} / {totalPages || 1}</p>
              <p>Jobs per page: {jobsPerPage}</p>
            </div>
          )}
          
          {/* No Results */}
          {!loading && jobs.length === 0 && !error && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your search filters or search for something else.</p>
            </div>
          )}
          
          {/* Job Results */}
          {!loading && jobs.length > 0 && (
            <div className="space-y-6 mb-8">
              {jobs.map(job => (
                <JobCard 
                  key={job.id + (job.source_api || '')} 
                  job={job} 
                />
              ))}
            </div>
          )}
          
          {/* Pagination Controls */}
          {totalPages > 1 && !loading && (
            <div className="flex justify-center mt-8 pb-4">
              <nav className="flex items-center" aria-label="Pagination">
                {/* Previous Page Button */}
                <button
                  onClick={() => currentPage > 1 && changePage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md ${
                    currentPage <= 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300`}
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="sr-only">Previous</span>
                </button>
                
                {/* Page Numbers */}
                {pageNumbers.map((number, index) => {
                  // Add ellipsis between non-consecutive page numbers
                  const showEllipsisBefore = index > 0 && pageNumbers[index - 1] !== number - 1;
                  
                  return (
                    <div key={number} className="flex items-center">
                      {showEllipsisBefore && (
                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
                          ...
                        </span>
                      )}
                      
                      <button
                        onClick={() => changePage(number)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                          currentPage === number
                            ? 'z-10 bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                        }`}
                      >
                        {number}
                      </button>
                    </div>
                  );
                })}
                
                {/* Next Page Button */}
                <button
                  onClick={() => currentPage < totalPages && changePage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md ${
                    currentPage >= totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export async function getServerSideProps({ query }) {
  const currentPage = parseInt(query.page || '1', 10);
  const jobsPerPage = 15;
  const offset = (currentPage - 1) * jobsPerPage;
  const locations = getPopularLocations();
  
  try {
    const results = await searchAllJobs({
      q: query.q || '',
      remote: query.remote === 'true',
      occupationField: query.occupationField || '',
      occupationGroup: query.occupationGroup || '',
      municipality: query.municipality || '',
      region: query.region || '',
      country: query.country || '',
      employer: query.employer || '',
      publishedAfter: query.publishedAfter || '',
      excludeSource: query.excludeSource || '',
      sort: query.sort || 'pubdate-desc',
      limit: jobsPerPage,
      offset,
      abroad: query.abroad === 'true',
      position: query.position || null,
      positionRadius: query.positionRadius || null,
      language: query.language || '',
      useApis: query.useApis || 'both'
    });
    
    // If total is an object with value property, transform it
    if (typeof results.total === 'object' && results.total?.value !== undefined) {
      results.total = results.total.value;
    }
    
    return {
      props: {
        initialResults: results,
        searchParams: query,
        locations
      }
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      props: {
        initialResults: { hits: [], total: 0, error: error.message, sources: [] },
        searchParams: query,
        locations
      }
    };
  }
}