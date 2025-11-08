import { format, parse, startOfDay } from "date-fns";
import { nb } from "date-fns/locale";

function getDate(dateStr: string): Date {
	return startOfDay(parse(dateStr, "yyyy-MM-dd", new Date()));
}

export function getFromDate(fromDateStr: string) {
	const start = getDate(fromDateStr);
	const today = startOfDay(new Date());
	return today > start ? today : start;
}

export function createDateRange(startDate: Date, endDate: Date): Date[] {
	const dateRange: Date[] = [];
	const currentDate = startOfDay(new Date(startDate));

	while (currentDate <= endDate) {
		dateRange.push(startOfDay(new Date(currentDate)));
		currentDate.setDate(currentDate.getDate() + 1);
	}
	return dateRange;
}

export function toNorwegianDateStr(d: Date): string {
	return format(d, "dd.MM.yyyy");
}

export function toNorwegianDateWithDayStr(d: Date): string {
	const str = format(d, "eeee dd.MM.yyyy", { locale: nb });
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getNorwegianDateStr(s: string): string {
	return toNorwegianDateStr(getDate(s));
}
