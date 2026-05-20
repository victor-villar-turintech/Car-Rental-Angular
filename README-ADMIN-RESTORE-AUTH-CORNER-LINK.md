# Admin restore + protected Admin access patch

This patch restores the previously implemented Admin functionality while keeping Admin authentication enabled.

Included:

- Admin route protection through `/admin/login` and `AdminAuthGuard`.
- Admin dashboard shell with Dashboard, Cars, Brands, Colours and Bookings navigation.
- Cars Admin CRUD list with number plates visible to Admin only.
- Brands Admin CRUD list.
- Colours Admin CRUD list.
- Admin metrics dashboard restored.
- Supporting local mock services for Cars, Brands and Colours.
- Discreet bottom-right `Admin` link on the public landing page pointing to `/admin/login`.

Demo Admin credentials remain:

- Username: `admin`
- Password: `admin123`
