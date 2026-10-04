/** Only in-app paths are allowed as post-login destinations. */
export const safeNext = (value: string | string[] | null | undefined, fallback = "/"): string => {
  const next = Array.isArray(value) ? value[0] : value;
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
};

/** Route params for the login screen, returning to `next` after sign-in. */
export const loginHref = (next: string) => ({ pathname: "/login" as const, params: { next } });

/** URL of an apartment's detail screen. */
export const listingPath = (id: string) => `/apartments/${id}` as const;
