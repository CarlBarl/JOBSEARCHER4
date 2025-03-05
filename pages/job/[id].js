// pages/job/[id].js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { getJobById, getJobLogoUrl, isValidLogo } from '../../lib/jobApi';

export default function JobDetailsPage({ jobData, error }) {
  const router = useRouter();
  const { id, source } = router.query;
  const [job, setJob] = useState(jobData);
  const [loading, setLoading] = useState(!jobData);
  const [jobError, setJobError] = useState(error);
  const [logoUrl, setLogoUrl] = useState(null);
  const [hasValidLogo, setHasValidLogo] = useState(false);
  
  // API source that provided this job
  const jobSource = job?.source_api || source || 'jobad';
  
  // Fetch job if not provided via SSR
  useEffect(() => {
    async function fetchJob() {
      if (!id || job) return;
      
      setLoading(true);
      try {
        // If source is specified, use that API, otherwise try both
        const fetchedJob = await getJobById(id);
        
        if (fetchedJob.error) {
          setJobError(fetchedJob.error);
        } else {
          setJob(fetchedJob);
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setJobError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchJob();
  }, [id, job]);
  
  // Check for logo
  useEffect(() => {
    async function checkLogo() {
      if (!id) return;
      
      // Try to get logo URL from the API that provided the job
      const url = getJobLogoUrl(id, jobSource);
      setLogoUrl(url);
      
      if (url) {
        const valid = await isValidLogo(url);
        setHasValidLogo(valid);
        
        // If logo from primary source fails, try the other API
        if (!valid && jobSource) {
          const alternateSource = jobSource === 'jobad' ? 'jobsearch' : 'jobad';
          const alternateUrl = getJobLogoUrl(id, alternateSource);
          setLogoUrl(alternateUrl);
          const alternateValid = await isValidLogo(alternateUrl);
          setHasValidLogo(alternateValid);
        }
      }
    }
    
    checkLogo();
  }, [id, jobSource]);
  
  // Helper function to extract all requirements
  const getRequirements = () => {
    const allRequirements = [];
    
    // Must-have requirements
    if (job?.must_have) {
      if (job.must_have.skills?.length > 0) {
        allRequirements.push(...job.must_have.skills.map(skill => ({
          ...skill,
          type: 'skill',
          required: true
        })));
      }
      
      if (job.must_have.languages?.length > 0) {
        allRequirements.push(...job.must_have.languages.map(lang => ({
          ...lang,
          type: 'language',
          required: true
        })));
      }
      
      if (job.must_have.work_experiences?.length > 0) {
        allRequirements.push(...job.must_have.work_experiences.map(exp => ({
          ...exp,
          type: 'experience',
          required: true
        })));
      }
    }
    
    // Nice-to-have requirements
    if (job?.nice_to_have) {
      if (job.nice_to_have.skills?.length > 0) {
        allRequirements.push(...job.nice_to_have.skills.map(skill => ({
          ...skill,
          type: 'skill',
          required: false
        })));
      }
      
      if (job.nice_to_have.languages?.length > 0) {
        allRequirements.push(...job.nice_to_have.languages.map(lang => ({
          ...lang,
          type: 'language',
          required: false
        })));
      }
      
      if (job.nice_to_have.work_experiences?.length > 0) {
        allRequirements.push(...job.nice_to_have.work_experiences.map(exp => ({
          ...exp,
          type: 'experience',
          required: false
        })));
      }
    }
    
    return allRequirements;
  };
  
  // Parse HTML safely
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };
  
  // Format job conditions
  const getFormattedConditions = () => {
    const conditions = [];
    
    if (job?.employment_type?.label) {
      conditions.push(job.employment_type.label);
    }
    
    if (job?.workinghourstype?.label) {
      conditions.push(job.workinghourstype.label);
    }
    
    if (job?.scopeofwork) {
      const scope = job.scopeofwork.min === job.scopeofwork.max
        ? `${job.scopeofwork.min}%`
        : `${job.scopeofwork.min}-${job.scopeofwork.max}%`;
      conditions.push(scope);
    }
    
    if (job?.conditions) {
      conditions.push(job.conditions);
    }
    
    return conditions.join(' · ');
  };
  
  // Get all apply links
  const getApplyLinks = () => {
    const links = [];
    
    // Source links
    if (job?.source_links && job.source_links.length > 0) {
      links.push(...job.source_links);
    }
    
    // Application details
    if (job?.application_details?.url) {
      links.push({
        label: 'Apply Online',
        url: job.application_details.url
      });
    }
    
    // Webpage URL
    if (job?.webpage_url) {
      links.push({
        label: 'View Original',
        url: job.webpage_url
      });
    }
    
    return links;
  };
  
  if (loading) {
    return (
      <Layout title="Loading Job Details...">
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
  
  if (jobError || !job) {
    return (
      <Layout title="Job Not Found">
        <div className="container mx-auto px-4 py-16">
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
            <p className="mb-6">{jobError || 'The requested job could not be found.'}</p>
            <Link href="/search" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Search
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Get the job title
  const jobTitle = job.headline || job.title || 'Job Details';
  
  // Get employer name
  const employerName = job.employer?.name || job.company?.name || job.employer_name || 'Unnamed Company';
  
  // Get location
  const location = job.workplace_address?.municipality || 
                  job.workplace_addresses?.municipality ||
                  job.workplace_address?.region || 
                  job.workplace_addresses?.region ||
                  job.workplace_address?.country || 
                  job.workplace_addresses?.country ||
                  job.location?.translations?.sv_SE || 
                  job.location?.name || 
                  null;
  
  // Get job description
  const jobDescription = job.description?.text_formatted || 
                        job.description?.text || 
                        job.brief || '';
  
  // Get requirements array
  const requirements = getRequirements();
  
  // Get apply links
  const applyLinks = getApplyLinks();
  
  // Format job conditions
  const formattedConditions = getFormattedConditions();
  
  // Format dates
  const publishedDate = job.publication_date ? new Date(job.publication_date).toLocaleDateString('sv-SE') : null;
  const deadlineDate = job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('sv-SE') : null;
  
  return (
    <Layout title={`${jobTitle} at ${employerName} | StudentJobs`}>
      <div className="bg-primary-50 pt-10 pb-12 border-b border-primary-100">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Link 
            href="/search" 
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 mb-6"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to search results
          </Link>
          
          <div className="flex items-start gap-6">
            {/* Company logo */}
            <div className="hidden md:block bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-24 w-24 relative flex-shrink-0">
              {hasValidLogo ? (
                <Image 
                  src={logoUrl}
                  alt={`${employerName} logo`}
                  width={80}
                  height={80}
                  className="object-contain w-full h-full"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full text-3xl text-primary-700 font-bold">
                  {employerName.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between flex-wrap gap-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{jobTitle}</h1>
                
                {/* API Source Badge */}
                <span className={`text-sm px-3 py-1 rounded-full ${
                  jobSource === 'jobad' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {jobSource === 'jobad' ? 'JobAd API' : 'JobSearch API'}
                </span>
              </div>
              
              <div className="text-xl text-gray-700 mb-4">{employerName}</div>
              
              <div className="flex flex-wrap gap-3 mb-5">
                {location && (
                  <span className="inline-flex items-center text-sm py-1 px-3 bg-secondary-100 text-secondary-800 rounded-full">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {location}
                  </span>
                )}
                
                {job.remote && (
                  <span className="inline-flex items-center text-sm py-1 px-3 bg-green-100 text-green-800 rounded-full">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Remote
                  </span>
                )}
                
                {formattedConditions && (
                  <span className="inline-flex items-center text-sm py-1 px-3 bg-secondary-100 text-secondary-800 rounded-full">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {formattedConditions}
                  </span>
                )}
                
                {publishedDate && (
                  <span className="inline-flex items-center text-sm py-1 px-3 bg-secondary-100 text-secondary-800 rounded-full">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Published: {publishedDate}
                  </span>
                )}
                
                {deadlineDate && (
                  <span className="inline-flex items-center text-sm py-1 px-3 bg-yellow-100 text-yellow-800 rounded-full">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Apply by: {deadlineDate}
                  </span>
                )}
              </div>
              
              {/* Apply buttons */}
              <div className="flex flex-wrap gap-3">
                {applyLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {link.label || 'Apply'}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-5 text-gray-900">Job Description</h2>
              {jobDescription ? (
                <div 
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={createMarkup(jobDescription)}
                />
              ) : (
                <p className="text-gray-500 italic">No detailed description available.</p>
              )}
            </section>
            
            {job.company_information && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-5 text-gray-900">About the Company</h2>
                <div 
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={createMarkup(job.company_information)}
                />
              </section>
            )}
          </div>
          
          <div>
            {/* Job Requirements */}
            {requirements.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-6 py-4 bg-primary-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
                </div>
                <div className="p-5">
                  <ul className="space-y-4">
                    {requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className={`flex-shrink-0 w-5 h-5 mt-0.5 mr-3 rounded-full flex items-center justify-center ${
                          req.required
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-secondary-100 text-secondary-600'
                        }`}>
                          {req.required ? (
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                        <div>
                          <span className="block font-medium text-gray-900">
                            {req.label || req.concept_label || req.namn}
                          </span>
                          {req.type === 'experience' && req.erfarenhetsniva?.namn && (
                            <span className="text-sm text-gray-600">
                              {req.erfarenhetsniva.namn}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Contact & Application Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="px-6 py-4 bg-primary-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Contact & Application</h3>
              </div>
              <div className="p-5">
                <dl className="space-y-4">
                  {job.application_details?.information && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Application Instructions:</dt>
                      <dd className="mt-1 text-gray-700">{job.application_details.information}</dd>
                    </div>
                  )}
                  
                  {job.application_details?.reference && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Reference:</dt>
                      <dd className="mt-1 text-gray-700">{job.application_details.reference}</dd>
                    </div>
                  )}
                  
                  {job.application_details?.email && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email:</dt>
                      <dd className="mt-1 text-gray-700">
                        <a 
                          href={`mailto:${job.application_details.email}`}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          {job.application_details.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  
                  {job.employer?.phone_number && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone:</dt>
                      <dd className="mt-1 text-gray-700">
                        <a 
                          href={`tel:${job.employer.phone_number}`}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          {job.employer.phone_number}
                        </a>
                      </dd>
                    </div>
                  )}
                  
                  {job.employer?.url && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Website:</dt>
                      <dd className="mt-1 text-gray-700">
                        <a 
                          href={job.employer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800"
                        >
                          {job.employer.url}
                        </a>
                      </dd>
                    </div>
                  )}
                  
                  {applyLinks.map((link, index) => (
                    <div key={index}>
                      <dt className="text-sm font-medium text-gray-500">Apply Link:</dt>
                      <dd className="mt-1">
                        <a 
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 flex items-center"
                        >
                          {link.label || 'Apply Online'}
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </dd>
                    </div>
                  ))}
                  
                  {deadlineDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Application Deadline:</dt>
                      <dd className="mt-1 text-gray-700">{deadlineDate}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
            
            {/* Job metadata */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-primary-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
              </div>
              <div className="p-5">
                <dl className="space-y-4">
                  {job.numberofvacancies && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Number of Positions:</dt>
                      <dd className="mt-1 text-gray-700">{job.numberofvacancies}</dd>
                    </div>
                  )}
                  
                  {job.salary_description && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Salary:</dt>
                      <dd className="mt-1 text-gray-700">{job.salary_description}</dd>
                    </div>
                  )}
                  
                  {job.access && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Start Date:</dt>
                      <dd className="mt-1 text-gray-700">{job.access}</dd>
                    </div>
                  )}
                  
                  {job.employment_type?.label && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Employment Type:</dt>
                      <dd className="mt-1 text-gray-700">{job.employment_type.label}</dd>
                    </div>
                  )}
                  
                  {job.workinghourstype?.label && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Working Hours:</dt>
                      <dd className="mt-1 text-gray-700">{job.workinghourstype.label}</dd>
                    </div>
                  )}
                  
                  {job.scopeofwork && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Scope of Work:</dt>
                      <dd className="mt-1 text-gray-700">
                        {job.scopeofwork.min === job.scopeofwork.max
                          ? `${job.scopeofwork.min}%`
                          : `${job.scopeofwork.min}-${job.scopeofwork.max}%`}
                      </dd>
                    </div>
                  )}
                  
                  {job.remote && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Remote Work:</dt>
                      <dd className="mt-1 text-gray-700">Yes</dd>
                    </div>
                  )}
                  
                  {job.id && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Job ID:</dt>
                      <dd className="mt-1 text-gray-700">{job.id}</dd>
                    </div>
                  )}
                  
                  {job.source_type && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Source:</dt>
                      <dd className="mt-1 text-gray-700">{job.source_type}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ params, query }) {
  const { id } = params;
  const { source } = query;
  
  try {
    // Fetch job details
    const jobData = await getJobById(id);
    
    if (jobData.error) {
      return {
        props: {
          error: jobData.error,
          jobData: null
        }
      };
    }
    
    return {
      props: {
        jobData,
        error: null
      }
    };
  } catch (error) {
    console.error('Error fetching job details:', error);
    return {
      props: {
        error: 'Failed to load job details. Please try again later.',
        jobData: null
      }
    };
  }
}