export interface Option {
  value: string;
  label: string;
}

/** Values match the backend `ltn` filter (state or city, partial match). */
export const searchLocations: Option[] = [
  { value: "lagos", label: "Lagos" },
  { value: "fct", label: "Abuja (FCT)" },
  { value: "rivers", label: "Port Harcourt" },
  { value: "oyo", label: "Ibadan" },
  { value: "enugu", label: "Enugu" },
  { value: "kano", label: "Kano" },
  { value: "cross river", label: "Calabar" },
  { value: "akwa ibom", label: "Uyo" },
];

/** Values match the backend `a_type` filter. */
export const apartmentTypes: Option[] = [
  "studio apartment",
  "mini flat",
  "1-bedroom apartment",
  "2-bedroom apartment",
  "3-bedroom apartment",
  "penthouse",
  "terrace duplex",
  "royal suite",
].map(value => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }));

export const bedroomOptions: Option[] = [1, 2, 3, 4].map(n => ({
  value: String(n),
  label: `${n} bedroom${n === 1 ? "" : "s"}`,
}));
