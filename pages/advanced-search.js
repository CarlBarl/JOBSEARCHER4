// pages/advanced-search.js
import Layout from '../components/Layout';
import AdvancedSearchForm from '../components/AdvancedSearchForm';

export default function AdvancedSearchPage() {
  return (
    <Layout 
      title="Advanced Job Search | StudentJobs"
      description="Find specialized job opportunities for students with our advanced search tools"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Advanced Job Search</h1>
          <p className="text-gray-600 mb-8 text-center">
            Use our specialized search tools to find the perfect student job
          </p>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <AdvancedSearchForm />
          </div>
        </div>
      </div>
    </Layout>
  );
}