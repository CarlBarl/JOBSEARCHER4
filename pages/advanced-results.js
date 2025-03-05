// pages/advanced-results.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import JobCard from '../components/JobCard';
import Link from 'next/link';

export default function AdvancedResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Retrieve results from sessionStorage
    const storedResults = sessionStorage.getItem('advancedSearchResults');
    
    if (storedResults) {
      try {
        setResults(JSON.parse(storedResults));
      } catch (error) {
        console.error('Error parsing results:', error);
      }
    }
    
    setLoading(false);
  }, []);
  
  if (loading) {
    return (
      <Layout title="Loading Results...">
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center">
            <svg className="animate-spin h-12 w-12 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!results || !results.hits || results.hits.length === 0) {
    return (
      <Layout title="No Results Found">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Results Found</h1>
            <p className="mb-6">Try adjusting your search criteria to find more jobs</p>
            <Link 
              href="/advanced-search"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition-colors"
            >
              Back to Search
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Advanced Search Results">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {results.total} Jobs Found
          </h1>
          <Link 
            href="/advanced-search"
            className="text-primary-600 hover:text-primary-800"
          >
            Modify Search
          </Link>
        </div>
        
        {/* API Sources Used */}
        {results.sources && results.sources.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Sources: 
              {results.sources.includes('jobad') && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                  JobAd API
                </span>
              )}
              {results.sources.includes('jobsearch') && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                  JobSearch API
                </span>
              )}
            </p>
          </div>
        )}
        
        {/* Job Results */}
        <div className="space-y-6 mb-8">
          {results.hits.map(job => (
            <JobCard key={job.id + (job.source_api || '')} job={job} />
          ))}
        </div>
      </div>
    </Layout>
  );
}