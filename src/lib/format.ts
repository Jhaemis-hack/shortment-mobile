const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** Formats a naira amount, e.g. 100000 → "₦100,000". */
export const formatNaira = (amount: number): string => nairaFormatter.format(amount);

export const pluralize = (count: number, singular: string, plural = `${singular}s`): string =>
  `${count} ${count === 1 ? singular : plural}`;

const dateFormatter = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric" });
const monthYearFormatter = new Intl.DateTimeFormat("en-NG", { month: "long", year: "numeric" });

/** "2024-08-12" or an ISO timestamp → "12 Aug 2024". */
export const formatDate = (value: string): string => dateFormatter.format(new Date(value));

/** ISO timestamp → "August 2024". */
export const formatMonthYear = (value: string): string => monthYearFormatter.format(new Date(value));

/** "14:00" → "2:00 PM". */
export const formatTime = (value: string): string => {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

/** Today's date as YYYY-MM-DD in local time, for date input `min` values. */
export const todayIso = (): string => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
};

/** Whole nights between two YYYY-MM-DD dates (0 if invalid or not after). */
export const nightsBetween = (checkIn: string, checkOut: string): number => {
  const ms = Date.parse(checkOut) - Date.parse(checkIn);
  return Number.isFinite(ms) && ms > 0 ? Math.round(ms / 86_400_000) : 0;
};

const upperWords = new Set(["fct", "gra", "vi"]);

/** "victoria island" → "Victoria Island"; keeps abbreviations like FCT upper-case. */
export const titleCase = (value: string): string =>
  value.replace(/[\p{L}\d']+/gu, word =>
    upperWords.has(word.toLowerCase()) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1),
  );

/** Capitalises the first letter of each sentence: "great stay. loved it" → "Great stay. Loved it". */
export const sentenceCase = (value: string): string =>
  value.replace(/(^\s*|[.!?]\s+)(\p{Ll})/gu, (_, lead: string, letter: string) => lead + letter.toUpperCase());
