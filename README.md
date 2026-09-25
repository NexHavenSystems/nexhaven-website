# NexHaven Systems website

The existing static GitHub Pages site at https://nexhavenos.com, updated September 25, 2026. No framework, bundler, or runtime dependency is required.

## Offers and routes

- `/`: Vacation Rental Profit Audit first; Home Services Revenue Recovery second.
- `/vacation-rentals.html`: $497–$997 paid audit, full review scope, estimated revenue leakage, and a 30-day plan. Indicative 8–10% booking-revenue optimization path; future 15–18% Full Management explicitly unavailable until licensing/operating readiness.
- `/vacation-audit.html`: quote request; no checkout or payment collection. Supports `?interest=optimization`.
- `/revenue-recovery.html`: preserved $1,500 launch-price 30-Day Revenue Recovery Pilot; A/R, stale estimates, financing follow-up, CRM updates, promises to pay, and weekly reporting.
- `/hvac.html`, `/plumbing.html`, `/roofing.html`: existing trade-specific funnels.
- `/assessment.html`: existing home-services assessment; preserves `?vertical=hvac|plumbing|roofing|other`.
- `/managed-revenue-operations.html`: recurring home-services support.
- `/privacy.html`: existing policy, with rental inquiry fields and storage behavior reflected.

AI influencer content is not part of this site. Existing brand, contact details, domain, and hosting remain in use. Old homepage `#pilot` and `#industries` links still resolve.

## Run locally

From the repository folder:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765. There is no build step. Google Fonts requires an internet connection; system fonts provide a fallback.

## Existing contact / CRM integration

`config.js` retains `https://recovery.nexhavenos.com/api/lead`. The bridge accepts name, company, email, vertical, operational fields, attribution, page path, and landing version. Rental requests use `vertical: vacation_rental` and serialize listing URL, market, property count, interest, and goals into the existing `bottleneck` notes field (under its 1,200-character limit). This preserves details without changing the bridge or downstream schema. Existing CRM/source and email subject labels may still say Revenue Leakage Assessment or Home Services; the service marker and rental details are in the payload/notes.

The browser requires `{ "received": true }` before showing receipt, prevents concurrent submissions, and times out after 12 seconds. Failure leaves the entered details available, with a prepared email, copy button, and selectable text. No success event is emitted on failure. The visitor must send the fallback email themselves. Contact details are no longer stored in session storage; campaign attribution remains session-scoped.

The bridge currently permits production origins, not localhost. Local unmocked submissions will show the fallback. A successful bridge response acknowledges at least one configured delivery channel; it is not proof that both the CRM and owner email received a record.

No guest/customer account details, passwords, access codes, or payment information belong in either form. An audit request is not a purchase. Confirm scope, fee, and timing separately before payment.

## Verification

- Ten HTML pages checked at 320, 375, 768, 1024, and 1440 pixels: no horizontal overflow or JavaScript errors.
- Internal page/anchor links, mobile menu, and Escape handling checked.
- Rental and home-services payloads, attribution, required fields, successful receipt, form reset, and no local contact-data storage checked with intercepted requests.
- HTTP 503, malformed response, network failure, and 12-second timeout checked with intercepted requests.
- Browser storage disabled: form initialization remains functional.
- Desktop homepage and mobile homepage/form screenshots visually reviewed.
- Live bridge: OPTIONS returned 204 with the production CORS origin; an empty POST correctly returned 400 before delivery.
- No valid production lead was sent during testing. Actual CRM record/owner inbox receipt remains unverified.

## Deploy

Existing GitHub Pages configuration: `NexHavenSystems/nexhaven-website`, branch `main`, root `/`, custom domain from `CNAME` (`nexhavenos.com`). Publish the reviewed changes to `main`; Pages builds and serves the static files automatically. Do not upload credentials or change the existing domain/bridge to deploy this update. Verify the Pages build succeeds and check the homepage plus both form pages after deployment.

For another static host, serve the root HTML/CSS/JS/SVG files. The form bridge would need to allow that host's origin before automatic delivery can work; email fallback remains available. There is no database migration.

Rollback by reverting the offer-update commit and publishing the revert to `main`. Preserve subsequent changes when reverting.
