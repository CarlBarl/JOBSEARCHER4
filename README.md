# Student Job Platform

A Next.js application that helps students find job opportunities across Sweden. This platform integrates with the Swedish JobTech API to provide a tailored job search experience for students looking for part-time work, internships, and entry-level positions.

## Project Overview

The Student Job Platform is a specialized job search portal that aggregates job listings from multiple sources across Sweden. It focuses on providing filters and search capabilities specifically relevant to students and recent graduates.

### Key Features

- Search jobs with filters for location, remote work, and job type
- View detailed job listings with company information
- Infinite scroll pagination for search results
- Responsive design for all device sizes
- Quick search categories for common student job types
- Company logo display when available

## Technical Architecture

### Tech Stack

- **Frontend**: Next.js with React (Pages Router)
- **Styling**: Tailwind CSS
- **API Integration**: Swedish JobTech Search API
- **Deployment**: Compatible with Vercel

### Core Components

- **Search System**: Full-text search with filtering capabilities
- **Job Detail Views**: Detailed job information display
- **Component Library**: Reusable UI components (JobCard, SearchForm, etc.)
- **API Client**: Wrapper for the JobTech API with error handling

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
│   ├── JobCard.js        # Card for displaying job listings
│   ├── Layout.js         # Main page layout wrapper
│   └── SearchForm.js     # Job search form
│
├── lib/                  # Utility functions and API clients
│   └── jobApi.js         # JobTech API client with search functions
│
├── pages/                # Next.js pages
│   ├── _app.js           # Next.js App component
│   ├── _document.js      # Next.js Document component
│   ├── 404.js            # Custom 404 page
│   ├── about.js          # About page
│   ├── index.js          # Homepage
│   ├── search.js         # Search results page
│   ├── tips.js           # Job search tips page
│   ├── api/              # API routes
│   │   └── hello.js      # Example API route
│   └── job/              # Job details pages
│       └── [id].js       # Dynamic job detail page
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

The project integrates with the Swedish JobTech API, which provides job listings from across Sweden. The API includes data from the Swedish Public Employment Service (Arbetsförmedlingen) and other major job boards.

Key API endpoints:
- `https://links.api.jobtechdev.se/joblinks` - Search for jobs
- `https://links.api.jobtechdev.se/ad/{id}` - Get details for a specific job

### API Client Implementation

The API client is implemented in `lib/jobApi.js` and provides the following key functionality:

#### Search Jobs

```javascript
export async function searchJobs({
  query = '',
  location = '',
  remote = false,
  occupationField = '',
  occupationGroup = '',
  municipality = '',
  region = '',
  country = '',
  employer = '',
  publishedAfter = '',
  sort = 'relevance-desc',
  limit = 20,
  offset = 0
} = {}) {
  // Implementation details...
}
```

This function constructs a search query based on the provided parameters and sends a request to the JobTech API. It handles:
- Building the search query string
- Adding geographic filters (municipality, region, country)
- Adding occupation filters
- Adding employer and date filters
- Pagination parameters
- Error handling and response formatting

#### Get Job Details

```javascript
export async function getJobById(id) {
  // Implementation details...
}
```

Retrieves detailed information about a specific job listing by ID, with error handling.

#### Job Logo Management

```javascript
export function getJobLogoUrl(id) {
  // Implementation details...
}

export async function isValidLogo(imageUrl) {
  // Implementation details...
}
```

These functions handle the retrieval and validation of company logos from the API.

#### Other Helper Functions

- `getPopularLocations()` - Returns common Swedish locations with their codes
- `getStudentJobCategories()` - Returns job categories relevant to students
- `getOccupationFields()` - Returns major occupation fields for filtering
- `formatPublishedAfterDate()` - Formats dates for the API parameters
- `getStudentJobPresets()` - Returns preset search configurations for quick access buttons

### API Usage in Pages

#### Search Page (`pages/search.js`)

The search page:
1. Receives search parameters from URL query parameters
2. Calls the `searchJobs()` function with these parameters
3. Renders job results with pagination using infinite scroll
4. Provides filtering options via the SearchForm component

#### Job Details Page (`pages/job/[id].js`)

The job details page:
1. Extracts the job ID from the URL
2. Calls the `getJobById()` function to fetch detailed job information
3. Attempts to load the company logo using `getJobLogoUrl()` and `isValidLogo()`
4. Renders the job details including description, requirements, and application information

## Key Concepts

### Search Parameters

The search functionality supports various parameters:

- `query`: Free text search for job titles, skills, or companies
- `location`: Location search (city or region)
- `remote`: Boolean flag for remote work
- `occupationField`: Field of work (concept ID)
- `occupationGroup`: More specific occupation group (concept ID)
- `municipality`, `region`, `country`: Geographic filters with concept IDs
- `employer`: Filter by employer name
- `publishedAfter`: Filter by publication date
- `sort`: Sort order (relevance-desc, pubdate-desc, etc.)
- `limit` & `offset`: Pagination parameters

### Concept IDs

The JobTech API uses concept IDs for structured data like:
- Municipalities (e.g., '0180' for Stockholm)
- Regions (e.g., '9hXe_F4g_eTG' for Stockholm County)
- Occupation fields (e.g., 'apaJ_2ja_LuF' for Data/IT)

These IDs are used in API requests for precise filtering.

### Job Data Structure

A typical job object includes:

```javascript
{
  id: "job-id",
  headline: "Job Title",
  employer: { name: "Company Name", website: "https://example.com" },
  description: {
    text: "Plain text description",
    text_formatted: "<p>HTML formatted description</p>"
  },
  workplace_address: {
    municipality: "Stockholm",
    region: "Stockholm County",
    country: "Sweden"
  },
  publication_date: "2023-06-01T14:00:00Z",
  application_deadline: "2023-07-01T23:59:59Z",
  employment_type: { label: "Full-time" },
  workinghourstype: { label: "Regular hours" },
  must_have: { skills: [ {label: "JavaScript"}, ... ] },
  nice_to_have: { skills: [ {label: "React"}, ... ] }
}
```

### Error Handling

API errors are handled at multiple levels:
1. In the API client (`jobApi.js`) with appropriate error responses
2. In the UI components with loading states, error messages, and fallbacks

## UI Components

### SearchForm

Located in `components/SearchForm.js`, this component:
- Provides inputs for job query and location
- Includes a checkbox for remote work filter
- Submits search parameters to the `/search` page

### JobCard

Located in `components/JobCard.js`, this component:
- Displays a summary of a job listing
- Shows company logo when available
- Provides basic job information (title, company, location, employment type)
- Links to the detailed job view

### Layout, Header, Footer

These components provide the page structure and navigation.

## Development Guidelines

### Adding New Features

When adding new features:
1. Consider the user flow and how it integrates with existing functionality
2. Add any new API functions to `lib/jobApi.js`
3. Create/update components in the `components` directory
4. Add/update pages in the `pages` directory

### API Rate Limits

The JobTech API has usage limits:
- Standard limit is 1,000 requests per day
- Higher limits require special arrangements with the API team
- Implement caching when appropriate to reduce API calls

### Best Practices

1. Use the API client functions rather than direct API calls
2. Handle loading states and errors at the component level
3. Use concept IDs for structured data when possible
4. Always link back to the original job posting source

## Resources

### JobTech API Documentation

- [JobTech Developer Portal](https://jobtechdev.se/en)
- [JobTech API Swagger UI](https://links.api.jobtechdev.se)
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
#   J O B S E A R C H E R 4  
 