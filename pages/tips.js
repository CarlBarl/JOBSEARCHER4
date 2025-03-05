// pages/tips.js
import Layout from '../components/Layout';
import Link from 'next/link';

export default function JobSearchTipsPage() {
  return (
    <Layout 
      title="Student Job Search Tips | StudentJobs"
      description="Tips and advice for students looking for jobs, internships, and part-time work in Sweden"
    >
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Student Job Search Tips</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Make the most of your job search with these helpful tips and strategies
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3">Identify Your Skills and Interests</h3>
              <p className="mb-4">
                Before diving into your job search, take some time to reflect on your skills, interests, and career goals. This self-assessment will help you focus your search on positions that align with your strengths and aspirations.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Make a list of your technical and soft skills</li>
                <li>Consider your academic background and course projects</li>
                <li>Think about industries and roles that interest you</li>
                <li>Identify your scheduling constraints as a student</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">Prepare Your Application Materials</h3>
              <p className="mb-4">
                Having well-prepared application materials ready will allow you to apply quickly when you find suitable positions.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create a strong, tailored CV highlighting relevant experience</li>
                <li>Develop a basic cover letter template that you can customize</li>
                <li>Gather references from professors, previous employers, or mentors</li>
                <li>Set up a professional email address and voicemail</li>
                <li>Clean up your social media profiles</li>
              </ul>
            </div>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Effective Search Strategies</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3">Using StudentJobs Effectively</h3>
              <p className="mb-4">
                Our platform offers several features to help you find the right student job. Here's how to make the most of them:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use specific keywords related to your field of study</li>
                <li>Filter by location to find jobs near your university or home</li>
                <li>Check the "Remote" option if you need flexibility</li>
                <li>Explore our quick search categories for student-specific opportunities</li>
                <li>Save interesting jobs to apply later</li>
                <li>Set up job alerts to get notified about new opportunities</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3">Expand Your Search</h3>
              <p className="mb-4">
                Don't limit yourself to just one search approach. Cast a wider net using these strategies:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use different terms: "internship," "trainee," "assistant," "junior," "part-time"</li>
                <li>Search for positions in related fields that might use your skills</li>
                <li>Look for seasonal opportunities (summer jobs, holiday work)</li>
                <li>Check university job boards and career centers</li>
                <li>Attend job fairs and networking events</li>
                <li>Directly contact companies you're interested in, even if they don't have posted openings</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">Student-Specific Search Terms</h3>
              <p className="mb-4">
                When searching, try these terms to find student-friendly positions:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Link href="/search?q=deltid+student" className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-center">
                  deltid student
                </Link>
                <Link href="/search?q=sommarjobb" className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-center">
                  sommarjobb
                </Link>
                <Link href="/search?q=praktik" className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-center">
                  praktik
                </Link>
                <Link href="/search?q=extrajobb" className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-center">
                  extrajobb
                </Link>
                <Link href="/search?q=junior+trainee" className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-center">
                  junior trainee
                </Link>
                <Link href="/search?q=ingen+erfarenhet" className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-center">
                  ingen erfarenhet
                </Link>
              </div>
            </div>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Application Tips</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3">Tailor Your Applications</h3>
              <p className="mb-4">
                Take the time to customize each application to match the specific job requirements:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Carefully read the job description and highlight key skills and requirements</li>
                <li>Adjust your CV to emphasize relevant experience and skills</li>
                <li>Customize your cover letter to address specific job requirements</li>
                <li>Use keywords from the job posting in your application</li>
                <li>Research the company and reference specific information in your application</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">Follow Up Appropriately</h3>
              <p className="mb-4">
                After submitting your application, a thoughtful follow-up can help you stand out:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Wait at least one week before following up</li>
                <li>Send a polite email inquiring about your application status</li>
                <li>Briefly restate your interest in the position</li>
                <li>Be respectful of the employer's time and process</li>
                <li>If you don't receive a response, you can follow up once more after another week</li>
              </ul>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Balancing Work and Studies</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">Finding the Right Balance</h3>
              <p className="mb-4">
                Working while studying can be challenging. Here are some tips to help you maintain a healthy balance:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be realistic about how many hours you can work each week</li>
                <li>Look for flexible positions that can accommodate your exam periods</li>
                <li>Consider remote work options to save commuting time</li>
                <li>Communicate clearly with employers about your academic schedule</li>
                <li>Prioritize your academic responsibilities and health</li>
                <li>Use a calendar or planner to organize your work and study schedule</li>
                <li>Don't be afraid to adjust your work hours if your studies are suffering</li>
              </ul>
            </div>
          </section>
          
          <div className="mt-12 text-center">
            <Link 
              href="/search"
              className="inline-block bg-blue-600 text-white py-3 px-8 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Start Your Job Search
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}