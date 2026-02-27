"use client";

import { useEffect, useState } from "react";
import type { FlightLegWithOffers } from "@/app/api/flights/route";

interface FlightOptionsProps {
  tourId: string;
}

export function FlightOptions({ tourId }: FlightOptionsProps) {
  const [legs, setLegs] = useState<FlightLegWithOffers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFlights() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/flights?tourId=${tourId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setLegs(data.legs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load flights");
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
  }, [tourId]);

  if (loading) {
    return (
      <section data-testid="flight-options-section">
        <h2 className="text-lg font-semibold text-gray-900">
          Flight Options
        </h2>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500" data-testid="flight-options-loading">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading flight options…
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section data-testid="flight-options-section">
        <h2 className="text-lg font-semibold text-gray-900">
          Flight Options
        </h2>
        <p className="mt-2 text-sm text-red-600" data-testid="flight-options-error">
          {error}
        </p>
      </section>
    );
  }

  if (legs.length === 0) {
    return (
      <section data-testid="flight-options-section">
        <h2 className="text-lg font-semibold text-gray-900">
          Flight Options
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          No flight legs needed for this tour.
        </p>
      </section>
    );
  }

  return (
    <section data-testid="flight-options-section">
      <h2 className="text-lg font-semibold text-gray-900">
        Flight Options{" "}
        <span className="text-sm font-normal text-gray-500">
          ({legs.length} {legs.length === 1 ? "leg" : "legs"})
        </span>
      </h2>
      <div className="mt-2 space-y-4">
        {legs.map((leg) => (
          <div
            key={`${leg.originGigId}-${leg.destinationGigId}`}
            data-testid="flight-leg"
            className="rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            {/* Leg header */}
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2" data-testid="flight-leg-route">
                  <span className="font-medium text-gray-900">
                    {leg.originCity}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium text-gray-900">
                    {leg.destinationCity}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs" data-testid="flight-leg-origin-code">
                    {leg.originCode}
                  </span>
                  <span>→</span>
                  <span className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs" data-testid="flight-leg-destination-code">
                    {leg.destinationCode}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500" data-testid="flight-leg-date">
                Departure: {leg.departureDate}
              </p>
            </div>

            {/* Flight offers */}
            <div className="p-4">
              {leg.error && (
                <p className="mb-2 text-sm text-amber-600" data-testid="flight-leg-error">
                  ⚠ Could not load flights: {leg.error}
                </p>
              )}
              {leg.offers.length > 0 ? (
                <div className="space-y-2">
                  {leg.offers.map((offer) => (
                    <div
                      key={offer.id}
                      data-testid="flight-offer"
                      className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <span
                            className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800"
                            data-testid="flight-offer-carrier"
                          >
                            ✈️ {offer.carrierName}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600" data-testid="flight-offer-times">
                          <span className="font-medium text-gray-900">
                            {formatTime(offer.departureTime)}
                          </span>
                          {" → "}
                          <span className="font-medium text-gray-900">
                            {formatTime(offer.arrivalTime)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500" data-testid="flight-offer-duration">
                          {offer.durationFormatted}
                        </div>
                        <div className="text-xs text-gray-400" data-testid="flight-offer-stops">
                          {offer.stops === 0
                            ? "Nonstop"
                            : `${offer.stops} stop${offer.stops > 1 ? "s" : ""}`}
                        </div>
                      </div>
                      <div
                        className="text-right font-semibold text-gray-900"
                        data-testid="flight-offer-price"
                      >
                        {formatPrice(offer.price, offer.currency)}
                        <span className="ml-1 text-xs font-normal text-gray-400">
                          {offer.currency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !leg.error && (
                  <p className="text-sm text-gray-500">
                    No flights found for this route.
                  </p>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Format an ISO datetime string to a short time display.
 * e.g., "2026-04-11T08:30:00" → "8:30 AM"
 */
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatPrice(price: string, currency: string): string {
  const value = Number(price);
  if (!Number.isFinite(value)) return price;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return price;
  }
}
