/** Backend endpoint paths, relative to VITE_API_URL (which ends in /api/v1/). */
export const Request = {
  // auth
  signup: "user/signup",
  login: "user/login",
  me: "user/me",
  verifyEmail: (id: string) => `user/verify_email/${encodeURIComponent(id)}`,
  resendVerification: "user/generate_token",
  forgotPassword: "user/forget_password",
  resetPassword: "user/reset_password",
  changePassword: "user/change_password",
  editProfile: "user/edit_profile",
  updateProfileImage: "user/edit_profile/update_profile_image",
  googleLogin: "user/google/login",
  googleExchange: "user/google/exchange",

  // listings
  listings: "bookings/view_all_lists",
  listing: (id: string) => `bookings/view_all_lists/${encodeURIComponent(id)}`,

  // bookings
  newBooking: (listingId: string) => `bookings/new_booking/${encodeURIComponent(listingId)}`,
  bookings: "bookings/view_bookings",
  booking: (bookingId: string) => `bookings/view_bookings/${encodeURIComponent(bookingId)}`,

  // saved (favorites) and reviews
  favorites: "utilities/view_all_favorites",
  addFavorite: (listingId: string) => `utilities/add_to_favorites/${encodeURIComponent(listingId)}`,
  removeFavorite: (listingId: string) => `utilities/delete_favorite/${encodeURIComponent(listingId)}`,
  rate: (listingId: string) => `utilities/list_rating/${encodeURIComponent(listingId)}`,
  review: (listingId: string) => `utilities/list_review/${encodeURIComponent(listingId)}`,
};
