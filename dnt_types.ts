type Step = {
	from: string;
	to: string;
};

type CabinAvailability = {
	available: boolean;
	steps: Step[];
};

type Price = {
	name: string;
	priceType: string;
	originalPricePerStep: number;
	pricePerStep: number;
	calculatedPrice: number;
	steps: Step[];
};

type AdditionalService = {
	name: string;
	price: number;
	serviceType: string;
};

export type Accommodation = {
	availability: CabinAvailability;
	unitName: string;
	prices: Price[];
	additionalServices: AdditionalService[];
	minPeople: number;
	maxPeople: number;
	externalDbId: string;
};

export type AccommodationWrapper = {
	accommodations: Accommodation[];
	externalId: string;
};
