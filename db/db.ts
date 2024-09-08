import type {AvailabilityWrapper, UnitWish} from "../types.ts";
import type {UnitWishlistAirtableRecords, UnitWishlistAirtableResponse} from "./db_types.ts";

const mapToWantedAccommodations = (
	jsonBody: UnitWishlistAirtableResponse,
): UnitWish[] => {
	return jsonBody.records.map((row: UnitWishlistAirtableRecords) => {
		const mapping: UnitWish = {
			...row.fields,
			cabin_group_name: row.fields.cabin_group_name[0],
			cabin_group_id: row.fields.cabin_group_id[0],
			domain: row.fields.domain[0],
			unit_id_to: row.fields.unit_id_to
				? row.fields.unit_id_to
				: row.fields.unit_id_from,
			to: row.fields.to ? row.fields.to : row.fields.from,
			airtable_id: row.id,
		};
		return mapping;
	});
};

const formula = "AND(IS_AFTER({to}, TODAY()), {is_active})";

const fetchWishListFromDb = async (): Promise<UnitWish[]> => {
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
		const res = await response.json();
		return mapToWantedAccommodations(res);
	} catch (error) {
		console.error(error);
		return [];
	}
};

const turnOffNotification = async (match: AvailabilityWrapper) => {
	try {
		const response = await fetch(
			`https://api.airtable.com/v0/${Bun.env.AIRTABLE_APP}/${Bun.env.AIRTABLE_TABLE}/${match.unitWish.airtable_id}`,
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

export { fetchWishListFromDb, turnOffNotification };
