# Student Job Platform

A Next.js application that helps students find job opportunities across Sweden. This platform integrates with both the Swedish JobTech APIs - JobAd API and JobSearch API - to provide a comprehensive job search experience for students looking for part-time work, internships, and entry-level positions.

## Project Overview

The Student Job Platform is a specialized job search portal that aggregates job listings from multiple sources across Sweden. It focuses on providing filters and search capabilities specifically relevant to students and recent graduates.

### Key Features

- Integrated search using both JobAd API and JobSearch API for maximum job coverage
- API selection option allowing users to choose which API(s) to use
- Search jobs with filters for location, remote work, and job type
- Typeahead suggestions for better search assistance
- Geolocation-based search for finding jobs near you
- View detailed job listings with company information
- Visual distinction between jobs from different API sources
- Responsive design for all device sizes
- Quick search categories for common student job types
- Fallback mechanisms if one API fails or doesn't have specific data

## Technical Architecture

### Tech Stack

- **Frontend**: Next.js with React (Pages Router)
- **Styling**: Tailwind CSS
- **API Integration**: Swedish JobTech APIs (JobAd API and JobSearch API)
- **Deployment**: Compatible with Vercel

### Core Components

- **Dual API Integration**: Combined search across both JobAd API and JobSearch API
- **Search System**: Full-text search with filtering capabilities and typeahead
- **Job Detail Views**: Detailed job information display with API source identification
- **Component Library**: Reusable UI components (JobCard, SearchForm, etc.)
- **Advanced Search Functions**: Specialized searches for student-specific job types

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd student-job-platform
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Project Structure

```
student-job-platform/
│
├── components/           # Reusable UI components
│   ├── Footer.js         # Footer component
│   ├── Header.js         # Header/navigation component
│   ├── JobCard.js        # Card for displaying job listings with API source indicator
│   ├── Layout.js         # Main page layout wrapper
│   └── SearchForm.js     # Enhanced job search form with API selection
│
├── lib/                  # Utility functions and API clients
│   ├── jobApi.js         # Integrated JobTech API client (JobAd + JobSearch)
│   └── advancedSearch.js # Specialized search functions for student jobs
│
├── pages/                # Next.js pages
│   ├── _app.js           # Next.js App component
│   ├── _document.js      # Next.js Document component
│   ├── 404.js            # Custom 404 page
│   ├── about.js          # About page
│   ├── index.js          # Homepage
│   ├── search.js         # Enhanced search results page with API source indicators
│   ├── tips.js           # Job search tips page
│   ├── api/              # API routes
│   │   └── hello.js      # Example API route
│   └── job/              # Job details pages
│       └── [id].js       # Dynamic job detail page with dual-API support
│
├── public/               # Static assets
│   ├── favicon.ico
│   ├── file.svg          # Default company logo
│   └── images/           # Image assets
│
├── styles/               # Global styles
│   └── globals.css       # Global CSS including Tailwind imports
│
├── JOBTECH DOCS/         # Documentation for the JobTech API
├── next.config.mjs       # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Project dependencies and scripts
```

## API Integration

### JobTech API Overview

The project now integrates with two Swedish JobTech APIs:

1. **JobAd API**
   - Base URL: `https://links.api.jobtechdev.se`
   - Contains job ads from multiple sources across Sweden
   - Updated daily with fresh listings

2. **JobSearch API**
   - Base URL: `https://jobsearch.api.jobtechdev.se`
   - The original job search API from Arbetsförmedlingen
   - Contains some listings that may not be in the JobAd API

By using both APIs, the platform provides the most comprehensive job coverage possible.

### API Client Implementation

The API client is implemented in `lib/jobApi.js` and provides the following key functionality:

#### Unified Search Across Both APIs

```javascript
export async function searchAllJobs({
  q = '',                   // Free text search query
  occupationField = '',     // Concept ID for occupation field
  occupationGroup = '',     // Concept ID for occupation group
  municipality = '',        // Concept ID or code for municipality
  region = '',              // Concept ID or code for region
  // ... other parameters
  useApis = 'both'          // Which APIs to use: 'jobad', 'jobsearch', or 'both'
} = {}) {
  // Implementation details...
}
```

This function sends parallel requests to both APIs, combines and deduplicates the results, and returns a unified data format.

#### Individual API Search Functions

```javascript
export async function searchJobAdAPI({...}) {...}
export async function searchJobSearchAPI({...}) {...}
```

These functions allow searching each API individually when needed.

#### Typeahead Suggestions from Both APIs

```javascript
export async function getTypeaheadSuggestions(q, useApis = 'both') {...}
```

Gets autocomplete suggestions from both APIs and combines the results for improved search assistance.

#### Enhanced Job Details

```javascript
export async function getJobById(id) {
  // Try JobAd API first, fall back to JobSearch API if needed
}
```

Tries to fetch job details from both APIs, using a fallback mechanism if one API doesn't have the job.

#### Advanced Search Functions

Located in `lib/advancedSearch.js`, these functions provide specialized searches for student-specific needs:

```javascript
export async function searchStudentJobs({...}) {...}
export async function findInternships({...}) {...}
export async function findRecentGraduateJobs({...}) {...}
export async function findSeasonalJobs({...}) {...}
export async function findFlexibleHourJobs({...}) {...}
export async function findNoExperienceJobs({...}) {...}
```

These functions leverage both APIs to find specific types of jobs relevant to students.

### Key UI Enhancements

#### SearchForm (`components/SearchForm.js`)

The search form now includes:
- API selection dropdown to choose which API(s) to use
- Typeahead suggestions as you type
- Geolocation button to find jobs near you
- Enhanced filters for remote work and abroad options

#### JobCard (`components/JobCard.js`)

Job cards now include:
- Visual indicator of which API provided the job data
- Fallback mechanism for logos if one API doesn't have them
- Better handling of different data formats from each API

#### Search Page (`pages/search.js`)

The search page now:
- Displays which APIs were successfully queried
- Shows active filters including the API choice
- Handles combined results from both APIs
- Provides better error handling if one API fails

#### Job Details Page (`pages/job/[id].js`)

The job details page now:
- Shows which API provided the job data
- Tries to fetch job details from both APIs if needed
- Provides a better display of all available job information
- Handles the unified data format from both APIs

## Integration Strategy

The platform uses a strategic approach to integrate both APIs:

1. **Parallel Requests**: Sends requests to both APIs simultaneously for better performance
2. **Deduplication**: Removes duplicate job listings based on job ID
3. **Normalization**: Standardizes data formats from both APIs
4. **Fallback Mechanisms**: If one API fails or doesn't have certain data, tries the other
5. **User Choice**: Allows users to choose which API(s) to use based on their needs

## Development Guidelines

### API Usage Considerations

When working with the dual API integration:

1. **Performance**: Be aware that querying both APIs will increase the load time slightly, but provides more comprehensive results
2. **Rate Limits**: The combined system respects rate limits for both APIs (typically 1,000 requests per day)
3. **Caching**: Consider implementing caching for frequently used searches and typeahead suggestions
4. **Error Handling**: Implement graceful fallbacks if one API is unavailable

### Adding New Features

When adding new features:
1. Consider which API(s) should be used for the feature
2. Add any new API functions to `lib/jobApi.js`
3. Add specialized search functions to `lib/advancedSearch.js`
4. Update components to handle the unified data format

## Resources

### JobTech API Documentation

- [JobTech Developer Portal](https://jobtechdev.se/en)
- [JobAd API Swagger UI](https://links.api.jobtechdev.se)
- [JobSearch API Swagger UI](https://jobsearch.api.jobtechdev.se)
- [Taxonomy API](https://jobtechdev.se/en/products/jobtech-taxonomy) (for concept IDs)

### Development Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://reactjs.org/docs)

## Deployment

The application is configured for deployment on Vercel:

```bash
npm run build
npm run start
```

Or use Vercel's GitHub integration for automatic deployments.

## License

[Include your license information here]