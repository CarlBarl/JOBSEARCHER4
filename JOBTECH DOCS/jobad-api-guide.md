# JobAd API Guide

## Overview

The JobAd API provides access to job listings from across Sweden, offered as a collaborative service between the Swedish Public Employment Service and major job boards. The API contains references and metadata linked to job ads provided by various job boards, offering approximately 30% more listings than available on Platsbanken alone.

**Key Benefits:**
- Free to use with no registration required
- Contains job listings from multiple sources in one unified API
- Updated daily with fresh listings
- Uses machine learning for occupation classification
- Implements the Swedish classification system for occupations (SSYK)

**Important Notes:**
- Standard usage is limited to 1,000 requests per day (contact API team for higher limits)
- Job ad descriptions are truncated to ensure users visit the original job sites
- The API is designed to respect source sites' business models by linking back to them

## API Basics

- **Base URL**: `https://links.api.jobtechdev.se`
- **Key Endpoints**:
  - `/joblinks` - Search for job ads with filtering options
  - `/ad/{id}` - Get a specific job ad by ID

## Detailed Endpoint Information

### Search API (`/joblinks`)

The primary endpoint for searching job listings with various filtering options:

#### Key Parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `q` | Freetext search query (searches in headline, description, etc.) | `?q=developer` |
| `occupation-group` | Filter by occupation group concept ID | `?occupation-group=5qT8_z9d_8rw` |
| `occupation-field` | Filter by occupation field concept ID | `?occupation-field=apaJ_2ja_LuF` |
| `municipality` | Filter by municipality concept ID | `?municipality=tfRE_hXa_eq7` |
| `region` | Filter by region concept ID | `?region=9hXe_F4g_eTG` |
| `country` | Filter by country concept ID | `?country=QJgN_Zge_BzJ` |
| `published-after` | Filter ads published after a specific date | `?published-after=2025-01-01T00:00:00Z` |
| `sort` | Sort results by relevance, publication date | `?sort=pubdate-desc` |
| `limit` | Number of results to return (0-100) | `?limit=20` |
| `offset` | Pagination offset (0-2000) | `?offset=20` |
| `exclude_source` | Exclude a specific source from results | `?exclude_source=Arbetsförmedlingen` |

#### Example Request:
```
GET https://links.api.jobtechdev.se/joblinks?q=python&limit=10&sort=pubdate-desc
```

### Single Ad API (`/ad/{id}`)

Retrieve complete details for a specific job posting:

#### Example Request:
```
GET https://links.api.jobtechdev.se/ad/8430129
```

#### Response Structure:
```json
{
  "id": "8430129",
  "headline": "Python Developer",
  "brief": "We are looking for an experienced Python developer...",
  "occupation_group": {
    "label": "Software and system developers etc.",
    "concept_id": "YmsL_R5k_Fqt"
  },
  "occupation_field": {
    "label": "Data/IT",
    "concept_id": "apaJ_2ja_LuF"
  },
  "employer": {
    "name": "Tech Company AB"
  },
  "workplace_addresses": {
    "municipality_concept_id": "tfRE_hXa_eq7",
    "municipality": "Stockholm",
    "region_concept_id": "9hXe_F4g_eTG",
    "region": "Stockholms län",
    "country_concept_id": "i46j_HmG_v64",
    "country": "Sverige"
  },
  "publication_date": "2025-02-15T10:30:00Z",
  "source_links": [
    {
      "label": "TechJobs",
      "url": "https://techjobs.se/job/8430129"
    }
  ]
}
```

## Search Techniques

### 1. Basic Free Text Search

The simplest way to search is using the `q` parameter:

```
https://links.api.jobtechdev.se/joblinks?q=systemutvecklare
```

This will search for "systemutvecklare" in job titles, descriptions, and other relevant fields.

### 2. Location-Based Search

Combine free text with location filters:

```
https://links.api.jobtechdev.se/joblinks?q=developer&municipality=tfRE_hXa_eq7
```

This searches for "developer" jobs in Stockholm.

### 3. Advanced Search Techniques

#### Wildcard Search
Use asterisk (*) for wildcard searches:

```
https://links.api.jobtechdev.se/joblinks?q=program*
```

This would match "programmer," "programming," "program manager," etc.

#### Phrase Search
Use double quotes for exact phrase matching:

```
https://links.api.jobtechdev.se/joblinks?q=%22machine%20learning%22
```

#### Negative Search
Exclude terms using the minus symbol:

```
https://links.api.jobtechdev.se/joblinks?q=python%20-django
```

This searches for Python jobs but excludes those mentioning Django.

#### Field-Specific Search
Filter by occupation field:

```
https://links.api.jobtechdev.se/joblinks?occupation-field=apaJ_2ja_LuF&q=developer
```

This searches for developer jobs specifically in the Data/IT field.

## Using Taxonomy IDs

Many parameters require concept IDs from the Taxonomy API. These are structured identifiers for occupations, locations, and other categorizations.

### Common Taxonomy Categories:

1. **Occupation Fields** - Broad job categories
2. **Occupation Groups** - More specific job categories
3. **Municipalities** - Swedish cities/municipalities
4. **Regions** - Swedish regions/counties
5. **Countries** - Country identifiers

### How to Get Taxonomy IDs:

1. Use the [Taxonomy API](https://jobtechdev.se/en/products/jobtech-taxonomy)
2. For manual lookups, use the Taxonomy Atlas UI
3. For programmatic access, query the Taxonomy API endpoints

### Common Municipality Codes
- `0180` - Stockholm
- `1480` - Göteborg
- `1280` - Malmö
- `0580` - Linköping
- `1880` - Örebro
- `0380` - Uppsala
- `2480` - Umeå
- `2580` - Luleå

### Occupation Field Codes (relevant for students)
- `3` - Data/IT (concept ID: apaJ_2ja_LuF)
- `5` - Education
- `9` - Natural sciences/Research
- `11` - Economics/Administration
- `12` - Healthcare
- `18` - Technology/Engineering
- `22` - Culture/Media/Design

## Error Handling

| HTTP Status Code | Reason | Explanation |
|------------------|--------|-------------|
| 400 | Bad Request | Something is wrong with your query parameters |
| 404 | Missing Ad | The requested ad is not available |
| 500 | Internal Server Error | Server-side issue |

## Best Practices

1. **Be Specific with Queries**
   - Use more specific search terms to get more relevant results
   - Combine free text with taxonomy filters for precision

2. **Pagination**
   - Use the `limit` and `offset` parameters for paginating through results
   - Typical pattern: start with `offset=0&limit=20`, then `offset=20&limit=20`, etc.

3. **Rate Limiting**
   - Keep requests under 1,000 per day
   - Contact the API team if you need higher limits

4. **Link Back to Source**
   - Always include links to the original job posting site
   - This respects the business model of the source job boards

5. **Efficient Searching**
   - Cache common searches when appropriate
   - Use taxonomy IDs for structured data instead of text when possible

## Code Examples

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

async function searchJobs(params) {
  try {
    const response = await axios.get('https://links.api.jobtechdev.se/joblinks', {
      params: params,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error searching jobs:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Example: Search for part-time developer jobs in Stockholm
async function findStudentJobs() {
  const params = {
    q: 'developer student',
    municipality: '0180',  // Stockholm
    limit: 10,
    sort: 'pubdate-desc'
  };
  
  try {
    const result = await searchJobs(params);
    console.log(`Found ${result.total} jobs`);
    result.hits.forEach(job => {
      console.log(`${job.headline} - ${job.employer.name} - ${job.workplace_addresses.municipality}`);
    });
  } catch (error) {
    console.error('Failed to find jobs');
  }
}

findStudentJobs();
```

### Python Example

```python
import requests

def search_jobs(params):
    try:
        response = requests.get(
            'https://links.api.jobtechdev.se/joblinks',
            params=params,
            headers={'Accept': 'application/json'}
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error searching jobs: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
        raise

# Example: Search for IT jobs that don't require experience
def find_entry_level_it_jobs():
    params = {
        'q': 'junior intern trainee',
        'occupation-field': 'apaJ_2ja_LuF',  # Data/IT
        'limit': 10,
        'sort': 'pubdate-desc'
    }
    
    try:
        result = search_jobs(params)
        print(f"Found {result['total']} jobs")
        for job in result['hits']:
            print(f"{job['headline']} - {job['employer']['name']} - {job['publication_date']}")
    except Exception as e:
        print(f"Failed to find jobs: {e}")

find_entry_level_it_jobs()
```

## Student-Specific Search Strategies

For finding student-relevant jobs, consider these search strategies:

1. **Part-time positions:**
   ```
   https://links.api.jobtechdev.se/joblinks?q=deltid%20student
   ```

2. **Entry-level positions:**
   ```
   https://links.api.jobtechdev.se/joblinks?q=junior%20trainee%20praktik
   ```

3. **Specific field + student:**
   ```
   https://links.api.jobtechdev.se/joblinks?occupation-field=apaJ_2ja_LuF&q=student
   ```
   (Searches for student jobs in IT/Data field)

4. **Location-specific student jobs:**
   ```
   https://links.api.jobtechdev.se/joblinks?municipality=0180&q=student%20deltid
   ```
   (Searches for part-time student jobs in Stockholm)

## References

- [JobTech Dev Platform](https://jobtechdev.se/en)
- [Swagger GUI for JobAd API](https://links.api.jobtechdev.se)
- [Taxonomy API Documentation](https://jobtechdev.se/en/products/jobtech-taxonomy)
- [Code Examples Repository](https://gitlab.com/arbetsformedlingen/job-ads/getting-started-code-examples)
- [Raw Data Downloads](https://data.jobtechdev.se/annonser/jobtechlinks/index.html)
