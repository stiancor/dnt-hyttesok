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
                    "accept": "application/json",
                    "Authorization": `Bearer ${Bun.env.AIRTABLE_SECRET}`,
                },
            },
        );

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(
                `Feilet ved henting fra Airtable ${response.status}: ${response.statusText}. Response: ${errorBody}`
            );
            return [];
        }

        const res = await response.json();
        return mapToWantedAccommodations(res);
    } catch (error) {
        console.error("Feil på nettverk:", error instanceof Error ? error.message : error);
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
            const errorBody = await response.text();
            console.error(
                `Feil ved oppdatering av AirTable Airtable ${errorBody.status}. Response: ${errorBody.body}`,
            );
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export {fetchWishListFromDb, turnOffNotification};
