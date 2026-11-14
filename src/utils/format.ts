import { currency, locale, timeZone } from "../constants/locale";
import type { IsoDateTime, MoneyAmount } from "../types/api";

const wonFormatter = new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
  timeZone,
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatWon(amount: MoneyAmount): string {
  return wonFormatter.format(amount);
}

export function formatDateTime(value: IsoDateTime): string {
  return dateTimeFormatter.format(new Date(value));
}
