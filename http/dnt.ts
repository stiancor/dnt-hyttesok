import {getFromDate, getNorwegianDateStr, toNorwegianDateStr} from "../dateHelper.ts";
import type {AvailabilityResponseWrapper, UnitFetchResult, UnitUrls, UnitWish} from "../types.ts";
import {generateUrls} from "../urlBuilder.ts";

async function fetchDataForUnits(
	unitsData: UnitUrls[],
): Promise<UnitFetchResult[]> {
	return Promise.all(
		unitsData.map(async (unitData) => {
			const resp = await Promise.all(
				unitData.urls.flatMap(async (url) => {
					try {
						console.log(`Laster data for: ${url}`);
						const response = await fetch(url);
						const data = await response.json();
						return { url, data };
					} catch (error) {
						console.error(`Error fetching ${url}:`, error);
						return { url, data: null };
					}
				}),
			);
			const unitAvailability: UnitFetchResult = {
				unit: unitData.unitId,
				urlData: resp,
			};
			return unitAvailability;
		}),
	);
}

export const fetchUnitsAvailability = async (
	unitWish: UnitWish,
): Promise<AvailabilityResponseWrapper> => {
	const wrapper: AvailabilityResponseWrapper = {
		unitWish: unitWish,
		responses: [],
	};
	try {
		const unitUrls: UnitUrls[] = generateUrls(unitWish);
		console.log(
			`Sjekker tilgjengelighet for ${unitWish.cabin_group_name} ${unitWish.name !== undefined ? unitWish.name : ""}` +
				`for enhet id ${unitWish.unit_id_from} til ${unitWish.unit_id_to} i perioden ${toNorwegianDateStr(getFromDate(unitWish.from))} ` +
				`til ${unitWish.to === undefined ? toNorwegianDateStr(getFromDate(unitWish.from)) : getNorwegianDateStr(unitWish.to)}`,
		);
		return { ...wrapper, responses: await fetchDataForUnits(unitUrls) };
	} catch (error) {
		console.log(error);
		return wrapper;
	}
};
