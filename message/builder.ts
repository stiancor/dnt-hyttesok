import {getNorwegianDateStr, toNorwegianDateWithDayStr} from "../dateHelper.ts";
import type {AvailabilityWrapper} from "../types.ts";

function createPartialMatchMessage(aw: AvailabilityWrapper): string {
	const fromDate = getNorwegianDateStr(aw.unitWish.from);
	const toDate = getNorwegianDateStr(aw.unitWish.to);
	return `<!channel> ${aw.unitWish.cabin_group_name} ledige dager i den ønskede perioden fra ${fromDate} til ${toDate}. Ledige datoer\n${aw.availabilityDates.map((d) => toNorwegianDateWithDayStr(d)).join("\n")}`;
}

function createFullMatchMessage(aw: AvailabilityWrapper): string {
	const fromDate = getNorwegianDateStr(aw.unitWish.from);
	const toDate = getNorwegianDateStr(aw.unitWish.to);
	return `<!channel> ${aw.unitWish.cabin_group_name} har blitt ledig i hele den ønskede perioden fra ${fromDate} til ${toDate}.`;
}

export function createMessage(aw: AvailabilityWrapper): string {
	return aw.unitWish.allow_partial_match
		? createPartialMatchMessage(aw)
		: createFullMatchMessage(aw);
}
