/** YYYY-MM-DD helpers in local time (the API's date-only format). */

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export const isIsoDate = (value: unknown): value is string => typeof value === "string" && isoDate.test(value);

export const toIso = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const fromIso = (value: string): Date => {
  const [year = 1970, month = 1, day = 1] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (value: string, days: number): string => {
  const date = fromIso(value);
  date.setDate(date.getDate() + days);
  return toIso(date);
};
