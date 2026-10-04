import { useRef, useState } from "react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { router, useNavigation } from "expo-router";
import { createBooking, type NewBookingInput } from "../../services";
import { getErrorMessage, getStatus } from "../../services/http";
import { toast } from "../../lib/toast";

export interface CheckoutError {
  message: string;
  /** 409: someone else holds these dates. */
  datesTaken: boolean;
}

/**
 * Creates (or reuses) a pending booking, opens Paystack in the system browser and then shows the
 * confirmation screen, which reads the real payment status from the API. The browser's result
 * (paid, closed, cancelled) is deliberately ignored: only the API knows whether payment succeeded.
 */
export const useCheckout = () => {
  const navigation = useNavigation();
  const busy = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<CheckoutError | null>(null);

  const pay = async (listingId: string, stay: Omit<NewBookingInput, "client">) => {
    if (busy.current) return;
    busy.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const booking = await createBooking(listingId, { ...stay, client: "mobile" });
      if (booking.reused) toast.info("Continuing your earlier checkout for these dates.");
      await WebBrowser.openAuthSessionAsync(booking.payment_url, Linking.createURL("bookings/confirmation"));
      // The API's redirect (shortment://bookings/confirmation?…) may already have opened the
      // confirmation screen as a deep link; only navigate if we're still the visible screen.
      if (navigation.isFocused()) {
        router.replace({ pathname: "/bookings/confirmation", params: { booking_id: booking.booking_id } });
      }
    } catch (err) {
      const datesTaken = getStatus(err) === 409;
      setError({
        datesTaken,
        message: datesTaken
          ? "Sorry, these dates were just booked by someone else. Please choose different dates."
          : getErrorMessage(err, "We couldn't start your booking. Please try again."),
      });
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  };

  return { pay, submitting, error, clearError: () => setError(null) };
};
