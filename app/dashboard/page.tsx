import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { getDashboardData } from "@/db/queries/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { artist, tour, gigs, bookings } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <SignOutButton />
      </div>
      <p className="text-gray-600">
        Welcome back{user?.email ? `, ${user.email}` : ""}.
      </p>

      {/* Artist */}
      {artist && (
        <section data-testid="artist-section">
          <h2 className="text-lg font-semibold text-gray-900">Artist</h2>
          <div className="mt-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xl font-bold" data-testid="artist-name">
              {artist.name}
            </p>
            <p className="text-sm text-gray-500">{artist.email}</p>
          </div>
        </section>
      )}

      {/* Tour */}
      {tour && (
        <section data-testid="tour-section">
          <h2 className="text-lg font-semibold text-gray-900">Current Tour</h2>
          <div className="mt-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xl font-bold" data-testid="tour-name">
              {tour.name}
            </p>
            <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
              <span>
                {tour.start_date} → {tour.end_date}
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {tour.status}
              </span>
              {tour.budget && <span>Budget: ${tour.budget}</span>}
            </div>
          </div>
        </section>
      )}

      {/* Gigs */}
      <section data-testid="gigs-section">
        <h2 className="text-lg font-semibold text-gray-900">
          Gigs{" "}
          <span className="text-sm font-normal text-gray-500">
            ({gigs.length})
          </span>
        </h2>
        {gigs.length > 0 ? (
          <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Venue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    City
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rider Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gigs.map((gig) => (
                  <tr key={gig.id} data-testid="gig-row">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {gig.date}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {gig.venue_name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {gig.city}, {gig.state}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {gig.fee ? `$${gig.fee}` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          gig.rider_status === "signed"
                            ? "bg-green-100 text-green-800"
                            : gig.rider_status === "sent"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {gig.rider_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No gigs scheduled yet.</p>
        )}
      </section>

      {/* Bookings */}
      <section data-testid="bookings-section">
        <h2 className="text-lg font-semibold text-gray-900">
          Bookings{" "}
          <span className="text-sm font-normal text-gray-500">
            ({bookings.length})
          </span>
        </h2>
        {bookings.length > 0 ? (
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                data-testid="booking-card"
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      booking.type === "flight"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-indigo-100 text-indigo-800"
                    }`}
                  >
                    {booking.type === "flight" ? "✈️" : "🏨"} {booking.type}
                  </span>
                  {booking.cost && (
                    <span className="text-sm font-medium text-gray-900">
                      ${booking.cost}
                    </span>
                  )}
                </div>
                {booking.provider && (
                  <p className="mt-2 font-medium text-gray-900">
                    {booking.provider}
                  </p>
                )}
                {booking.confirmation_number && (
                  <p className="text-xs text-gray-500">
                    Conf: {booking.confirmation_number}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No bookings yet.</p>
        )}
      </section>
    </div>
  );
}
