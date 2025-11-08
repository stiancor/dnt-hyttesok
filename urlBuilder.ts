import { format } from "date-fns";
import { getFromDate } from "./dateHelper.ts";
import type { UnitUrls, UnitWish } from "./types.ts";

function createRange(start: number, end: number): number[] {
	return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function generateUrl(
	cabinId: number,
	fromDate: string,
	toDate: string,
): string {
	const formattedFromDate = format(getFromDate(fromDate), "yyyy-MM-dd");
	const formattedToDate = format(new Date(toDate), "yyyy-MM-dd");
	return `https://hyttebestilling.dnt.no/api/booking/availability-calendar?cabinId=${cabinId}&fromDate=${formattedFromDate}&toDate=${formattedToDate}`;
}

export function generateUrls(wantedBooking: UnitWish): UnitUrls[] {
	const unitRange =
		wantedBooking.unit_id_from !== undefined
			? createRange(
					wantedBooking.unit_id_from,
					wantedBooking.unit_id_to
						? wantedBooking.unit_id_to
						: wantedBooking.unit_id_from,
				)
			: [];

	return [
		{
			unitId: wantedBooking.unit_id_from || 0,
			name: wantedBooking.name,
			urls: [
				generateUrl(
					wantedBooking.cabin_group_id,
					wantedBooking.from,
					wantedBooking.to,
				),
			],
			unitRange: unitRange,
		},
	];
}
