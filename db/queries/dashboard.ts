import { db } from "@/db";
import { artists, tours, gigs, bookings } from "@/db/schema";

export async function getDashboardData() {
  const [artist, tour] = await Promise.all([
    db.query.artists.findFirst(),
    db.query.tours.findFirst(),
  ]);

  const tourId = tour?.id;

  const [gigsList, bookingsList] = await Promise.all([
    tourId
      ? db.query.gigs.findMany({
          where: (gigs, { eq }) => eq(gigs.tour_id, tourId),
          orderBy: (gigs, { asc }) => [asc(gigs.date)],
        })
      : Promise.resolve([]),
    tourId
      ? db.query.bookings.findMany()
      : Promise.resolve([]),
  ]);

  return {
    artist: artist ?? null,
    tour: tour ?? null,
    gigs: gigsList,
    bookings: bookingsList,
  };
}
