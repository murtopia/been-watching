/**
 * Safely formats a date string to ensure it's a valid ISO date format (YYYY-MM-DD)
 * Handles malformed dates from TMDB API that sometimes come as "20250" instead of "2025-01-01"
 *
 * @param dateString - The date string to format (from TMDB API)
 * @returns A valid ISO date string (YYYY-MM-DD) or null if invalid
 */
export function safeFormatDate(dateString: string | null | undefined): string | null {
  if (!dateString) return null

  // If it's already a valid ISO date format (YYYY-MM-DD), return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }

  // If it's just a year (4 digits), convert to YYYY-01-01
  if (/^\d{4}$/.test(dateString)) {
    return `${dateString}-01-01`
  }

  // If it's a malformed date like "20250", extract just the year
  // This handles cases where TMDB returns invalid formats
  const yearMatch = dateString.match(/^(\d{4})/)
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`
  }

  // If nothing matches, return null
  console.warn(`Invalid date format received: "${dateString}"`)
  return null
}

/**
 * Safely extracts the year from a date string
 * ALWAYS returns exactly 4 digits, never more
 *
 * @param dateString - The date string to extract year from
 * @returns The year as a string or null if invalid
 */
export function safeExtractYear(dateString: string | null | undefined): string | null {
  if (!dateString) return null

  // Convert to string to handle any type
  const stringDate = String(dateString).trim()

  // Extract ONLY the first 4 digits as the year - nothing more!
  const yearMatch = stringDate.match(/^(\d{4})/)
  if (yearMatch) {
    const yearStr = yearMatch[1]
    const year = parseInt(yearStr, 10)

    // Validate year is reasonable (1800-2100)
    if (year >= 1800 && year <= 2100) {
      // ABSOLUTELY ensure we return ONLY 4 characters
      return yearStr.substring(0, 4)
    }
  }

  console.warn(`Invalid year in date: "${stringDate}"`)
  return null
}
