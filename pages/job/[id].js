// pages/job/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { getJobById, getJobLogoUrl, isValidLogo } from '../../lib/jobApi';

export default function JobDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoSrc, setLogoSrc] = useState(() => {
    // Check multiple possible logo sources
    if (job?.logo_url) {
      return job.logo_url;
    } else if (job?.employer?.logo_url) {
      return job.employer.logo_url;
    } else {
      return '/file.svg'; // Default fallback
    }
  });
  
  useEffect(() => {
    // Only fetch data when ID is available
    if (!id) return;
    
    const fetchJobDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const jobData = await getJobById(id);
        
        if (jobData.error) {
          // Handle API error
          setError(jobData.error);
          return;
        }
        
        setJob(jobData);
        
        // Check for valid logo with updated API function
        const logoUrl = getJobLogoUrl(id);
        const isValid = await isValidLogo(logoUrl);
        if (isValid) {
          setLogoSrc(logoUrl);
        }

        // After job data is retrieved, update logo URL
        if (jobData) {
          // Check multiple possible logo sources
          if (jobData.logo_url) {
            setLogoSrc(jobData.logo_url);
          } else if (jobData.employer?.logo_url) {
            setLogoSrc(jobData.employer.logo_url);
          }
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('sv-SE');
  };
  
  return (
    <Layout 
      title={job ? `${job.headline} | StudentJobs` : 'Loading Job Details'}
      description={job ? `${job.headline} at ${job.employer?.name || 'Company'} - Apply now!` : 'Job details page'}
    >
      {/* Back Button */}
      <div className="bg-secondary-50 border-b border-secondary-100">
        <div className="container mx-auto px-4 py-4">
          <Link href="/search" className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to search results
          </Link>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">
            <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-6 text-xl text-secondary-700">Loading job details...</p>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {!loading && error && (
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="bg-red-50 text-red-700 p-8 rounded-xl inline-block mx-auto shadow-soft border border-red-100 max-w-lg">
            <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-3">Error</h2>
            <p className="mb-6 text-red-600">{error}</p>
            <button 
              onClick={() => router.back()} 
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-soft text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
      
      {/* Job Details */}
      {!loading && !error && job && (
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-soft-md p-8 mb-8 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-start">
                {/* Logo */}
                <div className="w-20 h-20 bg-primary-50 rounded-lg mr-6 mb-5 md:mb-0 relative overflow-hidden flex-shrink-0 border border-gray-100">
                  <Image 
                    src={logoSrc || '/file.svg'}
                    alt={`${job.employer?.name || 'Company'} logo`}
                    width={80}
                    height={80}
                    className="object-contain p-2"
                    onError={() => {
                      setLogoSrc('/file.svg');
                    }}
                    unoptimized
                  />
                </div>
                
                {/* Job Info */}
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">{job.headline}</h1>
                  <p className="text-xl text-primary-700 font-medium mb-5">{job.employer?.name || 'Company'}</p>
                  
                  <div className="flex flex-wrap gap-3 mb-5">
                    {job.workplace_address?.municipality && (
                      <span className="inline-flex items-center bg-secondary-50 text-secondary-700 px-3 py-1.5 rounded-full text-sm">
                        <svg className="w-4 h-4 mr-1.5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.workplace_address.municipality}
                      </span>
                    )}
                    
                    {job.employment_type?.label && (
                      <span className="inline-flex items-center bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm">
                        <svg className="w-4 h-4 mr-1.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {job.employment_type.label}
                      </span>
                    )}
                    
                    {job.salary_type?.label && (
                      <span className="inline-flex items-center bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm">
                        <svg className="w-4 h-4 mr-1.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.salary_type.label}
                      </span>
                    )}
                    
                    {job.workinghourstype?.label && (
                      <span className="inline-flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
                        <svg className="w-4 h-4 mr-1.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.workinghourstype.label}
                      </span>
                    )}
                    
                    {job.remote && (
                      <span className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm">
                        <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Remote
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-8 text-sm text-secondary-600">
                    <div className="w-auto mb-2">
                      <span className="font-medium text-secondary-700">Posted:</span> {formatDate(job.publication_date)}
                    </div>
                    
                    {job.application_deadline && (
                      <div className="w-auto mb-2">
                        <span className="font-medium text-secondary-700">Apply by:</span> {formatDate(job.application_deadline)}
                      </div>
                    )}
                    
                    {job.numberofvacancies > 0 && (
                      <div className="w-auto mb-2">
                        <span className="font-medium text-secondary-700">Positions:</span> {job.numberofvacancies}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Job Description */}
              <div className="md:col-span-2 order-2 md:order-1">
                <div className="bg-white rounded-xl shadow-soft-md p-8 mb-8 border border-gray-100">
                  <h2 className="text-xl font-semibold mb-6 text-secondary-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Job Description
                  </h2>
                  
                  {job.description?.text_formatted ? (
                    <div 
                      className="prose max-w-none text-secondary-700"
                      dangerouslySetInnerHTML={{ __html: job.description.text_formatted }}
                    />
                  ) : job.description?.text ? (
                    <div className="prose max-w-none text-secondary-700">
                      {job.description.text.split('\n').map((paragraph, i) => (
                        paragraph.trim() ? <p key={i}>{paragraph}</p> : null
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary-500 italic">No description provided</p>
                  )}
                </div>
                
                {/* Requirements Section */}
                {(job.must_have?.skills?.length > 0 || job.nice_to_have?.skills?.length > 0) && (
                  <div className="bg-white rounded-xl shadow-soft-md p-8 mb-8 border border-gray-100">
                    <h2 className="text-xl font-semibold mb-6 text-secondary-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Requirements
                    </h2>
                    
                    {/* Must Have Skills */}
                    {job.must_have?.skills?.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-medium text-lg mb-3 text-secondary-700">Required Skills</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-secondary-700">
                          {job.must_have.skills.map((skill, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-5 h-5 mr-2 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              {skill.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Nice to Have Skills */}
                    {job.nice_to_have?.skills?.length > 0 && (
                      <div>
                        <h3 className="font-medium text-lg mb-3 text-secondary-700">Nice to Have</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-secondary-700">
                          {job.nice_to_have.skills.map((skill, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-5 h-5 mr-2 text-secondary-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              {skill.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Right Column - Application Info */}
              <div className="md:col-span-1 order-1 md:order-2">
                {/* Apply Button */}
                <div className="bg-white rounded-xl shadow-soft-md p-6 mb-6 border border-gray-100">
                  <h2 className="text-lg font-semibold mb-4 text-secondary-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Apply for this job
                  </h2>
                  
                  {job.source_links && job.source_links.length > 0 ? (
                    <a 
                      href={job.source_links[0].url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium py-3.5 px-5 rounded-lg text-center transition-all duration-200 shadow-soft hover:shadow-soft-md hover:-translate-y-0.5"
                    >
                      Apply on {job.source_links[0].label || 'Source Site'}
                    </a>
                  ) : job.application_details?.url ? (
                    <a 
                      href={job.application_details.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium py-3.5 px-5 rounded-lg text-center transition-all duration-200 shadow-soft hover:shadow-soft-md hover:-translate-y-0.5"
                    >
                      Apply Now
                    </a>
                  ) : job.application_details?.email ? (
                    <a 
                      href={`mailto:${job.application_details.email}?subject=Application for ${job.headline}`} 
                      className="block w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium py-3.5 px-5 rounded-lg text-center transition-all duration-200 shadow-soft hover:shadow-soft-md hover:-translate-y-0.5"
                    >
                      Apply via Email
                    </a>
                  ) : (
                    <div className="text-secondary-600 italic text-center p-4 border border-secondary-200 rounded-lg bg-secondary-50">
                      See job description for application instructions
                    </div>
                  )}
                  
                  {job.application_deadline && (
                    <div className="flex items-center justify-center mt-4 text-sm text-secondary-600">
                      <svg className="w-4 h-4 mr-1.5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Application deadline: <span className="font-medium ml-1">{formatDate(job.application_deadline)}</span>
                    </div>
                  )}
                </div>
                
                {/* Company Info */}
                <div className="bg-white rounded-xl shadow-soft-md p-6 mb-6 border border-gray-100">
                  <h2 className="text-lg font-semibold mb-4 text-secondary-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Company Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-secondary-700">Company</h3>
                      <p className="text-secondary-600">{job.employer?.name || 'Not specified'}</p>
                    </div>
                    
                    {job.employer?.website && (
                      <div>
                        <h3 className="font-medium text-secondary-700">Website</h3>
                        <a 
                          href={job.employer.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 break-words"
                        >
                          {job.employer.website}
                        </a>
                      </div>
                    )}
                    
                    {job.description?.company_information && (
                      <div>
                        <h3 className="font-medium text-secondary-700">About</h3>
                        <p className="text-secondary-600">{job.description.company_information}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Location Info */}
                {job.workplace_address && (
                  <div className="bg-white rounded-xl shadow-soft-md p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 text-secondary-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location
                    </h2>
                    
                    <div className="space-y-1.5 text-secondary-600">
                      {job.workplace_address.street_address && (
                        <p>{job.workplace_address.street_address}</p>
                      )}
                      
                      {(job.workplace_address.postcode || job.workplace_address.city) && (
                        <p>
                          {job.workplace_address.postcode && `${job.workplace_address.postcode} `}
                          {job.workplace_address.city}
                        </p>
                      )}
                      
                      {job.workplace_address.municipality && (
                        <p>{job.workplace_address.municipality}</p>
                      )}
                      
                      {job.workplace_address.region && (
                        <p>{job.workplace_address.region}</p>
                      )}
                      
                      {job.workplace_address.country && (
                        <p>{job.workplace_address.country}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}