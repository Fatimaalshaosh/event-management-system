// Provider-agnostic hotel-search abstraction. The booking center talks to this
// registry rather than any single vendor, so a real provider (HotelBeds, Amadeus
// Hotels, Booking.com, etc.) can be slotted in later without touching routes or
// the frontend. Only the Demo provider is functional; the rest are declared stubs.

import {
  generateHotelOffers,
  type HotelOffer,
  type HotelSearchCriteria,
} from "./hotels";

export type ProviderStatus = "active" | "future" | "manual";

export type HotelProviderInfo = {
  id: string;
  name: string;
  nameAr: string;
  status: ProviderStatus;
};

export interface HotelProvider extends HotelProviderInfo {
  search(criteria: HotelSearchCriteria): HotelOffer[];
}

class DemoHotelProvider implements HotelProvider {
  id = "demo";
  name = "Demo Provider";
  nameAr = "مزوّد تجريبي";
  status: ProviderStatus = "active";
  search(criteria: HotelSearchCriteria): HotelOffer[] {
    return generateHotelOffers(criteria);
  }
}

// Stub providers advertise themselves but cannot search yet. Selecting one
// surfaces a clear "not configured" error rather than silently returning demo
// data, keeping failures explicit.
class StubHotelProvider implements HotelProvider {
  constructor(
    public id: string,
    public name: string,
    public nameAr: string,
    public status: ProviderStatus,
  ) {}
  search(): HotelOffer[] {
    throw new HotelProviderNotConfiguredError(this.id);
  }
}

export class HotelProviderNotConfiguredError extends Error {
  constructor(public providerId: string) {
    super(`Hotel provider "${providerId}" is not configured`);
    this.name = "HotelProviderNotConfiguredError";
  }
}

export class UnknownHotelProviderError extends Error {
  constructor(public providerId: string) {
    super(`Unknown hotel provider "${providerId}"`);
    this.name = "UnknownHotelProviderError";
  }
}

export class HotelProviderService {
  private providers = new Map<string, HotelProvider>();
  readonly defaultProviderId = "demo";

  constructor() {
    this.register(new DemoHotelProvider());
    this.register(new StubHotelProvider("hotelbeds", "HotelBeds", "هوتل بيدز", "future"));
    this.register(new StubHotelProvider("amadeus", "Amadeus Hotels", "أماديوس للفنادق", "future"));
    this.register(new StubHotelProvider("booking", "Booking.com", "بوكينج دوت كوم", "future"));
    this.register(new StubHotelProvider("manual", "Manual Entry", "إدخال يدوي", "manual"));
  }

  private register(provider: HotelProvider): void {
    this.providers.set(provider.id, provider);
  }

  has(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  list(): HotelProviderInfo[] {
    return [...this.providers.values()].map(({ id, name, nameAr, status }) => ({
      id,
      name,
      nameAr,
      status,
    }));
  }

  search(providerId: string | undefined, criteria: HotelSearchCriteria): HotelOffer[] {
    const provider = this.providers.get(providerId ?? this.defaultProviderId);
    if (!provider) {
      throw new UnknownHotelProviderError(providerId ?? this.defaultProviderId);
    }
    return provider.search(criteria);
  }

  // Validates that a provider can actually create bookings. Only active
  // providers (Demo today) are bookable; stubs surface an explicit
  // "not configured" error instead of silently writing a fake reservation.
  assertBookable(providerId: string | undefined): string {
    const id = providerId ?? this.defaultProviderId;
    const provider = this.providers.get(id);
    if (!provider) {
      throw new UnknownHotelProviderError(id);
    }
    if (provider.status !== "active") {
      throw new HotelProviderNotConfiguredError(id);
    }
    return id;
  }
}

export const hotelProviderService = new HotelProviderService();
