# Featured car landing page fix

This patch updates the landing page hero card so it no longer uses a hard-coded external image and hard-coded Nissan Qashqai text.

Changed files:

- `src/app/components/home/home/home.component.ts`
- `src/app/components/home/home/home.component.html`

Behaviour:

- Loads the featured car from the existing `CarService` catalogue.
- Uses the selected car's `imagePath`, `brandName`, `carName`, and `description`.
- Chooses a random catalogue car on page load.
- Stores the last featured car ID in `localStorage` and avoids selecting the same featured car on the next page load when there is more than one vehicle.
