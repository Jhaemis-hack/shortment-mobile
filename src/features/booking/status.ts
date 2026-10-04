import type { Tone } from "../../ui/StatusBadge";
import type { GuestStatus, PaymentStatus } from "../../types/booking";

export const guestStatus: Record<GuestStatus, { label: string; tone: Tone }> = {
  awaiting: { label: "Upcoming", tone: "brand" },
  checked_in: { label: "Checked in", tone: "success" },
  checked_out: { label: "Completed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export const paymentStatus: Record<PaymentStatus, { label: string; tone: Tone }> = {
  pending: { label: "Payment pending", tone: "warning" },
  confirmed: { label: "Paid", tone: "success" },
  declined: { label: "Payment declined", tone: "danger" },
};
