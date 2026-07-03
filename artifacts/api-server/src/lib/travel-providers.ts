// Provider-agnostic travel-search abstraction. The booking center talks to this
// registry rather than any single vendor, so a real provider (Duffel, Amadeus,
// AYAT, etc.) can be slotted in later without touching routes or the frontend.
// Only the Demo provider is functional; the rest are declared stubs.

import {
  generateFlightOffers,
  type FlightOffer,
  type FlightSearchCriteria,
} from "./flights";

export type ProviderStatus = "active" | "future" | "manual";

export type TravelProviderInfo = {
  id: string;
  name: string;
  nameAr: string;
  status: ProviderStatus;
};

export interface TravelProvider extends TravelProviderInfo {
  search(criteria: FlightSearchCriteria): FlightOffer[];
}

class DemoTravelProvider implements TravelProvider {
  id = "demo";
  name = "Demo Provider";
  nameAr = "مزوّد تجريبي";
  status: ProviderStatus = "active";
  search(criteria: FlightSearchCriteria): FlightOffer[] {
    return generateFlightOffers(criteria);
  }
}

// Stub providers advertise themselves but cannot search yet. Selecting one
// surfaces a clear "not configured" error rather than silently returning demo
// data, keeping failures explicit.
class StubTravelProvider implements TravelProvider {
  constructor(
    public id: string,
    public name: string,
    public nameAr: string,
    public status: ProviderStatus,
  ) {}
  search(): FlightOffer[] {
    throw new ProviderNotConfiguredError(this.id);
  }
}

export class ProviderNotConfiguredError extends Error {
  constructor(public providerId: string) {
    super(`Travel provider "${providerId}" is not configured`);
    this.name = "ProviderNotConfiguredError";
  }
}

export class UnknownProviderError extends Error {
  constructor(public providerId: string) {
    super(`Unknown travel provider "${providerId}"`);
    this.name = "UnknownProviderError";
  }
}

export class TravelProviderService {
  private providers = new Map<string, TravelProvider>();
  readonly defaultProviderId = "demo";

  constructor() {
    this.register(new DemoTravelProvider());
    this.register(new StubTravelProvider("duffel", "Duffel", "دفل", "future"));
    this.register(new StubTravelProvider("amadeus", "Amadeus", "أماديوس", "future"));
    this.register(new StubTravelProvider("ayat", "AYAT Travel", "آيات للسفر", "future"));
    this.register(new StubTravelProvider("manual", "Manual Entry", "إدخال يدوي", "manual"));
  }

  private register(provider: TravelProvider): void {
    this.providers.set(provider.id, provider);
  }

  has(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  list(): TravelProviderInfo[] {
    return [...this.providers.values()].map(({ id, name, nameAr, status }) => ({
      id,
      name,
      nameAr,
      status,
    }));
  }

  search(providerId: string | undefined, criteria: FlightSearchCriteria): FlightOffer[] {
    const provider = this.providers.get(providerId ?? this.defaultProviderId);
    if (!provider) {
      throw new UnknownProviderError(providerId ?? this.defaultProviderId);
    }
    return provider.search(criteria);
  }
}

export const travelProviderService = new TravelProviderService();
