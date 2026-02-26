import { db } from "@/db";
import { tours, gigs } from "@/db/schema";
import { eq, count, asc } from "drizzle-orm";

export async function getToursWithGigs() {
  const allTours = await db.query.tours.findMany({
    orderBy: (tours, { desc }) => [desc(tours.start_date)],
  });

  const toursWithGigs = await Promise.all(
    allTours.map(async (tour) => {
      const tourGigs = await db.query.gigs.findMany({
        where: (gigs, { eq }) => eq(gigs.tour_id, tour.id),
        orderBy: (gigs, { asc }) => [asc(gigs.date)],
      });
      return { ...tour, gigs: tourGigs };
    })
  );

  return toursWithGigs;
}
