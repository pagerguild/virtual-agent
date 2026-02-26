import { db } from "@/db";

export async function getRidersWithGigs() {
  const allRiders = await db.query.riders.findMany({
    orderBy: (riders, { desc }) => [desc(riders.created_at)],
  });

  const ridersWithGigs = await Promise.all(
    allRiders.map(async (rider) => {
      const gig = await db.query.gigs.findFirst({
        where: (gigs, { eq }) => eq(gigs.id, rider.gig_id),
      });
      return { ...rider, gig: gig ?? null };
    })
  );

  return ridersWithGigs;
}
