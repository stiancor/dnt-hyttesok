import type { WantedBooking } from "./db_types";
import type { Accommodation } from "./dnt_types";

const mapToWantedAccommodations = (jsonBody: any): WantedBooking[] => {
	return jsonBody.records.map((row: any) => {
		return {
			airtableId: row.id,
			cabin: row.fields.cabin,
			id: row.fields.id,
			wanted_number_of_beds: row.fields.wanted_number_of_beds,
			is_active: row.fields.is_active,
			from: row.fields.from,
			to: row.fields.to,
			domain: row.fields.domain,
			row: row.fields.row,
		};
	});
};

const formula = "{is_active}=TRUE()";

const fetchListOfWantedBookings = async (): Promise<WantedBooking[]> => {
	try {
		const response = await fetch(
			`https://api.airtable.com/v0/${Bun.env.AIRTABLE_APP}/${
				Bun.env.AIRTABLE_TABLE
			}?filterByFormula=${encodeURIComponent(formula)}`,
			{
				headers: {
					accept: "application/json",
					Authorization: `Bearer ${Bun.env.AIRTABLE_SECRET}`,
				},
			},
		);

		if (!response.ok) {
			console.error(
				`Error fetching data from Airtable ${response.status}. Response: ${response.body}`,
			);
		}
		return mapToWantedAccommodations(await response.json());
	} catch (error) {
		console.error(error);
		return [];
	}
};

const turnOffNotification = async (accommodation: Accommodation) => {
	try {
		const response = await fetch(
			`https://api.airtable.com/v0/${Bun.env.AIRTABLE_APP}/${Bun.env.AIRTABLE_TABLE}/${accommodation.externalDbId}`,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${Bun.env.AIRTABLE_SECRET}`,
				},
				method: "PATCH",
				body: JSON.stringify({
					fields: {
						is_active: false,
					},
				}),
			},
		);
		if (!response.ok) {
			console.error(
				`Error updating data in Airtable ${response.status}. Response: ${response.body}`,
			);
		}
	} catch (error) {
		console.error(error);
	}
};

export { fetchListOfWantedBookings, turnOffNotification };
