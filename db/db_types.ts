export type UnitWishlistDb = {
	airtable_id?: string;
	name: string;
	unit_id_from: number;
	unit_id_to?: number;
	from: string;
	to?: string;
	wanted_number_of_units: number;
	allow_partial_match: boolean;
	is_active: boolean;
	cabin_group_id: number[];
	cabin_group_name: string[];
	domain: string[];
};

export type UnitWishlistAirtableRecords = {
	id: string;
	fields: UnitWishlistDb;
};

export type UnitWishlistAirtableResponse = {
	records: UnitWishlistAirtableRecords[];
};
