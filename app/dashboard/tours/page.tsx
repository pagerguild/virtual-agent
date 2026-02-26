import { getToursWithGigs } from "@/db/queries/tours";

export const dynamic = "force-dynamic";

export default async function ToursPage() {
  const tours = await getToursWithGigs();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Tours</h1>

      {tours.length > 0 ? (
        <div className="space-y-6">
          {tours.map((tour) => (
            <section
              key={tour.id}
              data-testid="tour-card"
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-xl font-bold text-gray-900"
                  data-testid="tour-name"
                >
                  {tour.name}
                </h2>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {tour.status}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span>
                  {tour.start_date} → {tour.end_date}
                </span>
                {tour.budget && <span>Budget: ${tour.budget}</span>}
                <span data-testid="gig-count">
                  {tour.gigs.length} {tour.gigs.length === 1 ? "gig" : "gigs"}
                </span>
              </div>

              {tour.gigs.length > 0 && (
                <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
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
                      {tour.gigs.map((gig) => (
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
              )}
            </section>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No tours found.</p>
      )}
    </div>
  );
}
