import * as yup from "yup";
import type { ListingDetail, ListingReview, ListingSummary } from "../types/listing";
import type { Booking, GuestStatus, PaymentStatus } from "../types/booking";
import type { Profile } from "../types/user";

/*
 * Runtime validation for API responses. `unwrap()` returns `unknown`; every service
 * validates against one of these before handing data to the UI.
 */

const text = () => yup.string().defined();
const nullableText = () => yup.string().nullable().defined();
const num = () => yup.number().defined();

export const listingSummarySchema: yup.ObjectSchema<ListingSummary> = yup.object({
  id: text(),
  property_name: text(),
  apartment_type: text(),
  price_per_night: num(),
  address: text(),
  city: text(),
  state: text(),
  latitude: num(),
  longitude: num(),
  bedrooms: num(),
  bathrooms: num(),
  max_guests: num(),
  minimum_nights: num(),
  cover_image: text(),
  average_rating: yup.number().nullable().defined(),
  review_count: num(),
});

const reviewSchema: yup.ObjectSchema<ListingReview> = yup.object({
  id: text(),
  rating: num(),
  comment: nullableText(),
  created_at: text(),
  guest: yup
    .object({ first_name: text(), profile_image: nullableText() })
    .defined(),
});

export const listingDetailSchema: yup.ObjectSchema<ListingDetail> = listingSummarySchema.shape({
  property_description: text(),
  security_fee: num(),
  nearest_landmark: nullableText(),
  check_in_time: text(),
  check_out_time: text(),
  amenities: yup.array(yup.string().defined()).defined(),
  images: yup.array(yup.string().defined()).defined(),
  host: yup
    .object({ first_name: text(), profile_image: nullableText(), member_since: text() })
    .defined(),
  reviews: yup.array(reviewSchema).defined(),
});

export const savedListingSchema = listingSummarySchema.shape({ favorited_at: text() });
export type SavedListing = yup.InferType<typeof savedListingSchema>;

const guestStatuses: GuestStatus[] = ["awaiting", "checked_in", "checked_out", "cancelled"];
const paymentStatuses: PaymentStatus[] = ["pending", "confirmed", "declined"];

export const bookingSchema: yup.ObjectSchema<Booking> = yup.object({
  booking_id: text(),
  check_in: text(),
  check_out: text(),
  nights: num(),
  guests: num(),
  amount: num(),
  currency: text(),
  guest_status: yup.mixed<GuestStatus>().oneOf(guestStatuses).defined(),
  payment_status: yup.mixed<PaymentStatus>().oneOf(paymentStatuses).defined(),
  listing: listingSummarySchema.defined(),
  // Defensive default; both booking endpoints send can_review.
  can_review: yup.boolean().default(false),
});

export const newBookingSchema = yup.object({
  booking_id: text(),
  amount: num(),
  nights: num(),
  payment_url: text().url(),
  reference: text(),
  /** True when the API returned the guest's existing unpaid checkout for the same stay. */
  reused: yup.boolean().default(false),
});

export const profileSchema: yup.ObjectSchema<Profile> = yup.object({
  id: text(),
  unique_id: text(),
  first_name: nullableText(),
  last_name: nullableText(),
  email: text(),
  country_code: nullableText(),
  phone_number: nullableText(),
  address: nullableText(),
  gender: yup.mixed<"male" | "female">().oneOf(["male", "female"]).nullable().defined(),
  profile_image: nullableText(),
  role: text(),
  is_verified: yup.boolean().defined(),
  has_password: yup.boolean().defined(),
});

export const sessionSchema = profileSchema.shape({ token: text().min(1) });

export interface Page<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

const pageMetaSchema = yup.object({
  current_page: num(),
  total_pages: num(),
  total_results: num(),
});

/** Validates the backend's paginated envelope, whose list lives under `listKey`. */
export async function parsePage<T>(data: unknown, listKey: string, itemSchema: yup.Schema<T>): Promise<Page<T>> {
  const meta = await pageMetaSchema.validate(data);
  const list: unknown = typeof data === "object" && data !== null ? Reflect.get(data, listKey) : undefined;
  return {
    items: await yup.array(itemSchema).defined().validate(list, { stripUnknown: true }),
    currentPage: meta.current_page,
    totalPages: meta.total_pages,
    totalResults: meta.total_results,
  };
}
