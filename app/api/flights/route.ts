import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { computeFlightLegs } from "@/lib/flights/compute-legs";
import { searchFlights } from "@/lib/flights/amadeus";
import type { FlightLeg, FlightOffer } from "@/lib/flights";

export interface FlightLegWithOffers extends FlightLeg {
  offers: FlightOffer[];
  error?: string;
}

export interface FlightsApiResponse {
  legs: FlightLegWithOffers[];
}

/**
 * GET /api/flights?tourId=<uuid>
 *
 * Returns flight options for each consecutive gig pair in a tour.
 * Requires authentication.
 */
export async function GET(request: NextRequest) {
  // Require authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get tour ID from query params
  const tourId = request.nextUrl.searchParams.get("tourId");
  if (!tourId) {
    return NextResponse.json(
      { error: "tourId query parameter is required" },
      { status: 400 }
    );
  }

  // Fetch gigs for this tour, ordered by date
  const gigs = await db.query.gigs.findMany({
    where: (gigs, { eq }) => eq(gigs.tour_id, tourId),
    orderBy: (gigs, { asc }) => [asc(gigs.date)],
  });

  if (gigs.length < 2) {
    return NextResponse.json({ legs: [] } satisfies FlightsApiResponse);
  }

  // Compute flight legs from consecutive gigs
  const legs = computeFlightLegs(gigs);

  // Fetch flight offers for each leg in parallel
  const legsWithOffers: FlightLegWithOffers[] = await Promise.all(
    legs.map(async (leg) => {
      try {
        const offers = await searchFlights(
          leg.originCode,
          leg.destinationCode,
          leg.departureDate,
          3
        );
        return { ...leg, offers };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { ...leg, offers: [], error: message };
      }
    })
  );

  return NextResponse.json({ legs: legsWithOffers } satisfies FlightsApiResponse);
}
