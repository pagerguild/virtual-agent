Feature: Flight Options Between Consecutive Gig Cities — IATA mapping, leg computation, Amadeus API, and dashboard display
  As a touring artist using virtual-agent
  I want to see flight options between consecutive gig cities on my dashboard
  So that I can compare flights and plan travel between tour stops

  # ── AC #1 — IATA code mapping ─────────────────────────────────────────

  Scenario: IATA codes module maps 55+ US city/state pairs to airport codes
    Given the file "lib/flights/iata-codes.ts" exists
    Then it should export a "getIataCode" function
    And it should export a "hasIataCode" function
    And the mapping should contain at least 55 city/state entries

  Scenario: Known city/state pairs return correct IATA codes
    Given the IATA codes module is loaded
    When I look up "New York" with state "NY"
    Then the IATA code should be "JFK"
    When I look up "Los Angeles" with state "CA"
    Then the IATA code should be "LAX"
    When I look up "Chicago" with state "IL"
    Then the IATA code should be "ORD"
    When I look up "Austin" with state "TX"
    Then the IATA code should be "AUS"
    When I look up "Miami" with state "FL"
    Then the IATA code should be "MIA"

  Scenario: Unknown city/state pairs return null
    Given the IATA codes module is loaded
    When I look up "Smalltown" with state "XX"
    Then the result should be null
    And "hasIataCode" should return false for "Smalltown", "XX"

  # ── AC #2 — Flight leg computation ────────────────────────────────────

  Scenario: Compute flight legs from date-ordered gigs in different cities
    Given a tour with the following gigs in date order:
      | city        | state | date       |
      | New York    | NY    | 2026-04-10 |
      | Chicago     | IL    | 2026-04-12 |
      | Austin      | TX    | 2026-04-15 |
    When I compute flight legs
    Then 2 flight legs should be returned
    And leg 1 should be from "JFK" to "ORD" departing "2026-04-11"
    And leg 2 should be from "ORD" to "AUS" departing "2026-04-13"

  Scenario: Departure date is the day after the origin gig
    Given a gig in "New York", "NY" on "2026-04-10"
    And the next gig in "Chicago", "IL" on "2026-04-12"
    When I compute flight legs
    Then the departure date should be "2026-04-11"

  Scenario: Same-city consecutive gigs are skipped
    Given a tour with the following gigs in date order:
      | city        | state | date       |
      | New York    | NY    | 2026-04-10 |
      | New York    | NY    | 2026-04-11 |
      | Chicago     | IL    | 2026-04-13 |
    When I compute flight legs
    Then 1 flight leg should be returned
    And leg 1 should be from "JFK" to "ORD" departing "2026-04-12"

  Scenario: Gigs with unknown IATA codes are skipped
    Given a tour with the following gigs in date order:
      | city        | state | date       |
      | New York    | NY    | 2026-04-10 |
      | Smalltown   | XX    | 2026-04-12 |
      | Chicago     | IL    | 2026-04-15 |
    When I compute flight legs
    Then legs involving "Smalltown, XX" should be skipped
    And the remaining legs should still be computed

  Scenario: Tour with fewer than 2 gigs returns no legs
    Given a tour with 1 gig
    When I compute flight legs
    Then 0 flight legs should be returned

  Scenario: Month boundary dates are handled correctly
    Given a gig in "New York", "NY" on "2026-01-31"
    And the next gig in "Chicago", "IL" on "2026-02-02"
    When I compute flight legs
    Then the departure date should be "2026-02-01"

  # ── AC #3 — Amadeus API client ────────────────────────────────────────

  Scenario: Amadeus module authenticates via OAuth2 client credentials
    Given the file "lib/flights/amadeus.ts" exists
    Then it should export a "getAmadeusToken" function
    And it should export a "searchFlights" function
    And it should export a "formatDuration" function
    And it should export a "resetTokenCache" function

  Scenario: Amadeus client uses AMADEUS_API_KEY and AMADEUS_API_SECRET environment variables
    Given the Amadeus module is loaded
    When "AMADEUS_API_KEY" or "AMADEUS_API_SECRET" is not set
    Then "getAmadeusToken" should throw an error mentioning the required environment variables

  Scenario: Amadeus token is cached and reused within the same server process
    Given the Amadeus client has obtained a valid OAuth2 token
    When a second flight search is performed before the token expires
    Then the cached token should be reused without a new OAuth2 request

  Scenario: searchFlights returns up to 3 offers per leg with expected fields
    Given valid Amadeus API credentials are configured
    When I search for flights from "JFK" to "ORD" on "2026-04-11" with max 3 results
    Then up to 3 flight offers should be returned
    And each offer should include "id", "price", "currency", "carrier", "carrierName", "stops", "departureTime", "arrivalTime", "duration", and "durationFormatted"

  Scenario: formatDuration converts ISO 8601 duration to human-readable format
    Given the duration string "PT4H30M"
    When I format it using formatDuration
    Then the result should be "4h 30m"

  Scenario: formatDuration handles hours-only duration
    Given the duration string "PT2H"
    When I format it using formatDuration
    Then the result should be "2h"

  Scenario: formatDuration handles minutes-only duration
    Given the duration string "PT45M"
    When I format it using formatDuration
    Then the result should be "45m"

  Scenario: Multi-segment flights compute total stops correctly
    Given a flight offer with 3 segments
    Then the total stops should be 2

  # ── AC #4 — Barrel exports ────────────────────────────────────────────

  Scenario: Flights barrel module exports all public members
    Given the file "lib/flights/index.ts" exists
    Then it should export "getIataCode" from "iata-codes"
    And it should export "hasIataCode" from "iata-codes"
    And it should export "computeFlightLegs" from "compute-legs"
    And it should export the "GigForLeg" type from "compute-legs"
    And it should export the "FlightLeg" type from "compute-legs"
    And it should export "searchFlights" from "amadeus"
    And it should export "formatDuration" from "amadeus"
    And it should export "resetTokenCache" from "amadeus"
    And it should export the "FlightOffer" type from "amadeus"

  # ── AC #5 — Flights API endpoint ──────────────────────────────────────

  Scenario: Flights API route is an auth-gated GET endpoint
    Given the file "app/api/flights/route.ts" exists
    Then it should export a "GET" handler function

  Scenario: Unauthenticated request to /api/flights returns 401
    Given the user is not authenticated
    When I send a GET request to "/api/flights?tourId=some-id"
    Then the response status should be 401
    And the response body should contain an "error" field with value "Unauthorized"

  Scenario: Request without tourId parameter returns 400
    Given the user is authenticated with a valid Supabase session
    When I send a GET request to "/api/flights" without a tourId parameter
    Then the response status should be 400
    And the response body should contain an "error" field mentioning "tourId"

  Scenario: Valid request returns legs with flight offers
    Given the user is authenticated with a valid Supabase session
    And a tour exists with 3 gigs in different cities
    When I send a GET request to "/api/flights?tourId=<tour-id>"
    Then the response status should be 200
    And the response body should contain a "legs" array
    And each leg should have "originCity", "destinationCity", "originCode", "destinationCode", "departureDate", and "offers"

  Scenario: Per-leg error handling preserves other leg results
    Given a tour with 3 legs where one Amadeus API call fails
    When I request flight options for the tour
    Then the failed leg should have an empty "offers" array and an "error" field
    And the other legs should still contain flight offer data

  Scenario: Tour with fewer than 2 gigs returns empty legs array
    Given the user is authenticated with a valid Supabase session
    And a tour exists with 1 gig
    When I send a GET request to "/api/flights?tourId=<tour-id>"
    Then the response body should contain an empty "legs" array

  # ── AC #6 — FlightOptions client component ────────────────────────────

  Scenario: FlightOptions component is a client component
    Given the file "components/flight-options.tsx" exists
    Then the first line should be a "use client" directive
    And the component should accept a "tourId" prop

  Scenario: FlightOptions displays a loading state while fetching
    Given the FlightOptions component is mounted with a valid tourId
    When the flight data is being fetched
    Then a loading indicator should be visible with test ID "flight-options-loading"
    And the section should have a heading "Flight Options"

  Scenario: FlightOptions displays an error state when the API call fails
    Given the FlightOptions component is mounted with a valid tourId
    When the API request to "/api/flights" fails
    Then an error message should be visible with test ID "flight-options-error"

  Scenario: FlightOptions displays an empty state when no legs are needed
    Given the FlightOptions component is mounted with a valid tourId
    When the API returns an empty legs array
    Then a message "No flight legs needed for this tour." should be displayed

  Scenario: FlightOptions renders each leg as a card with route information
    Given the FlightOptions component has loaded flight data with 2 legs
    Then 2 leg cards should be rendered with test ID "flight-leg"
    And each leg card should display the origin city and destination city
    And each leg card should display the origin IATA code and destination IATA code
    And each leg card should display the departure date

  Scenario: FlightOptions renders flight offer rows within each leg card
    Given a leg card with 3 flight offers
    Then 3 offer rows should be rendered within the card with test ID "flight-offer"
    And each offer row should display the airline carrier name
    And each offer row should display departure and arrival times
    And each offer row should display the flight duration
    And each offer row should display the number of stops
    And each offer row should display the price with currency

  Scenario: Nonstop flights display "Nonstop" label
    Given a flight offer with 0 stops
    Then the stops display should show "Nonstop"

  Scenario: Flights with 1 stop display "1 stop" label
    Given a flight offer with 1 stop
    Then the stops display should show "1 stop"

  Scenario: Flights with multiple stops display pluralized label
    Given a flight offer with 2 stops
    Then the stops display should show "2 stops"

  Scenario: Leg with API error shows warning and still renders other legs
    Given a leg that returned an error from the Amadeus API
    Then the leg card should display a warning message with test ID "flight-leg-error"
    And other legs without errors should still display their offers normally

  # ── AC #7 — Dashboard integration ─────────────────────────────────────

  Scenario: Dashboard renders FlightOptions between Gigs and Bookings when tour has 2+ gigs
    Given the seed script has run
    And the user is authenticated and on the "/dashboard" page
    And the active tour has 2 or more gigs
    Then a "Flight Options" section should be visible with test ID "flight-options-section"
    And the "Flight Options" section should appear after the gigs section
    And the "Flight Options" section should appear before the bookings section

  Scenario: Dashboard does not render FlightOptions when tour has fewer than 2 gigs
    Given the user is authenticated and on the "/dashboard" page
    And the active tour has fewer than 2 gigs
    Then the "Flight Options" section should not be visible

  Scenario: Dashboard imports FlightOptions from components/flight-options
    Given the file "app/dashboard/page.tsx" exists
    Then it should import "FlightOptions" from "@/components/flight-options"

  # ── AC #8 — Unit tests pass ───────────────────────────────────────────

  Scenario: IATA codes unit tests pass
    Given the test file "lib/flights/__tests__/iata-codes.test.ts" exists
    When I run the IATA codes test suite
    Then all tests should pass

  Scenario: Compute legs unit tests pass
    Given the test file "lib/flights/__tests__/compute-legs.test.ts" exists
    When I run the compute legs test suite
    Then all tests should pass

  Scenario: Amadeus client unit tests pass
    Given the test file "lib/flights/__tests__/amadeus.test.ts" exists
    When I run the Amadeus client test suite
    Then all tests should pass

  Scenario: Flight options dashboard integration tests pass
    Given the test file "tests/flight-options-dashboard.test.ts" exists
    When I run the flight options dashboard test suite
    Then all tests should pass

  # ── AC #9 — No regressions ───────────────────────────────────────────

  Scenario: All existing tests continue to pass
    When I run the full test suite
    Then all previously passing tests should still pass
    And there should be no regressions introduced by the flights feature

  # ── Environment & Configuration ────────────────────────────────────────

  Scenario: Amadeus API credentials are required as environment variables
    Then the environment should require "AMADEUS_API_KEY" to be configured
    And the environment should require "AMADEUS_API_SECRET" to be configured

  # ── Visual Verification ────────────────────────────────────────────────

  Scenario: End-to-end visual verification of flight options on the dashboard
    Given the dev server is running
    And "npm run db:migrate" and "npm run db:seed" have completed successfully
    And Amadeus API credentials are configured in the environment
    When the user navigates to "http://localhost:3000/login"
    And the user signs in with valid credentials
    Then the browser redirects to "/dashboard"
    And the dashboard displays the gigs section with multiple cities
    And below the gigs section, a "Flight Options" section appears
    And the Flight Options section shows leg cards for consecutive gig city pairs
    And each leg card displays the route (e.g., "New York, NY → Chicago, IL")
    And each leg card displays IATA codes (e.g., "JFK → ORD")
    And each leg card shows up to 3 flight offers with airline, price, times, duration, and stops
    And the Flight Options section appears before the bookings section
