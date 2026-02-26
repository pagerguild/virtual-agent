import { getRidersWithGigs } from "@/db/queries/riders";

export const dynamic = "force-dynamic";

interface RiderContent {
  hospitality?: Record<string, string[]>;
  technical?: Record<string, string[]>;
  travel?: string[];
  misc?: string[];
}

export default async function RidersPage() {
  const riders = await getRidersWithGigs();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Riders</h1>

      {riders.length > 0 ? (
        <div className="space-y-6">
          {riders.map((rider) => {
            const content = rider.content as RiderContent | null;

            return (
              <section
                key={rider.id}
                data-testid="rider-card"
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {rider.gig
                      ? `${rider.gig.venue_name} — ${rider.gig.city}, ${rider.gig.state}`
                      : "Unknown Gig"}
                  </h2>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      rider.status === "signed"
                        ? "bg-green-100 text-green-800"
                        : rider.status === "sent"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {rider.status}
                  </span>
                </div>

                {rider.gig && (
                  <p className="mt-1 text-sm text-gray-500">
                    {rider.gig.date}
                  </p>
                )}

                {content && (
                  <div
                    className="mt-4 space-y-4"
                    data-testid="rider-content"
                  >
                    {content.hospitality && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700">
                          Hospitality
                        </h3>
                        {Object.entries(content.hospitality).map(
                          ([section, items]) => (
                            <div key={section} className="mt-2">
                              <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                {section.replace(/_/g, " ")}
                              </h4>
                              <ul className="mt-1 list-disc pl-5 text-sm text-gray-600">
                                {items.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {content.technical && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700">
                          Technical
                        </h3>
                        {Object.entries(content.technical).map(
                          ([section, items]) => (
                            <div key={section} className="mt-2">
                              <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                {section.replace(/_/g, " ")}
                              </h4>
                              <ul className="mt-1 list-disc pl-5 text-sm text-gray-600">
                                {items.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {content.travel && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700">
                          Travel
                        </h3>
                        <ul className="mt-1 list-disc pl-5 text-sm text-gray-600">
                          {content.travel.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {content.misc && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700">
                          Miscellaneous
                        </h3>
                        <ul className="mt-1 list-disc pl-5 text-sm text-gray-600">
                          {content.misc.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No riders found.</p>
      )}
    </div>
  );
}
