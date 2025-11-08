import type {
	AvailabilityResponseWrapper,
	UnitFetchResult,
	UnitUrls,
	UnitWish,
} from "../types.ts";
import { generateUrls } from "../urlBuilder.ts";

async function fetchDataForUnits(
	unitsData: UnitUrls[],
): Promise<UnitFetchResult[]> {
	return Promise.all(
		unitsData.map(async (unitData) => {
			const url = unitData.urls[0];
			try {
				const response = await fetch(url);
				const data = await response.json();

				const unitAvailability: UnitFetchResult = {
					unit: unitData.unitId,
					urlData: [{ url, data }],
					unitRange: unitData.unitRange,
				};
				return unitAvailability;
			} catch (error) {
				console.error(`Error fetching ${url}:`, error);
				return {
					unit: unitData.unitId,
					urlData: [{ url, data: { data: { availabilityList: [] } } }],
					unitRange: unitData.unitRange,
				};
			}
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
		return { ...wrapper, responses: await fetchDataForUnits(unitUrls) };
	} catch (error) {
		console.log(error);
		return wrapper;
	}
};
