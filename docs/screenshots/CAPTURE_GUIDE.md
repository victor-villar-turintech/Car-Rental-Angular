# Screenshot Capture Guide

The README renders screenshots from this folder only:

```text
docs/screenshots/
```

Do not use the legacy `Readme-Images/` folder. It has been removed and should not be recreated.

## Required screenshot files

Capture and save the following files using these exact names:

| Filename | Route / area |
| --- | --- |
| `home.png` | `/home` landing page |
| `catalogue.png` | `/cars` vehicle catalogue |
| `compare.png` | `/compare` comparison page with several vehicles selected |
| `car-detail.png` | `/cars/1` or equivalent vehicle detail page |
| `rental-booking.png` | `/car/rental/1` with dates/extras visible |
| `payment.png` | `/payment/<booking-reference>` with payment, discount and rewards fields visible |
| `receipt.png` | `/booking-confirmation/<booking-reference>` |
| `account.png` | `/account` customer dashboard |
| `account-rewards.png` | `/account/rewards` |
| `account-favourites.png` | `/account/favourites` |
| `admin-dashboard.png` | `/admin/dashboard` |
| `admin-cars.png` | `/admin/cars` with richer vehicle specs visible |
| `admin-customers.png` | `/admin/customers` |
| `admin-discounts.png` | `/admin/discounts` |
| `admin-discount-analytics.png` | `/admin/discount-analytics` |

## Capture setup

1. Start the app:

```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm start
```

2. Open:

```text
http://localhost:4200
```

3. Use a desktop viewport around 1440px wide for standard screenshots.

4. Save PNG files directly into `docs/screenshots/`.

## Data setup tips

- Register/login as a demo customer before capturing account pages.
- Create at least one booking before capturing payment/receipt/account booking screens.
- Use Admin credentials `admin` / `admin123` for Admin screenshots.
- Add several vehicles to `/compare` before capturing `compare.png`.
- Use demo discount codes such as `WELCOME10`, `AIRPORT15`, `WEEKEND20`, or `LOYALTY25` where available.

## Validate README image links

Run this from the repo root:

```bash
python3 - <<'PY'
from pathlib import Path
import re

text = Path("README.md").read_text()
links = re.findall(r'!\\[[^\\]]*\\]\\(([^)]+)\\)', text)
missing = []
for link in links:
    path = link.split("#")[0].split("?")[0]
    if path.startswith("http"):
        continue
    if not Path(path).exists():
        missing.append(path)

if missing:
    print("Missing README images:")
    for item in missing:
        print(" -", item)
else:
    print("README image links are valid.")
PY
```
