# Next polish, admin extras, payments and cleanup patch

Adds:

- Admin Extras management page at `/admin/extras`.
- Admin Payments dashboard at `/admin/payments`.
- Payment refund simulation when a paid booking is cancelled.
- Customer booking cancellation now marks paid bookings as refunded.
- Print-friendly receipt styling.
- Reusable Back to Top component.
- Back to Top on `/cars`, account bookings and receipt pages.
- Stronger mobile sticky total bar on the rental page.
- Cleanup script for old README screenshots and macOS zip metadata.

Run cleanup after applying the patch:

```bash
bash scripts/cleanup-old-readme-assets.sh
```
