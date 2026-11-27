# Standalone Restaurant POS

## What will be built
- Add a separate `/restaurant-pos` entry with a simple sign-in screen and a focused, full-page POS experience; reuse the existing restaurant POS, kitchen, reservations, table layout, billing, and print flow.
- Use the existing email/password account system for sign-in. Avoid adding profile fields or new account records unless the user requests them.
- Replace the current flat GST calculation with separate configurable Food and Beverage rates. Show GST in order totals, payment confirmation, and printed bills, with a clear split into CGST and SGST where applicable.
- Keep the existing `/app/restaurant` module working with the same tax calculation and settings.

## Technical approach
- Add a standalone restaurant portal page and route; keep the established POS component as the shared operating screen.
- Add a small shared tax-calculation helper and tests; preserve tax-rate snapshots on submitted orders so later setting changes do not rewrite earlier bills.
- Store demo POS configuration only in the browser for now; no new database table or role system is part of this request.

## Dependency
- Use the GST rates the user selects. Login/profile handling stays aligned with the user's answer about profile data.
