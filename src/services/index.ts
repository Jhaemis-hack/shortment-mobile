import * as yup from "yup";
import { Axios, unwrap } from "../config";
import { Request } from "../lib/request";
import type { Booking } from "../types/booking";
import type { ListingDetail, ListingSummary } from "../types/listing";
import type { Profile } from "../types/user";
import {
  bookingSchema,
  listingDetailSchema,
  listingSummarySchema,
  newBookingSchema,
  parsePage,
  profileSchema,
  savedListingSchema,
  sessionSchema,
  type Page,
  type SavedListing,
} from "./schemas";

export type { Page, SavedListing };

/* ---------- auth ---------- */

export interface SignUpInput {
  email: string;
  phone_number: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export const signUp = async (input: SignUpInput): Promise<void> => {
  await Axios.post(Request.signup, input);
};

export interface Session {
  user: Profile;
  token: string;
}

const toSession = async (data: unknown): Promise<Session> => {
  const { token, ...user } = await sessionSchema.validate(data, { stripUnknown: true });
  return { user, token };
};

export const logIn = async (email: string, password: string): Promise<Session> =>
  toSession(unwrap(await Axios.post(Request.login, { email, password })));

export const exchangeGoogleCode = async (code: string): Promise<Session> =>
  toSession(unwrap(await Axios.post(Request.googleExchange, { code })));

export const getMe = async (): Promise<Profile> =>
  profileSchema.validate(unwrap(await Axios.get(Request.me)), { stripUnknown: true });

export const verifyEmail = async (id: string, token: string): Promise<void> => {
  await Axios.get(Request.verifyEmail(id), { params: { verify_token: token } });
};

export const resendVerification = async (email: string): Promise<void> => {
  await Axios.post(Request.resendVerification, { email });
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await Axios.post(Request.forgotPassword, { email });
};

export const resetPassword = async (id: string, token: string, new_password: string): Promise<void> => {
  await Axios.post(Request.resetPassword, { id, token, new_password });
};

export const changePassword = async (old_password: string, new_password: string): Promise<void> => {
  await Axios.patch(Request.changePassword, { old_password, new_password });
};

export interface ProfileUpdate {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  gender?: "male" | "female";
}

/** Saves profile fields, then re-reads /me so the caller gets the canonical profile. */
export const updateProfile = async (update: ProfileUpdate): Promise<Profile> => {
  await Axios.patch(Request.editProfile, update);
  return getMe();
};

/** A local image picked on the device (e.g. from expo-image-picker). */
export interface LocalImage {
  uri: string;
  name: string;
  type: string;
}

export const uploadProfileImage = async (image: LocalImage): Promise<Profile> => {
  const form = new FormData();
  // React Native's FormData accepts { uri, name, type } for file parts.
  form.append("file", image as unknown as Blob);
  await Axios.post(Request.updateProfileImage, form, { headers: { "Content-Type": "multipart/form-data" } });
  return getMe();
};

/* ---------- listings ---------- */

export interface ListingFilters {
  ltn?: string;
  a_type?: string;
  b_num?: string;
  page?: number;
  page_size?: number;
}

export const getListings = async (filters: ListingFilters): Promise<Page<ListingSummary>> => {
  const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined));
  return parsePage(unwrap(await Axios.get(Request.listings, { params })), "property_lists", listingSummarySchema);
};

export const getListing = async (id: string): Promise<ListingDetail> =>
  listingDetailSchema.validate(unwrap(await Axios.get(Request.listing(id))), { stripUnknown: true });

/* ---------- bookings ---------- */

export interface NewBookingInput {
  check_in: string;
  check_out: string;
  guests: number;
  /** "mobile" makes the Paystack callback return to the app (shortment://) instead of the website. */
  client?: "mobile";
}

export type NewBooking = yup.InferType<typeof newBookingSchema>;

export const createBooking = async (listingId: string, input: NewBookingInput): Promise<NewBooking> =>
  newBookingSchema.validate(unwrap(await Axios.post(Request.newBooking(listingId), input)), { stripUnknown: true });

export const getBookings = async (page = 1, page_size = 10): Promise<Page<Booking>> =>
  parsePage(unwrap(await Axios.get(Request.bookings, { params: { page, page_size } })), "booked_lists", bookingSchema);

export const getBooking = async (bookingId: string): Promise<Booking> =>
  bookingSchema.validate(unwrap(await Axios.get(Request.booking(bookingId))), { stripUnknown: true });

/* ---------- saved (favorites) ---------- */

export const getSaved = async (page = 1, page_size = 50): Promise<Page<SavedListing>> =>
  parsePage(unwrap(await Axios.get(Request.favorites, { params: { page, page_size } })), "favorites_list", savedListingSchema);

export const saveListing = async (listingId: string): Promise<void> => {
  await Axios.post(Request.addFavorite(listingId));
};

export const unsaveListing = async (listingId: string): Promise<void> => {
  await Axios.delete(Request.removeFavorite(listingId));
};

/* ---------- reviews ---------- */

export const rateListing = async (listingId: string, rating: number): Promise<void> => {
  await Axios.post(Request.rate(listingId), null, { params: { rtn: rating } });
};

export const reviewListing = async (listingId: string, review: string, rating: number): Promise<void> => {
  await Axios.post(Request.review(listingId), { review, rating });
};
