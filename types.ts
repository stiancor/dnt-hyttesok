export type AvailabilityResponse = {
	items: Array<{
		webProducts: Array<{
			id: number;
			type: string;
			encryptedCompanyId: string;
			availability: {
				available: boolean;
				reason: string | null;
				reasonText: string;
				steps: Array<{
					availableUnits: number;
					from: string;
					to: string;
				}>;
			};
		}>;
		date: string;
	}>;
};

export type UnitFetchResult = {
	unit: number;
	urlData: {
		url: string;
		data: AvailabilityResponse;
	}[];
};

export type AvailabilityResponseWrapper = {
	responses: UnitFetchResult[];
	unitWish: UnitWish;
};

export type AvailabilityWrapper = {
	unitWish: UnitWish;
	availabilityDates: Date[];
};

export type UnitWish = {
	airtable_id: string;
	name: string;
	unit_id_from: number;
	unit_id_to: number;
	from: string;
	to: string;
	wanted_number_of_units: number; // Dette kan være en seng i en hytte, et rom eller også hele hytta
	allow_partial_match: boolean;
	is_active: boolean;
	cabin_group_id: number;
	cabin_group_name: string;
	domain: string;
};

export type UrlMetaData = {
	cabinId: number;
	unitId: number;
	month: string;
	domain: string;
};

export type UnitUrls = {
	unitId: number;
	urls: string[];
};
