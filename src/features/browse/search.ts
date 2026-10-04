/** Explore filters; keys and values match the backend listing filters and the Explore route params. */
export interface SearchValues {
  ltn: string;
  a_type: string;
  b_num: string;
}

export const emptySearch: SearchValues = { ltn: "", a_type: "", b_num: "" };

type Param = string | string[] | undefined;

const first = (value: Param): string => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

/** Reads filters from route params (`useLocalSearchParams`). */
export const searchFromParams = (params: { ltn?: Param; a_type?: Param; b_num?: Param }): SearchValues => ({
  ltn: first(params.ltn),
  a_type: first(params.a_type),
  b_num: first(params.b_num),
});
