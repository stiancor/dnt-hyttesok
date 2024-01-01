import { format } from "date-fns";
import {fetchListOfWantedBookings, turnOffNotification} from "./db";
import postMessageToSlack from "./slack"
import type { Accommodation, AccommodationWrapper } from './dnt_types.ts';
import type { WantedBooking } from "./db_types.ts";

const accommodationsToCheck = await fetchListOfWantedBookings();

const fetchDntCabinStatus = async (wantedAcc: WantedBooking): Promise<AccommodationWrapper | undefined> => {
  try {
    const response = await fetch(`https://visbook.dnt.no/api/${wantedAcc.id}/webproducts/${format(wantedAcc.from, 'yyyy-MM-dd')}/${format(wantedAcc.to, 'yyyy-MM-dd')}`)
    const json = await response.json()
    return { ...json, externalId: wantedAcc.airtableId }
  } catch (error) {
    console.log(error);
  }
}

const fetchDntResponses = async (wantedBookings: WantedBooking[]): Promise<Accommodation[]> => {
  const res = await Promise.all(wantedBookings.map(wantedBooking => fetchDntCabinStatus(wantedBooking)));
  return res.flatMap(accWrapper => {
    if (accWrapper && accWrapper.accommodations[0]) {
      const accommodation = accWrapper.accommodations[0];
      return [{ ...accommodation, externalDbId: accWrapper.externalId }];
    } else {
      return [];
    }
  });
}

const dntResponses = await fetchDntResponses(accommodationsToCheck);

const getAvailableCabins = (dntResponses: Accommodation[]): Accommodation[] => {
  return dntResponses.filter((accommodation: Accommodation) => accommodation.availability.available);
}

function createMessage(cabin: Accommodation): string {
  let period = `fra ${cabin.availability.steps[0].from.substring(0, 10)} til ${cabin.availability.steps[0].to.substring(0, 10)}`
  return `<!channel> ${cabin.unitName} har blitt ledig ${period}. Totalpris ${cabin.prices[0].calculatedPrice} kr.`
}

getAvailableCabins(dntResponses).map(cabin => {
  postMessageToSlack(createMessage(cabin))
  turnOffNotification(cabin)
})