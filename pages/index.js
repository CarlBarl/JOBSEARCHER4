// pages/index.js
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SearchForm from '../components/SearchForm';
import Link from 'next/link';
import { getStudentSearchStrategies } from '../lib/jobApi';

export default function Home() {
  const router = useRouter();
  const strategies = getStudentSearchStrategies();
  
  // Transform the strategies to the format expected by the UI
  // Fix: Don't use new URL() which might not work in all environments
  const presets = strategies.map(strategy => {
    // Extract query params from the URL string safely
    const params = {};
    
    try {
      // Extract the query part after the ? character
      const queryString = strategy.url.split('?')[1] || '';
      
      // Split into key-value pairs
      const queryParams = queryString.split('&');
      
      // Process each key-value pair
      queryParams.forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
          // Convert occupation-field to occupationField
          if (key === 'occupation-field') {
            params.occupationField = decodeURIComponent(value);
          } else if (key === 'q') {
            params.q = decodeURIComponent(value);
          } else if (key === 'municipality') {
            params.municipality = decodeURIComponent(value);
          } else if (key === 'remote') {
            params.remote = decodeURIComponent(value);
          }
        }
      });
    } catch (error) {
      console.error('Error parsing URL:', error);
    }
    
    return {
      label: strategy.name,
      params: params
    };
  });
  
  const handlePresetClick = (params) => {
    router.push({
      pathname: '/search',
      query: params
    });
  };
  
  return (
    <Layout
      title="StudentJobs | Find Student Jobs, Internships & Part-time Work"
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold mb-6 animate-fade-in">
              Find Your Perfect Student Job
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-primary-50 animate-slide-up opacity-90">
              Discover thousands of student-friendly positions across Sweden
            </p>
            
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-soft-lg animate-slide-up border border-white/20 transform transition-all">
              <SearchForm />
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Search Categories */}
      <section className="py-16 bg-secondary-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-secondary-800">Quick Job Search</h2>
          <p className="text-secondary-500 text-center mb-10 max-w-xl mx-auto">Find relevant openings with just one click using our curated job categories</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePresetClick(preset.params)}
                className="bg-white hover:bg-primary-50 border border-gray-100 rounded-xl p-5 text-center transition-all duration-300 shadow-soft hover:shadow-soft-md hover:-translate-y-1 group"
              >
                <h3 className="font-medium text-primary-700 group-hover:text-primary-800">{preset.label}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-secondary-800">Why Use StudentJobs?</h2>
            <p className="text-secondary-500 text-center mb-12 max-w-2xl mx-auto">Our platform is specifically designed with students in mind, making your job search easier and more effective</p>
            
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div className="text-center bg-white p-6 rounded-xl shadow-soft border border-gray-100 transition-all hover:shadow-soft-md">
                <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-secondary-800">Student-Focused Search</h3>
                <p className="text-secondary-500">Filters designed specifically for finding student-friendly positions</p>
              </div>
              
              <div className="text-center bg-white p-6 rounded-xl shadow-soft border border-gray-100 transition-all hover:shadow-soft-md">
                <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-secondary-800">Complete Coverage</h3>
                <p className="text-secondary-500">Access to all jobs across Sweden through the national job board API</p>
              </div>
              
              <div className="text-center bg-white p-6 rounded-xl shadow-soft border border-gray-100 transition-all hover:shadow-soft-md">
                <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-secondary-800">Latest Opportunities</h3>
                <p className="text-secondary-500">Updated daily with fresh listings from across multiple job boards</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-secondary-800">Ready to Start Your Job Search?</h2>
          <p className="text-secondary-500 mb-8 max-w-lg mx-auto">Browse thousands of opportunities tailored for students and recent graduates</p>
          <Link 
            href="/search"
            className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-8 rounded-lg shadow-soft hover:shadow-soft-md transition-all duration-200 hover:-translate-y-0.5 font-medium"
          >
            Browse All Jobs
          </Link>
        </div>
      </section>
    </Layout>
  );
}