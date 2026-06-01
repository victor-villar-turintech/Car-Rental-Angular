import { repairDemoVehicleCatalogueData, DemoVehicleCatalogueRecord } from './demo-vehicle-catalogue-repair';

const CATALOGUE_KEY = 'vehicleCatalogue';

describe('repairDemoVehicleCatalogueData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is a no-op when no catalogue is stored', () => {
    repairDemoVehicleCatalogueData();
    expect(localStorage.getItem(CATALOGUE_KEY)).toBeNull();
  });

  it('back-fills missing dailyPrice/pricePerDay using existing values on the same record', () => {
    const catalogue: DemoVehicleCatalogueRecord[] = [
      { id: 1, displayName: 'Kia Picanto GT-Line', dailyPrice: 38 } as any
    ];
    localStorage.setItem(CATALOGUE_KEY, JSON.stringify(catalogue));

    repairDemoVehicleCatalogueData();

    const repaired: DemoVehicleCatalogueRecord[] = JSON.parse(localStorage.getItem(CATALOGUE_KEY) as string);
    expect(repaired[0].pricePerDay).toBe(38);
    expect(repaired[0].dailyPrice).toBe(38);
  });

  it('infers daily price for a known model when both dailyPrice and pricePerDay are missing', () => {
    const catalogue: DemoVehicleCatalogueRecord[] = [
      { id: 7, displayName: 'BMW 3 Series M Sport' } as any
    ];
    localStorage.setItem(CATALOGUE_KEY, JSON.stringify(catalogue));

    repairDemoVehicleCatalogueData();

    const repaired: DemoVehicleCatalogueRecord[] = JSON.parse(localStorage.getItem(CATALOGUE_KEY) as string);
    expect(repaired[0].dailyPrice).toBe(92);
    expect(repaired[0].pricePerDay).toBe(92);
  });

  it('sets repair flag and missing-prices counter after running', () => {
    const catalogue: DemoVehicleCatalogueRecord[] = [
      { id: 3, displayName: 'Ford Focus', dailyPrice: 48 } as any
    ];
    localStorage.setItem(CATALOGUE_KEY, JSON.stringify(catalogue));

    repairDemoVehicleCatalogueData();

    expect(localStorage.getItem('demoVehicleCataloguePriceRepairV3Complete')).toBe('true');
    expect(localStorage.getItem('demoVehicleCataloguePriceRepairV3MissingPrices')).toBe('0');
  });

  it('mirrors repaired catalogue to alias keys when shapes match or are empty', () => {
    const catalogue: DemoVehicleCatalogueRecord[] = [
      { id: 1, displayName: 'Kia Picanto GT-Line', dailyPrice: 38 } as any,
      { id: 2, displayName: 'BMW 3 Series M Sport' } as any
    ];
    localStorage.setItem(CATALOGUE_KEY, JSON.stringify(catalogue));

    repairDemoVehicleCatalogueData();

    const aliasA = JSON.parse(localStorage.getItem('vehicleCatalogueItems') as string);
    const aliasB = JSON.parse(localStorage.getItem('rent-a-car-demo-vehicle-catalogue') as string);
    expect(aliasA.length).toBe(2);
    expect(aliasB.length).toBe(2);
    expect(aliasA[1].dailyPrice).toBe(92);
  });

  it('back-fills make and modelName when only a displayName is supplied', () => {
    const catalogue: DemoVehicleCatalogueRecord[] = [
      { id: 99, displayName: 'Tesla Model 3 Long Range' } as any
    ];
    localStorage.setItem(CATALOGUE_KEY, JSON.stringify(catalogue));

    repairDemoVehicleCatalogueData();

    const repaired: DemoVehicleCatalogueRecord[] = JSON.parse(localStorage.getItem(CATALOGUE_KEY) as string);
    expect((repaired[0].make || '').toLowerCase()).toContain('tesla');
    expect(repaired[0].modelName).toBeDefined();
    expect(repaired[0].dailyPrice).toBeGreaterThan(0);
  });
});
