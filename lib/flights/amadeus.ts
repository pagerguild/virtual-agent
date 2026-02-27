/**
 * Amadeus Flight Offers Search API client.
 *
 * Uses OAuth2 client_credentials flow for authentication,
 * then calls the Flight Offers Search v2 endpoint.
 *
 * @see https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search
 */

export interface FlightOffer {
  /** Unique offer ID from Amadeus */
  id: string;
  /** Total price as a string (e.g., "320.50") */
  price: string;
  /** Currency code (e.g., "USD") */
  currency: string;
  /** Carrier code (e.g., "AA") */
  carrier: string;
  /** Carrier name if available */
  carrierName: string;
  /** Number of stops */
  stops: number;
  /** Departure datetime ISO string */
  departureTime: string;
  /** Arrival datetime ISO string */
  arrivalTime: string;
  /** Total duration in ISO 8601 format (e.g., "PT4H30M") */
  duration: string;
  /** Duration formatted for display (e.g., "4h 30m") */
  durationFormatted: string;
}

interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface AmadeusFlightOffersResponse {
  data: AmadeusFlightOfferData[];
  dictionaries?: {
    carriers?: Record<string, string>;
  };
}

interface AmadeusFlightOfferData {
  id: string;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      number: string;
      numberOfStops: number;
    }>;
  }>;
  price: {
    total: string;
    currency: string;
  };
}

// Cache token in memory (server-side singleton)
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get an OAuth2 access token from Amadeus.
 * Tokens are cached until they expire.
 */
export async function getAmadeusToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "AMADEUS_API_KEY and AMADEUS_API_SECRET environment variables are required"
    );
  }

  const response = await fetch(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: apiKey,
        client_secret: apiSecret,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Amadeus auth failed (${response.status}): ${text}`);
  }

  const data: AmadeusTokenResponse = await response.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * Format an ISO 8601 duration string (e.g., "PT4H30M") into
 * a human-readable format (e.g., "4h 30m").
 */
export function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;

  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? `${match[2]}m` : "";

  return [hours, minutes].filter(Boolean).join(" ");
}

/**
 * Search for flight offers between two airports on a given date.
 *
 * @param origin - Origin IATA code
 * @param destination - Destination IATA code
 * @param departureDate - Date in YYYY-MM-DD format
 * @param maxResults - Maximum number of offers to return (default 5)
 * @returns Array of flight offers, sorted by price
 */
export async function searchFlights(
  origin: string,
  destination: string,
  departureDate: string,
  maxResults: number = 5
): Promise<FlightOffer[]> {
  const token = await getAmadeusToken();

  const params = new URLSearchParams({
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    adults: "1",
    nonStop: "false",
    max: maxResults.toString(),
    currencyCode: "USD",
  });

  const response = await fetch(
    `https://test.api.amadeus.com/v2/shopping/flight-offers?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Amadeus flight search failed (${response.status}): ${text}`
    );
  }

  const result: AmadeusFlightOffersResponse = await response.json();
  const carriers = result.dictionaries?.carriers ?? {};

  return result.data.map((offer) => {
    const itinerary = offer.itineraries[0];
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
    const totalStops = itinerary.segments.length - 1;

    return {
      id: offer.id,
      price: offer.price.total,
      currency: offer.price.currency,
      carrier: firstSegment.carrierCode,
      carrierName: carriers[firstSegment.carrierCode] ?? firstSegment.carrierCode,
      stops: totalStops,
      departureTime: firstSegment.departure.at,
      arrivalTime: lastSegment.arrival.at,
      duration: itinerary.duration,
      durationFormatted: formatDuration(itinerary.duration),
    };
  });
}

/**
 * Reset the cached token (useful for testing).
 */
export function resetTokenCache(): void {
  cachedToken = null;
}
