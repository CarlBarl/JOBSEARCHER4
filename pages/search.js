import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SearchForm from '../components/SearchForm';
import JobCard from '../components/JobCard';
import { searchJobs } from '../lib/jobApi';

export default function SearchPage({ initialResults, searchParams }) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialResults?.hits || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalJobs, setTotalJobs] = useState(Number(initialResults?.total) || 0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [hasMore, setHasMore] = useState(true);
  
  // Observer for infinite scroll
  const observer = useRef();
  const lastJobElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, { threshold: 0.5 });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Reset jobs when search params change
  useEffect(() => {
    if (!router.isReady) return;
    
    setJobs([]);
    setPage(1);
    setHasMore(true);
  }, [router.query.query, router.query.location, router.query.remote]);
  
  // Fetch jobs when page changes or search params change
  useEffect(() => {
    // Only fetch data when router is ready and we have a search query
    if (!router.isReady) return;
    
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const offset = (page - 1) * limit;
        
        const data = await searchJobs({
          query: router.query.query || '',
          location: router.query.location || '',
          remote: router.query.remote === 'true',
          occupationField: router.query.occupationField || '',
          occupationGroup: router.query.occupationGroup || '',
          municipality: router.query.municipality || '',
          region: router.query.region || '',
          country: router.query.country || '',
          employer: router.query.employer || '',
          publishedAfter: router.query.publishedAfter || '',
          sort: router.query.sort || 'relevance-desc',
          limit,
          offset
        });

        if (data.error) {
          setError(data.error);
          if (page === 1) {
            setJobs([]);
            setTotalJobs(0);
          }
        } else {
          // Append new results for page > 1, otherwise replace
          setJobs(prevJobs => page === 1 ? data.hits : [...prevJobs, ...data.hits]);
          setTotalJobs(Number(data.total) || 0);
          setError(null);
          
          // Check if we've loaded all available jobs
          setHasMore((offset + limit) < Number(data.total));
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to fetch jobs. Please try again later.');
        if (page === 1) {
          setJobs([]);
          setTotalJobs(0);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [router.isReady, router.query, page]);
  
  return (
    <Layout 
      title={`${router.query.query ? `${router.query.query} - ` : ''}Jobs for Students in Sweden`}
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
              {loading && page === 1 ? (
                'Searching...'
              ) : error && page === 1 ? (
                'Search Error'
              ) : (
                `${totalJobs} Jobs Found${router.query.query ? ` for "${router.query.query}"` : ''}`
              )}
            </h1>
            
            {!error && totalJobs > 0 && (
              <p className="text-gray-600">
                Showing {Math.min(jobs.length, totalJobs)} of {totalJobs} jobs
              </p>
            )}
          </div>
          
          {/* Error Message */}
          {error && page === 1 && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {/* Initial Loading Indicator */}
          {loading && page === 1 && (
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
              <p>Search query: {router.query.query}</p>
              <p>Location: {router.query.location}</p>
              <p>Remote: {router.query.remote}</p>
              <p>Total jobs: {totalJobs}</p>
              <p>Current page: {page}</p>
              <p>Has more: {hasMore ? 'true' : 'false'}</p>
            </div>
          )}
          
          {/* No Results */}
          {!loading && jobs.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your search filters or search for something else.</p>
            </div>
          )}
          
          {/* Job Results */}
          {jobs.length > 0 && (
            <div className="space-y-6">
              {jobs.map((job, index) => {
                if (jobs.length === index + 1) {
                  // Apply ref to last element for infinite scroll
                  return (
                    <div ref={lastJobElementRef} key={job.id}>
                      <JobCard job={job} />
                    </div>
                  );
                } else {
                  return <JobCard key={job.id} job={job} />;
                }
              })}
            </div>
          )}
          
          {/* Loading More Indicator */}
          {loading && page > 1 && (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          
          {/* End of Results */}
          {!loading && !hasMore && jobs.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              ✓ All available jobs loaded
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export async function getServerSideProps({ query }) {
  // Only perform search if we have search parameters
  if (!query.query && !query.location && !query.remote) {
    return {
      props: {
        initialResults: { hits: [], total: 0 },
        searchParams: query
      }
    };
  }

  try {
    const results = await searchJobs({
      query: query.query || '',
      location: query.location || '',
      remote: query.remote === 'true',
      occupationField: query.occupationField || '',
      occupationGroup: query.occupationGroup || '',
      municipality: query.municipality || '',
      region: query.region || '',
      country: query.country || '',
      employer: query.employer || '',
      publishedAfter: query.publishedAfter || '',
      sort: query.sort || 'relevance-desc',
      limit: parseInt(query.limit) || 20,
      offset: parseInt(query.offset) || 0
    });
    
    return {
      props: {
        initialResults: results,
        searchParams: query
      }
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      props: {
        initialResults: { hits: [], total: 0, error: error.message },
        searchParams: query
      }
    };
  }
}