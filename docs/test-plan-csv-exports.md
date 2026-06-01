# Test Plan — Phase 12 CSV exports (PR #29)

Tests the three Export CSV buttons added in `feature/admin-reporting`. Each test is designed so a broken implementation (button missing, wrong rows, missing/extra columns, broken CSV escaping) would produce visibly different results.

Source citations for the change being tested:
- `src/app/helpers/csv-export.ts:1-50` — helper builds the CSV string, downloads via blob URL, prepends BOM, uses CRLF.
- `src/app/components/pages/admin-dashboard/bookings-dashboard/bookings-dashboard.component.ts:71-96` — `exportBookingsCsv()` builds 21 columns and calls `downloadCsv` on `this.filteredBookings`.
- `src/app/components/pages/admin-dashboard/bookings-dashboard/bookings-dashboard.component.html:69-71` — `Export CSV` button beside the status filter.
- `src/app/components/pages/admin-fleet/fleet.component.ts:470-491` — `exportFleetCsv()` builds 14 columns on `this.filteredFleet`.
- `src/app/components/pages/admin-fleet/fleet.component.html:206` — `Export CSV` button in `.patch3f-filter-bar`.
- `src/app/components/pages/admin-dashboard/cars-dashboard/cars-dashboard.component.ts:46-59` — `exportCatalogueCsv()` builds 9 columns on `this.cars`.
- `src/app/components/pages/admin-dashboard/cars-dashboard/cars-dashboard.component.html:11` — `Export CSV` button in `.header-actions`.

## Test 1 — Bookings CSV reflects current status filter

**Pre-state:** logged in as admin, on `/admin/bookings`.

**Steps and exact assertions:**

1. Note the value of the "Total bookings" summary card → record as `N_all`.
2. Set status filter to **Pending** (or any status that has at least 1 booking; if Pending is 0 use the first non-zero status).
3. Note the visible row count in the bookings table → record as `N_filtered` (must be > 0 and ≤ N_all).
4. Click **Export CSV** beside the status filter.
5. Open the downloaded `admin-bookings-YYYYMMDD-HHMM.csv` from `~/Downloads/`.
6. **Assertion A (filename format):** filename matches regex `^admin-bookings-\d{8}-\d{4}\.csv$`. **Fail** if filename is just `admin-bookings.csv` or no timestamp.
7. **Assertion B (header row exact):** first non-BOM line equals:
   `Booking reference,Status,Customer name,Customer email,Customer phone,Vehicle,Registration,Fleet vehicle ID,Pickup location,Drop-off location,Rent date,Return date,Rental days,Extras count,Extras total,Total,Payment status,Payment method,Payment reference,Paid at,Created at`
   That's 21 columns. **Fail** if header is shorter, longer, or in a different order.
8. **Assertion C (row count):** number of data rows == `N_filtered` (i.e. file has `N_filtered + 1` lines counting the header). **Fail** if the file contains rows for a different status (which would mean the filter was ignored).
9. **Assertion D (Status column matches filter):** every row in the file has the chosen status in column "Status". **Fail** if any row has a different status.

If any of A/B/C/D fails, the feature is broken — the same observed file would not exist for a broken implementation, because we are checking the *exact* header string and *exact* filtered row count.

## Test 2 — Fleet CSV reflects search + status + location filters

**Pre-state:** logged in as admin, on `/admin/fleet`.

**Steps and exact assertions:**

1. Note the total number of fleet card tiles rendered with no filters → `M_all`.
2. Type a single-character search term that narrows the list (e.g. the first character of the first registration plate you see) into the **Search** field. Record the new visible card count → `M_filtered` (must be < M_all and > 0).
3. Click **Export CSV** at the bottom of the filter bar.
4. Open the downloaded `admin-fleet-YYYYMMDD-HHMM.csv` from `~/Downloads/`.
5. **Assertion A (filename format):** matches `^admin-fleet-\d{8}-\d{4}\.csv$`.
6. **Assertion B (header row exact):** first non-BOM line equals:
   `Fleet ID,Registration,Vehicle,Catalogue ID,Colour,Mileage,Status,Location,Service status,Next service due,Active booking,Active booking customer,Created at,Updated at`
   That's 14 columns.
7. **Assertion C (row count):** number of data rows == `M_filtered`. **Fail** if it equals `M_all` (means search was ignored).
8. **Assertion D (search term appears):** every row in the file contains the search term in either the Registration, Vehicle, Colour, or Location column (case-insensitive). **Fail** if any row lacks it.

## Test 3 — Catalogue CSV with quoted/escaped values

**Pre-state:** logged in as admin, on `/admin/cars`.

**Steps and exact assertions:**

1. Note the number of fleet rows in the catalogue table → `K`.
2. Click **Export CSV** in the header actions.
3. Open the downloaded `admin-catalogue-YYYYMMDD-HHMM.csv` from `~/Downloads/`.
4. **Assertion A (filename format):** matches `^admin-catalogue-\d{8}-\d{4}\.csv$`.
5. **Assertion B (header row exact):** first non-BOM line equals:
   `Catalogue ID,Brand,Model,Colour,Model year,Daily price (GBP),Number plate,Description,Image path`
   That's 9 columns.
6. **Assertion C (row count):** number of data rows == `K`.
7. **Assertion D (CSV escaping):** find any catalogue row whose `description` contains a comma (the demo catalogue has long marketing descriptions full of commas). In the CSV file, that row's Description field must be wrapped in double quotes (`"..."`). **Fail** if the comma in the description splits into two columns (would happen if escaping were broken).

## Negative / "could the test pass on a broken impl?" check

- If the Export CSV button were missing, Test 1/2/3 step 4/3/2 would fail at the click — no file is downloaded.
- If `filteredBookings`/`filteredFleet` had been swapped for the unfiltered collection, Assertion C would fail in Test 1 and Test 2.
- If `escapeCsvCell` were skipped, Assertion D in Test 3 would fail because Description fields containing commas would split.
- If column order were changed, Assertion B would fail in every test.

## Out of scope (intentionally)

- Re-testing Phases 1–4, 9, 11 — already done in earlier session or covered by unit tests.
- Verifying contents of all 21 booking columns row-by-row — too noisy; Assertion B + Assertion D in Test 1 are sufficient to prove the row mapping is wired up.
- Excel/Google Sheets visual rendering — UTF-8 BOM and CRLF are guaranteed by `csv-export.ts:18`; visually re-confirming would be repetitive.
