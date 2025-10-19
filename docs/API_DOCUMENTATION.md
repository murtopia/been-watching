# API Documentation

Complete reference for all API endpoints in the Been Watching application.

## Table of Contents
- [TMDB Proxy API](#tmdb-proxy-api)
- [User Media API](#user-media-api)
- [Authentication API](#authentication-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## TMDB Proxy API

All TMDB API calls are proxied through Next.js API routes to keep the API key secure on the server.

### Base URL
```
/api/tmdb
```

### Common Response Format
```typescript
{
  // TMDB data structure (varies by endpoint)
}
```

---

### Search Movies & TV Shows

Search for movies and TV shows.

**Endpoint**: `GET /api/tmdb/search/multi`

**Query Parameters**:
- `query` (required): Search query string

**Example Request**:
```bash
GET /api/tmdb/search/multi?query=breaking%20bad
```

**Example Response**:
```json
{
  "results": [
    {
      "id": 1396,
      "name": "Breaking Bad",
      "media_type": "tv",
      "poster_path": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      "overview": "When Walter White, a New Mexico chemistry teacher...",
      "first_air_date": "2008-01-20",
      "vote_average": 8.9
    }
  ],
  "total_results": 42,
  "page": 1
}
```

**TMDB Fields Explained**:
- `id`: TMDB's unique identifier
- `media_type`: Either "tv" or "movie"
- `name`: TV show title (use `title` for movies)
- `poster_path`: Poster image path (prepend with `https://image.tmdb.org/t/p/w500`)

---

### Get Trending Content

Fetch trending movies and TV shows.

**Endpoint**: `GET /api/tmdb/trending/[mediaType]/[timeWindow]`

**URL Parameters**:
- `mediaType`: `all`, `movie`, or `tv`
- `timeWindow`: `day` or `week`

**Example Request**:
```bash
GET /api/tmdb/trending/all/week
```

**Example Response**:
```json
{
  "results": [
    {
      "id": 94605,
      "title": "Arcane",
      "media_type": "tv",
      "poster_path": "/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
      "vote_average": 8.7
    }
  ]
}
```

---

### Get TV Show Details

Get detailed information about a TV show, including all seasons.

**Endpoint**: `GET /api/tmdb/tv/[id]`

**URL Parameters**:
- `id`: TMDB TV show ID

**Example Request**:
```bash
GET /api/tmdb/tv/1396
```

**Example Response**:
```json
{
  "id": 1396,
  "name": "Breaking Bad",
  "overview": "When Walter White...",
  "poster_path": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
  "first_air_date": "2008-01-20",
  "seasons": [
    {
      "id": 3572,
      "season_number": 1,
      "episode_count": 7,
      "poster_path": "/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg",
      "air_date": "2008-01-20"
    },
    {
      "id": 3573,
      "season_number": 2,
      "episode_count": 13,
      "poster_path": "/e3oGYpoTUhOFK0M4VFdI8vfI1S.jpg",
      "air_date": "2009-03-08"
    }
  ],
  "genres": [
    { "id": 18, "name": "Drama" }
  ],
  "number_of_seasons": 5,
  "number_of_episodes": 62
}
```

**Important**: Filter out "Season 0" (specials) in your UI:
```typescript
const validSeasons = data.seasons.filter(s => s.season_number > 0)
```

---

### Get Movie Details

Get detailed information about a movie.

**Endpoint**: `GET /api/tmdb/movie/[id]`

**URL Parameters**:
- `id`: TMDB movie ID

**Example Request**:
```bash
GET /api/tmdb/movie/550
```

**Example Response**:
```json
{
  "id": 550,
  "title": "Fight Club",
  "overview": "A ticking-time-bomb insomniac...",
  "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "release_date": "1999-10-15",
  "runtime": 139,
  "vote_average": 8.4,
  "genres": [
    { "id": 18, "name": "Drama" }
  ]
}
```

---

### Get Videos/Trailers

Get trailers and videos for a movie or TV show.

**Endpoint**: `GET /api/tmdb/[type]/[id]/videos`

**URL Parameters**:
- `type`: `movie` or `tv`
- `id`: TMDB ID

**Example Request**:
```bash
GET /api/tmdb/tv/1396/videos
```

**Example Response**:
```json
{
  "results": [
    {
      "key": "HhesaQXLuRY",
      "site": "YouTube",
      "type": "Trailer",
      "name": "Breaking Bad: Season 5 - Official Trailer"
    }
  ]
}
```

**Usage**: Embed YouTube videos with `https://www.youtube.com/embed/{key}`

---

## User Media API

Endpoints for managing user's tracked shows and movies.

### Base URL
```
/api/user-media
```

### Authentication
All user media endpoints require authentication. The user session is validated via Supabase Auth.

---

### Get User's Media

Fetch all media tracked by the current user.

**Endpoint**: `GET /api/user-media`

**Authentication**: Required

**Query Parameters**: None

**Example Request**:
```bash
GET /api/user-media
```

**Example Response**:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "tmdb_id": 1396,
      "title": "Breaking Bad",
      "poster_path": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      "media_type": "tv",
      "season_number": 1,
      "rating": 5,
      "status": "completed",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Response Fields**:
- `id`: UUID of the user_media record
- `tmdb_id`: TMDB identifier
- `season_number`: Season number (null for movies)
- `rating`: 1-5 stars (nullable)
- `status`: User's viewing status (nullable)

---

### Add Media

Add a new movie or TV show to user's tracking.

**Endpoint**: `POST /api/user-media`

**Authentication**: Required

**Request Body**:
```json
{
  "tmdb_id": 1396,
  "title": "Breaking Bad",
  "poster_path": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
  "media_type": "tv",
  "season_number": 1,
  "rating": 5,
  "status": "watching"
}
```

**Required Fields**:
- `tmdb_id`: TMDB identifier
- `title`: Show/movie title
- `media_type`: "tv" or "movie"

**Optional Fields**:
- `poster_path`: Poster image path
- `season_number`: For TV shows only
- `rating`: 1-5 integer
- `status`: Viewing status string

**Example Response**:
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "tmdb_id": 1396,
    "title": "Breaking Bad",
    "media_type": "tv",
    "season_number": 1,
    "rating": 5,
    "status": "watching",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `401`: User not authenticated
- `400`: Invalid request body
- `500`: Database error

---

### Update Media

Update rating or status for a tracked show/movie.

**Endpoint**: `PATCH /api/user-media/[id]`

**Authentication**: Required

**URL Parameters**:
- `id`: UUID of the user_media record

**Request Body**:
```json
{
  "rating": 4,
  "status": "completed"
}
```

**Allowed Fields**:
- `rating`: 1-5 integer
- `status`: Any string

**Example Request**:
```bash
PATCH /api/user-media/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "rating": 4,
  "status": "completed"
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "rating": 4,
    "status": "completed",
    "updated_at": "2025-01-15T11:00:00Z"
  }
}
```

**Security**: The API verifies that the media belongs to the authenticated user.

---

### Delete Media

Remove a show/movie from user's tracking.

**Endpoint**: `DELETE /api/user-media/[id]`

**Authentication**: Required

**URL Parameters**:
- `id`: UUID of the user_media record

**Example Request**:
```bash
DELETE /api/user-media/550e8400-e29b-41d4-a716-446655440000
```

**Example Response**:
```json
{
  "success": true,
  "message": "Media removed successfully"
}
```

**Error Responses**:
- `401`: User not authenticated
- `404`: Media not found or doesn't belong to user
- `500`: Database error

---

## Authentication API

Supabase handles authentication. These are the callback routes.

### Auth Callback

Handle OAuth callback from Supabase.

**Endpoint**: `GET /api/auth/callback`

**Purpose**: Exchanges auth code for session after OAuth login

**Usage**: Automatically called by Supabase, no manual use needed

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error message",
  "details": "Optional detailed error information"
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created (for POST requests)
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Common Errors

#### Authentication Error
```json
{
  "error": "Unauthorized",
  "details": "You must be logged in to access this resource"
}
```

#### Validation Error
```json
{
  "error": "Invalid request",
  "details": "Missing required field: tmdb_id"
}
```

#### TMDB API Error
```json
{
  "error": "External API error",
  "details": "Failed to fetch data from TMDB"
}
```

---

## Rate Limiting

### Current Status
⚠️ **Not Implemented Yet**

### Planned Implementation
- **User Media API**: 100 requests per minute per user
- **TMDB Proxy API**: 40 requests per 10 seconds (TMDB's limit)
- **Headers**: Will include rate limit info in response headers

### Future Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642089600
```

---

## Request Examples

### JavaScript/TypeScript

```typescript
// Add media to tracking
const addMedia = async (mediaData: any) => {
  const response = await fetch('/api/user-media', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mediaData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  return await response.json()
}

// Search for shows
const searchShows = async (query: string) => {
  const response = await fetch(
    `/api/tmdb/search/multi?query=${encodeURIComponent(query)}`
  )
  return await response.json()
}

// Get user's media
const getUserMedia = async () => {
  const response = await fetch('/api/user-media')
  const data = await response.json()
  return data.data // Array of media items
}
```

### cURL

```bash
# Search for a show
curl "http://localhost:3000/api/tmdb/search/multi?query=breaking%20bad"

# Add media (requires authentication cookie)
curl -X POST http://localhost:3000/api/user-media \
  -H "Content-Type: application/json" \
  -d '{
    "tmdb_id": 1396,
    "title": "Breaking Bad",
    "media_type": "tv",
    "season_number": 1,
    "rating": 5
  }'

# Update media
curl -X PATCH http://localhost:3000/api/user-media/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"rating": 4, "status": "completed"}'

# Delete media
curl -X DELETE http://localhost:3000/api/user-media/550e8400-e29b-41d4-a716-446655440000
```

---

## Image URLs

### TMDB Image Base URLs

TMDB provides images at various sizes. Use these base URLs:

```typescript
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

// Poster sizes
const posterSizes = {
  small: `${TMDB_IMAGE_BASE}/w185`,    // 185px wide
  medium: `${TMDB_IMAGE_BASE}/w342`,   // 342px wide
  large: `${TMDB_IMAGE_BASE}/w500`,    // 500px wide
  original: `${TMDB_IMAGE_BASE}/original`
}

// Usage
const posterUrl = `${posterSizes.medium}${movie.poster_path}`
// Result: https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGt.jpg
```

### Available Sizes
- **Posters**: w92, w154, w185, w342, w500, w780, original
- **Backdrops**: w300, w780, w1280, original
- **Profile**: w45, w185, h632, original

---

## Testing

### Test Data

Use these TMDB IDs for testing:

**TV Shows**:
- Breaking Bad: `1396`
- Game of Thrones: `1399`
- Stranger Things: `66732`
- The Office: `2316`

**Movies**:
- The Shawshank Redemption: `278`
- The Dark Knight: `155`
- Inception: `27205`
- Interstellar: `157336`

### Example Test Flow

```bash
# 1. Search for a show
curl "http://localhost:3000/api/tmdb/search/multi?query=inception"

# 2. Get details
curl "http://localhost:3000/api/tmdb/movie/27205"

# 3. Add to tracking
curl -X POST http://localhost:3000/api/user-media \
  -H "Content-Type: application/json" \
  -d '{
    "tmdb_id": 27205,
    "title": "Inception",
    "media_type": "movie",
    "rating": 5
  }'

# 4. Get user's media
curl "http://localhost:3000/api/user-media"
```

---

## CORS & Security

### CORS Policy
API routes are configured for same-origin requests only. Cross-origin requests are blocked.

### Security Measures
- ✅ API keys hidden on server-side
- ✅ User authentication required for user-media endpoints
- ✅ Row-level security in database
- ⏳ Rate limiting (planned)
- ⏳ Input validation (partial)
- ⏳ CSRF protection (planned)

---

## Changelog

### Version 0.1.0
- Initial API documentation
- TMDB proxy endpoints
- User media CRUD operations
- Basic authentication

---

**Last Updated**: January 2025
**API Version**: 0.1.0
