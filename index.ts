import { fetchListOfWantedBookings, turnOffNotification } from "./db";
import type { WantedBooking } from "./db_types.ts";
import type { Accommodation, AccommodationWrapper } from "./dnt_types.ts";
import postMessageToSlack from "./slack";

const accommodationsToCheck = await fetchListOfWantedBookings();

const fetchDntCabinStatus = async (
	wantedBooking: WantedBooking,
): Promise<AccommodationWrapper | undefined> => {
	try {
		const url = `https://visbook.${
			wantedBooking.domain ? wantedBooking.domain : "dnt"
		}.no/api/${wantedBooking.id}/webproducts/${wantedBooking.from}/${
			wantedBooking.to
		}`;
		console.log(`Sjekker tilgjengelighet for ${wantedBooking.cabin}: ${url}`);
		const response = await fetch(url);
		const json = await response.json();
		return {
			...json,
			externalId: wantedBooking.airtableId,
			row: wantedBooking.row
		};
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
	return res.flatMap((accommodationWrapper) => {
		if (accommodationWrapper?.accommodations[accommodationWrapper.row]) {
			const accommodation =
				accommodationWrapper.accommodations[accommodationWrapper.row];
			return [
				{
					...accommodation,
					externalDbId: accommodationWrapper.externalId,
				},
			];
		}
		return [];
	});
};

const dntResponses = await fetchDntResponses(accommodationsToCheck);

const getAvailableCabins = (dntResponses: Accommodation[]): Accommodation[] => {
	return dntResponses.filter(
		(accommodation: Accommodation) => accommodation.availability.available,
	);
};

function norwegianDateFormat(dateStr: string): string {
	const year = dateStr.slice(0, 4);
	const month = dateStr.slice(5, 7);
	const day = dateStr.slice(8, 10);
	return `${day}.${month}.${year}`;
}

function createMessage(cabin: Accommodation): string {
	const fromDate = norwegianDateFormat(cabin.availability.steps[0].from);
	const toDate = norwegianDateFormat(
		cabin.availability.steps[cabin.availability.steps.length - 1].to,
	);
	const additionalServices =
		cabin?.additionalServices?.length > 0
			? `Ekstratjenester: ${cabin.additionalServices
					.map(
						(obj) =>
							`${obj.name} ${obj.price} kr ${
								obj.serviceType === "perDay" ? "per dag" : ""
							}`,
					)
					.join(", ")}`
			: "";
	return `<!channel> ${cabin.unitName} har blitt ledig fra ${fromDate} til ${toDate}. Pris ${cabin.prices[1].calculatedPrice} kr. ${additionalServices}`;
}

getAvailableCabins(dntResponses).map((cabin) => {
	postMessageToSlack(createMessage(cabin));
	turnOffNotification(cabin);
});
