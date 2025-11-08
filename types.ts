export type AvailabilityResponse = {
	data: {
		availabilityList: Array<{
			date: string;
			products: Array<{
				available: number;
				product: {
					company_id: number;
					product_id: number;
					unit_id: number;
				};
			}>;
		}>;
	};
};

export type UnitFetchResult = {
	unit: number;
	urlData: {
		url: string;
		data: AvailabilityResponse;
	}[];
	unitRange: number[];
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

export type UnitUrls = {
	name: string;
	unitId: number;
	urls: string[];
	unitRange: number[];
};
