import { format, parseISO } from "date-fns";
import { createDateRange, getFromDate } from "./dateHelper.ts";
import { fetchWishListFromDb, turnOffNotification } from "./db/db.ts";
import { fetchUnitsAvailability } from "./http/dnt.ts";
import { createMessage } from "./message/builder.ts";
import postMessageToSlack from "./message/slack.ts";
import type {
	AvailabilityResponseWrapper,
	AvailabilityWrapper,
	UnitWish,
} from "./types.ts";

const checkAvailabilityApi = async (wishlists: UnitWish[]) => {
	return await Promise.all(
		wishlists.map((withListItem) => fetchUnitsAvailability(withListItem)),
	);
};

function findAvailableDates(
	availabilityWrapper: AvailabilityResponseWrapper,
): AvailabilityWrapper {
	console.log(
		`\nAnalyzing ${availabilityWrapper.unitWish.cabin_group_name}...`,
	);

	const dateRange = createDateRange(
		getFromDate(availabilityWrapper.unitWish.from),
		new Date(availabilityWrapper.unitWish.to),
	);

	const availableDates = dateRange.filter((date) => {
		let availableBedsOnDate = 0;
		// Format the date as YYYY-MM-DD for comparison with API dates
		const dateStr = format(date, "yyyy-MM-dd");

		for (const response of availabilityWrapper.responses) {
			// Get the availability list from the new API format
			const availabilityList = response.urlData.flatMap(
				(d) => d.data?.data?.availabilityList || [],
			);

			if (availabilityList.length === 0) {
				console.log("No availability data received from API");
			}

			// Find the entry for this specific date
			// Compare by date string (YYYY-MM-DD) to avoid timezone issues
			const itemOnDate = availabilityList.find((item) => {
				const apiDateStr = format(parseISO(item.date), "yyyy-MM-dd");
				return apiDateStr === dateStr;
			});

			if (itemOnDate) {
				// Sum up available units for all products that match our unit range
				for (const product of itemOnDate.products) {
					// If unitRange is empty, accept all units; otherwise check if unit_id is in range
					const acceptAllUnits = response.unitRange.length === 0;
					const unitMatches =
						acceptAllUnits ||
						response.unitRange.includes(product.product.unit_id);

					if (unitMatches) {
						availableBedsOnDate += product.available;
					}
				}
			}
		}

		// Return true if we have enough available units
		return (
			availableBedsOnDate >= availabilityWrapper.unitWish.wanted_number_of_units
		);
	});

	if (availableDates.length > 0) {
		console.log(`Found ${availableDates.length} available dates`);
	} else {
		console.log("No availability found");
	}

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
console.log(`\nChecking ${unitWishlists.length} cabin(s)...`);

const dntResponses = await checkAvailabilityApi(unitWishlists);

const availabilityMatches: AvailabilityWrapper[] = dntResponses.map(
	(response) => findAvailableDates(response),
);

const availableMatches: AvailabilityWrapper[] = availabilityMatches.filter(
	(wrapper) => {
		const partialMatch =
			wrapper.unitWish.allow_partial_match &&
			wrapper.availabilityDates.length > 0;
		const fullMatch = isAvailableOnAllDates(wrapper);
		return partialMatch || fullMatch;
	},
);

if (availableMatches.length > 0) {
	console.log(`Sending ${availableMatches.length} notification(s) to Slack...`);

	// Use Promise.all to wait for all async operations to complete
	await Promise.all(
		availableMatches.map(async (match) => {
			const message = createMessage(match);
			const success = await postMessageToSlack(message);
			if (success) {
				console.log(`Notification sent for ${match.unitWish.cabin_group_name}`);
				await turnOffNotification(match);
			} else {
				console.log(
					`Failed to send notification for ${match.unitWish.cabin_group_name}`,
				);
			}
		}),
	);
} else {
	console.log("No cabins with availability found.");
}

console.log("✅ Done!");
