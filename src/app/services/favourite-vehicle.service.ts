import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavouriteVehicleService {
  private readonly favouritesKey = 'rentacar-favourite-vehicle-ids';
  private readonly recentlyViewedKey = 'rentacar-recently-viewed-vehicle-ids';
  private readonly recentlyViewedLimit = 12;

  getFavouriteIds(): number[] {
    return this.readIds(this.favouritesKey);
  }

  isFavourite(carId: number | string | undefined | null): boolean {
    const id = this.toNumber(carId);
    return !!id && this.getFavouriteIds().includes(id);
  }

  addFavourite(carId: number | string | undefined | null): void {
    const id = this.toNumber(carId);
    if (!id) {
      return;
    }

    const ids = this.getFavouriteIds();
    if (!ids.includes(id)) {
      this.writeIds(this.favouritesKey, [id, ...ids]);
    }
  }

  removeFavourite(carId: number | string | undefined | null): void {
    const id = this.toNumber(carId);
    if (!id) {
      return;
    }

    this.writeIds(this.favouritesKey, this.getFavouriteIds().filter((item) => item !== id));
  }

  toggleFavourite(carId: number | string | undefined | null): boolean {
    const id = this.toNumber(carId);
    if (!id) {
      return false;
    }

    if (this.isFavourite(id)) {
      this.removeFavourite(id);
      return false;
    }

    this.addFavourite(id);
    return true;
  }

  getRecentlyViewedIds(): number[] {
    return this.readIds(this.recentlyViewedKey);
  }

  addRecentlyViewed(carId: number | string | undefined | null): void {
    const id = this.toNumber(carId);
    if (!id) {
      return;
    }

    const ids = this.getRecentlyViewedIds().filter((item) => item !== id);
    this.writeIds(this.recentlyViewedKey, [id, ...ids].slice(0, this.recentlyViewedLimit));
  }

  clearRecentlyViewed(): void {
    localStorage.removeItem(this.recentlyViewedKey);
  }


  private readIds(key: string): number[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return [];
      }

      return JSON.parse(raw)
        .map((item: unknown) => Number(item))
        .filter((item: number) => Number.isFinite(item) && item > 0);
    } catch {
      return [];
    }
  }

  private writeIds(key: string, ids: number[]): void {
    localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids))));
  }

  private toNumber(value: number | string | undefined | null): number | undefined {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : undefined;
  }
}
