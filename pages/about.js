// pages/about.js
import Layout from '../components/Layout';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <Layout 
      title="About StudentJobs | Find Jobs for Students in Sweden"
      description="Learn about StudentJobs, a platform dedicated to helping students find jobs, internships, and part-time work across Sweden"
    >
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About StudentJobs</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Connecting students with opportunities across Sweden
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="mb-4">
                StudentJobs is dedicated to helping students find meaningful employment opportunities that complement their studies and help launch their careers. We understand the unique challenges students face when balancing academic commitments with work experience needs.
              </p>
              <p className="mb-4">
                Our platform aggregates job listings from across Sweden, making it easy for students to discover part-time positions, internships, summer jobs, and entry-level opportunities that fit their skills, interests, and schedule constraints.
              </p>
              <p>
                By providing a specialized job search experience tailored to student needs, we aim to bridge the gap between education and employment, helping students gain valuable work experience while completing their studies.
              </p>
            </div>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="mb-4">
                StudentJobs uses the Swedish Public Employment Service's JobAd API to access job listings from across Sweden. This API provides a comprehensive database of job opportunities from multiple sources, including:
              </p>
              
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>The official Swedish employment service (Arbetsförmedlingen)</li>
                <li>Major job boards across Sweden</li>
                <li>Direct employer listings</li>
              </ul>
              
              <p className="mb-4">
                We've built specialized search tools and filters that help students quickly find relevant opportunities. Our platform includes:
              </p>
              
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Student-specific search filters (part-time, internships, no experience required)</li>
                <li>Location-based searching</li>
                <li>Field and industry filters</li>
                <li>Remote work options</li>
                <li>Helpful job search tips and resources</li>
              </ul>
              
              <p>
                When you find a job you're interested in, we'll connect you directly to the application process through the original job posting. Our goal is to simplify your job search, not complicate it with additional steps.
              </p>
            </div>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">API Information</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="mb-4">
                The data on StudentJobs is powered by the JobAd API, a service provided by the Swedish Public Employment Service (Arbetsförmedlingen) and JobTech Development.
              </p>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Key Features of the API:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Free to use with no registration required</li>
                <li>Contains job listings from multiple sources in one unified API</li>
                <li>Updated daily with fresh listings</li>
                <li>Uses machine learning for occupation classification</li>
                <li>Implements the Swedish classification system for occupations (SSYK)</li>
              </ul>
              
              <p className="mb-4">
                For developers interested in learning more about the JobAd API or building their own applications with it, visit:
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a 
                    href="https://jobtechdev.se/en" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    JobTech Dev Platform
                  </a>
                </li>
                <li>
                  <a 
                    href="https://links.api.jobtechdev.se" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    JobAd API Documentation
                  </a>
                </li>
              </ul>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="mb-4">
                We value your feedback and suggestions for improving StudentJobs. If you have questions, encounter issues, or want to share ideas, please contact us:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium">Email:</p>
                <p className="mb-3">support@studentjobs-example.se</p>
                
                <p className="font-medium">Follow us:</p>
                <div className="flex space-x-4 mt-2">
                  <a href="#" className="text-blue-600 hover:text-blue-800">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a href="#" className="text-blue-400 hover:text-blue-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
                    </svg>
                  </a>
                  <a href="#" className="text-pink-600 hover:text-pink-800">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                    </svg>
                  </a>
                  <a href="#" className="text-blue-800 hover:text-blue-900">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </section>
          
          <div className="mt-12 text-center">
            <Link 
              href="/"
              className="inline-block bg-blue-600 text-white py-3 px-8 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}