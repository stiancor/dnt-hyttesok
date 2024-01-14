import {format, FormatOptions} from "date-fns";
import { fetchListOfWantedBookings, turnOffNotification } from "./db";
import type { WantedBooking } from "./db_types.ts";
import type { Accommodation, AccommodationWrapper } from "./dnt_types.ts";
import postMessageToSlack from "./slack";

const accommodationsToCheck = await fetchListOfWantedBookings();

const fetchDntCabinStatus = async (
	wantedBooking: WantedBooking,
): Promise<AccommodationWrapper | undefined> => {
	try {
		const response = await fetch(
			`https://visbook.dnt.no/api/${wantedBooking.id}/webproducts/${format(
				wantedBooking.from,
				"yyyy-MM-dd",
			)}/${format(wantedBooking.to, "yyyy-MM-dd", {timezone: "Europe/Oslo"} as FormatOptions)}`,
		);
		const json = await response.json();
		return { ...json, externalId: wantedBooking.airtableId };
	} catch (error) {
		console.log(error);
	}
};

const fetchDntResponses = async (
	wantedBookings: WantedBooking[],
): Promise<Accommodation[]> => {
	const res = await Promise.all(
		wantedBookings.map((wantedBooking) => fetchDntCabinStatus(wantedBooking)),
	);
	return res.flatMap((accWrapper) => {
		if (accWrapper && accWrapper.accommodations[0]) {
			const accommodation = accWrapper.accommodations[0];
			return [{ ...accommodation, externalDbId: accWrapper.externalId }];
		} else {
			return [];
		}
	});
};

const dntResponses = await fetchDntResponses(accommodationsToCheck);

const getAvailableCabins = (dntResponses: Accommodation[]): Accommodation[] => {
	return dntResponses.filter(
		(accommodation: Accommodation) => accommodation.availability.available,
	);
};

function norwegianDateFormat(dateStr): string {
	return format(new Date(dateStr), "dd.MM.yyyy", {timezone: "Europe/Oslo"} as FormatOptions);
}

function createMessage(cabin: Accommodation): string {
	const fromDate = norwegianDateFormat(cabin.availability.steps[0].from);
	const toDate = norwegianDateFormat(
		cabin.availability.steps[cabin.availability.steps.length - 1].to,
	);
	const additionalServices =
		cabin?.additionalServices?.length > 0
			? `Ekstratjenester: ${cabin.additionalServices
					.map((obj) => `${obj.name} ${obj.price} kr ${obj.serviceType === 'perDay' ? 'per dag' : ''}`)
					.join(", ")}`
			: "";
	return `<!channel> ${cabin.unitName} har blitt ledig fra ${fromDate} til ${toDate}. Pris ${cabin.prices[1].calculatedPrice} kr. ${additionalServices}`;
}

getAvailableCabins(dntResponses).map((cabin) => {
	postMessageToSlack(createMessage(cabin));
	turnOffNotification(cabin);
});
