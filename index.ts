import {isEqual, parseISO} from "date-fns";
import {createDateRange, getFromDate} from "./dateHelper.ts";
import {fetchWishListFromDb, turnOffNotification} from "./db/db.ts";
import {fetchUnitsAvailability} from "./http/dnt.ts";
import {createMessage} from "./message/builder.ts";
import postMessageToSlack from "./message/slack.ts";
import type {AvailabilityResponseWrapper, AvailabilityWrapper, UnitWish,} from "./types.ts";

const checkAvailabilityApi = async (wishlists: UnitWish[]) => {
	return await Promise.all(
		wishlists.map((withListItem) => fetchUnitsAvailability(withListItem)),
	);
};

function findAvailableDates(
	availabilityWrapper: AvailabilityResponseWrapper,
): AvailabilityWrapper {
	const dateRange = createDateRange(
		getFromDate(availabilityWrapper.unitWish.from),
		new Date(availabilityWrapper.unitWish.to),
	);
	const availableDates = dateRange.filter((date) => {
		let availableBedsOnDate = 0;
		availabilityWrapper.responses.map((response) => {
			const allResponses = response.urlData.flatMap((d) => d.data.items);

			const itemOnDate = allResponses.find((item) => {
				if (isEqual(parseISO(item.date), date)) {
					return item;
				}
			});
			if (itemOnDate?.webProducts[0].availability.available) {
				availableBedsOnDate +=
					itemOnDate?.webProducts[0].availability.steps[0].availableUnits;
			}
		});
		if (
			availableBedsOnDate >=
				availabilityWrapper.unitWish.wanted_number_of_units &&
			availabilityWrapper.unitWish.allow_partial_match
		) {
			return availableBedsOnDate;
		}
	});
	return {
		availabilityDates: availableDates,
		unitWish: availabilityWrapper.unitWish,
	};
}

function isAvailableOnAllDates(aw: AvailabilityWrapper): boolean {
	const totalDaysInRange = createDateRange(
		getFromDate(aw.unitWish.from),
		new Date(aw.unitWish.to),
	).length;
	return totalDaysInRange === aw.availabilityDates.length;
}

const unitWishlists: UnitWish[] = await fetchWishListFromDb();
const dntResponses = await checkAvailabilityApi(unitWishlists);
const availabilityMatches: AvailabilityWrapper[] = dntResponses.map(
	(response) => findAvailableDates(response),
);

const availableMatches: AvailabilityWrapper[] = availabilityMatches.filter(
	(wrapper) =>
		(wrapper.unitWish.allow_partial_match &&
			wrapper.availabilityDates.length > 0) ||
		isAvailableOnAllDates(wrapper),
);

availableMatches.map(async (match) => {
	await postMessageToSlack(createMessage(match));
	await turnOffNotification(match);
});
