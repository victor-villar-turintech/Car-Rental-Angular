# Screenshot Capture Guide

Use this guide when refreshing README screenshots after UI changes.

## Recommended setup

1. Start the app locally:

```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm start
```

2. Open:

```text
http://localhost:4200
```

3. Capture at desktop width first, ideally 1440px wide.

## Existing README image assets

The README currently references the legacy screenshot set under:

```text
Readme-Images/
```

Existing filenames:

```text
AdminPage.PNG
CarUpdate.PNG
CarsPage.PNG
ColorPage.PNG
HomePage.PNG
HomePage2.PNG
HomePage3.PNG
HomePage4.PNG
HomePage5.PNG
HomePage6.PNG
LoginPage.PNG
RegisterPage.PNG
UserProfile.PNG
```

Keep these filenames if you are refreshing the same views.

## Newer screenshots to capture

Capture these newer routes under `docs/screenshots/`:

```text
home-professional.png                  /home
catalogue-filters-compare.png          /cars
vehicle-comparison.png                 /compare
booking-layout-extras.png              /car/rental/1
payment-discounts-rewards.png          /payment/<booking-reference>
receipt-print-view.png                 /booking-confirmation/<booking-reference>
customer-account.png                   /account
customer-favourites.png                /account/favourites
customer-rewards.png                   /account/rewards
customer-activity.png                  /account/activity
admin-dashboard.png                    /admin/dashboard
admin-cars-specs.png                   /admin/cars
admin-customers.png                    /admin/customers
admin-rewards.png                      /admin/rewards
admin-reward-settings.png              /admin/reward-settings
admin-discounts.png                    /admin/discounts
admin-discount-analytics.png           /admin/discount-analytics
admin-demo-settings.png                /admin/settings
```

## Admin credentials

```text
Username: admin
Password: admin123
```

## Suggested capture flow

1. Home page.
2. Cars catalogue.
3. Compare page with two to five selected vehicles.
4. Rental booking page with extras selected.
5. Payment page with a discount code and reward points applied.
6. Customer account pages.
7. Admin pages.

## README image rules

- Use relative paths only.
- Keep image names stable.
- Do not link to local absolute paths.
- After editing README, validate links locally.

```bash
python3 - <<'PY'
from pathlib import Path
import re
text = Path('README.md').read_text()
links = re.findall(r'!\[[^\]]*\]\(([^)]+)\)', text)
missing = []
for link in links:
    path = link.split('#')[0].split('?')[0]
    if path.startswith('http'):
        continue
    if not Path(path).exists():
        missing.append(path)
if missing:
    print('Missing README images:')
    for item in missing:
        print(' -', item)
else:
    print('README image links are valid.')
PY
```
