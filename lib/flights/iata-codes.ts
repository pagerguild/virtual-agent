/**
 * Maps US city names to their primary IATA airport codes.
 *
 * This mapping covers major US cities that are likely tour destinations.
 * The key format is "City, ST" (city name + state abbreviation).
 */

const CITY_STATE_TO_IATA: Record<string, string> = {
  // Major hubs
  "New York, NY": "JFK",
  "Los Angeles, CA": "LAX",
  "Chicago, IL": "ORD",
  "Houston, TX": "IAH",
  "Phoenix, AZ": "PHX",
  "Philadelphia, PA": "PHL",
  "San Antonio, TX": "SAT",
  "San Diego, CA": "SAN",
  "Dallas, TX": "DFW",
  "San Jose, CA": "SJC",
  "Austin, TX": "AUS",
  "Jacksonville, FL": "JAX",
  "Fort Worth, TX": "DFW",
  "Columbus, OH": "CMH",
  "Charlotte, NC": "CLT",
  "San Francisco, CA": "SFO",
  "Indianapolis, IN": "IND",
  "Seattle, WA": "SEA",
  "Denver, CO": "DEN",
  "Washington, DC": "DCA",
  "Nashville, TN": "BNA",
  "Oklahoma City, OK": "OKC",
  "El Paso, TX": "ELP",
  "Boston, MA": "BOS",
  "Portland, OR": "PDX",
  "Las Vegas, NV": "LAS",
  "Memphis, TN": "MEM",
  "Louisville, KY": "SDF",
  "Baltimore, MD": "BWI",
  "Milwaukee, WI": "MKE",
  "Albuquerque, NM": "ABQ",
  "Tucson, AZ": "TUS",
  "Fresno, CA": "FAT",
  "Mesa, AZ": "PHX",
  "Sacramento, CA": "SMF",
  "Atlanta, GA": "ATL",
  "Kansas City, MO": "MCI",
  "Miami, FL": "MIA",
  "Raleigh, NC": "RDU",
  "Omaha, NE": "OMA",
  "Minneapolis, MN": "MSP",
  "Cleveland, OH": "CLE",
  "Tampa, FL": "TPA",
  "St. Louis, MO": "STL",
  "Pittsburgh, PA": "PIT",
  "Cincinnati, OH": "CVG",
  "Orlando, FL": "MCO",
  "New Orleans, LA": "MSY",
  "Salt Lake City, UT": "SLC",
  "Detroit, MI": "DTW",
  "Honolulu, HI": "HNL",
  "Anchorage, AK": "ANC",
  "Buffalo, NY": "BUF",
  "Richmond, VA": "RIC",
  "Hartford, CT": "BDL",
  "Providence, RI": "PVD",
};

/**
 * Get IATA airport code for a city/state combination.
 *
 * @param city - City name (e.g., "New York")
 * @param state - State abbreviation (e.g., "NY")
 * @returns IATA code or null if no mapping exists
 */
export function getIataCode(city: string, state: string): string | null {
  const key = `${city}, ${state}`;
  return CITY_STATE_TO_IATA[key] ?? null;
}

/**
 * Check if a city/state has a known IATA mapping.
 */
export function hasIataCode(city: string, state: string): boolean {
  return getIataCode(city, state) !== null;
}
