import {eachMonthOfInterval, format, parse} from "date-fns";
import {getFromDate} from "./dateHelper.ts";
import type {UnitUrls, UnitWish, UrlMetaData} from "./types.ts";

const generateYearMonthArray = (fromDate: string, toDate: string): string[] => {
	const start = getFromDate(fromDate);
	const end = parse(toDate, "yyyy-MM-dd", new Date());

	return eachMonthOfInterval({ start, end }).map((date) =>
		format(date, "yyyy-MM"),
	);
};

function createRange(start: number, end: number): number[] {
	return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function generateUrl(m: UrlMetaData): string {
	return `https://visbook.${
		m.domain
	}.no/api/${m.cabinId}/availability/${m.unitId}/${m.month}`;
}

export function generateUrls(wantedBooking: UnitWish): UnitUrls[] {
	const unitRange = createRange(
		wantedBooking.unit_id_from,
		wantedBooking.unit_id_to
			? wantedBooking.unit_id_to
			: wantedBooking.unit_id_from,
	);
	const months = generateYearMonthArray(wantedBooking.from, wantedBooking.to);
	return unitRange.map((unitId) => {
		return {
			unitId: unitId,
			name: wantedBooking.name,
			urls: months.map((month) => {
				return generateUrl({
					domain: wantedBooking.domain,
					cabinId: wantedBooking.cabin_group_id,
					unitId: unitId,
					month: month,
				});
			}),
		};
	});
}
