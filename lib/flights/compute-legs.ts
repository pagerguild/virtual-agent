import { getIataCode } from "./iata-codes";

/**
 * A gig with the minimal fields needed for flight leg computation.
 */
export interface GigForLeg {
  id: string;
  city: string;
  state: string;
  date: string; // "YYYY-MM-DD"
  venue_name: string;
}

/**
 * A flight leg between two consecutive gigs.
 */
export interface FlightLeg {
  /** Origin gig ID */
  originGigId: string;
  /** Destination gig ID */
  destinationGigId: string;
  /** Origin city display name */
  originCity: string;
  /** Destination city display name */
  destinationCity: string;
  /** Origin IATA airport code */
  originCode: string;
  /** Destination IATA airport code */
  destinationCode: string;
  /** Departure date (day after origin gig) in YYYY-MM-DD format */
  departureDate: string;
}

/**
 * Given a list of gigs sorted by date, compute the flight legs between
 * consecutive gig cities.
 *
 * The departure date for each leg is the day after the origin gig's date,
 * giving the artist time to perform and travel the next morning.
 *
 * Gigs in the same city are skipped (no flight needed).
 * Gigs without a known IATA code are skipped with a warning.
 *
 * @param gigs - Array of gigs, must be sorted by date ascending
 * @returns Array of flight legs
 */
export function computeFlightLegs(gigs: GigForLeg[]): FlightLeg[] {
  if (gigs.length < 2) return [];

  const legs: FlightLeg[] = [];

  for (let i = 0; i < gigs.length - 1; i++) {
    const origin = gigs[i];
    const destination = gigs[i + 1];

    // Skip if same city (no flight needed)
    if (origin.city === destination.city && origin.state === destination.state) {
      continue;
    }

    const originCode = getIataCode(origin.city, origin.state);
    const destinationCode = getIataCode(destination.city, destination.state);

    // Skip if we can't resolve either airport
    if (!originCode || !destinationCode) {
      continue;
    }

    // Departure date = day after the origin gig
    const gigDate = new Date(origin.date + "T00:00:00");
    gigDate.setDate(gigDate.getDate() + 1);
    const departureDate = gigDate.toISOString().split("T")[0];

    legs.push({
      originGigId: origin.id,
      destinationGigId: destination.id,
      originCity: `${origin.city}, ${origin.state}`,
      destinationCity: `${destination.city}, ${destination.state}`,
      originCode,
      destinationCode,
      departureDate,
    });
  }

  return legs;
}
