export type WantedBooking = {
	airtableId: string;
	cabin: string;
	id: number;
	wanted_number_of_beds: number;
	is_active: boolean;
	from: string;
	to: string;
};
