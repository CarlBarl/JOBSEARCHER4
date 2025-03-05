// components/JobCard.js
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getJobLogoUrl, isValidLogo } from '../lib/jobApi';

export default function JobCard({ job }) {
  const datePublished = job.publication_date ? new Date(job.publication_date).toLocaleDateString('sv-SE') : 'Unknown date';
  const [imgSrc, setImgSrc] = useState('/file.svg');
  
  useEffect(() => {
    const checkAndSetLogo = async () => {
      if (!job || !job.id) return;
      
      // Get logo URL based on job ID
      const logoUrl = getJobLogoUrl(job.id);
      
      // Validate the logo using improved validation function
      const isValid = await isValidLogo(logoUrl);
      if (isValid) {
        setImgSrc(logoUrl);
      }
    };
    
    checkAndSetLogo();
  }, [job]);
  
  // Safety check for malformed job data
  if (!job) return null;
  
  // Extract employment type in a safe way
  const employmentType = job.employment_type?.label || job.employment_type?.concept_label || job.scope?.concept_label || null;
  
  // Extract location in a safe way (municipality, region, or country)
  const location = job.workplace_address?.municipality || 
                  job.workplace_addresses?.municipality ||
                  job.workplace_address?.region || 
                  job.workplace_addresses?.region ||
                  job.workplace_address?.country || 
                  job.workplace_addresses?.country ||
                  job.location?.translations?.sv_SE || 
                  job.location?.name || 
                  null;
  
  // Get description text - handle both the new API format and legacy format
  const getDescription = () => {
    if (job.brief) {
      // New API format has a 'brief' field
      return job.brief;
    } else if (typeof job.description === 'string') {
      // Legacy string format
      return job.description;
    } else if (job.description?.text) {
      // Legacy object format with text property
      return job.description.text;
    } else if (job.description?.text_formatted) {
      // Try the HTML-formatted text but strip HTML
      return job.description.text_formatted.replace(/<[^>]*>/g, '');
    }
    return 'No description available';
  };

  // Get source link URLs for applying
  const getSourceLinks = () => {
    if (job.source_links && job.source_links.length > 0) {
      return job.source_links;
    }
    
    // Fallback: try to find other URLs in the job data
    if (job.application_details?.url) {
      return [{ label: 'Apply', url: job.application_details.url }];
    }
    
    if (job.webpage_url) {
      return [{ label: 'View Job', url: job.webpage_url }];
    }
    
    return [];
  };
  
  const sourceLinks = getSourceLinks();
  const description = getDescription();
  
  return (
    <div className="bg-white rounded-xl shadow-soft-md hover:shadow-soft-lg transition-all duration-300 animate-fade-in border border-gray-100">
      <div className="p-6">
        <div className="flex items-start">
          <div className="w-14 h-14 bg-primary-50 rounded-lg mr-5 overflow-hidden relative flex-shrink-0 border border-gray-100">
            <Image 
              src={imgSrc}
              alt={`${job.employer?.name || job.company?.name || 'Company'} logo`}
              width={56}
              height={56}
              className="object-contain p-1"
              onError={() => {
                setImgSrc('/file.svg'); // Use a local fallback image
              }}
              unoptimized // Skip image optimization for external URLs that might fail
            />
          </div>
          
          <div className="flex-1">
            <Link href={`/job/${job.id}`}>
              <h3 className="text-lg font-semibold text-primary-700 mb-1.5 hover:text-primary-800 transition-colors">
                {job.headline || job.title || job.name || 'Untitled Position'}
              </h3>
            </Link>
            
            <p className="text-gray-700 font-medium mb-3">
              {job.employer?.name || job.company?.name || job.employer_name || 'Unnamed Company'}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {location && (
                <span className="inline-flex items-center text-sm py-1 px-3 bg-secondary-50 text-secondary-700 rounded-full">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {location}
                </span>
              )}
              
              {employmentType && (
                <span className="inline-flex items-center text-sm py-1 px-3 bg-primary-50 text-primary-700 rounded-full">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {employmentType}
                </span>
              )}

              {job.remote && (
                <span className="inline-flex items-center text-sm py-1 px-3 bg-green-50 text-green-700 rounded-full">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Remote
                </span>
              )}
            </div>
            
            {description && (
              <p className="text-secondary-500 text-sm line-clamp-3 mb-4">
                {description.substring(0, 200) + (description.length > 200 ? '...' : '')}
              </p>
            )}
            
            {/* Source Links / Apply Buttons */}
            {sourceLinks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {sourceLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm py-1.5 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {link.label || 'Apply'}
                  </a>
                ))}
                
                <Link
                  href={`/job/${job.id}`}
                  className="inline-flex items-center text-sm py-1.5 px-4 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  More Details
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-5 pt-4 text-sm text-secondary-500 border-t border-gray-100">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {datePublished}
          </span>
          
          {job.application_deadline && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(job.application_deadline).toLocaleDateString('sv-SE')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}