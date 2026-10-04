import type { ListingSummary } from "./listing";

export type GuestStatus = "awaiting" | "checked_in" | "checked_out" | "cancelled";
export type PaymentStatus = "pending" | "confirmed" | "declined";

/** A booking as returned by GET /bookings/view_bookings. */
export interface Booking {
  booking_id: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  amount: number;
  currency: string;
  guest_status: GuestStatus;
  payment_status: PaymentStatus;
  listing: ListingSummary;
  can_review: boolean;
}
