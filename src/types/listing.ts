/** A listing as returned by GET /bookings/view_all_lists. */
export interface ListingSummary {
  id: string;
  property_name: string;
  apartment_type: string;
  price_per_night: number;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  minimum_nights: number;
  cover_image: string;
  average_rating: number | null;
  review_count: number;
}

export interface ListingReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  guest: { first_name: string; profile_image: string | null };
}

/** A listing as returned by GET /bookings/view_all_lists/:id. */
export interface ListingDetail extends ListingSummary {
  property_description: string;
  security_fee: number;
  nearest_landmark: string | null;
  check_in_time: string;
  check_out_time: string;
  amenities: string[];
  images: string[];
  host: { first_name: string; profile_image: string | null; member_since: string };
  reviews: ListingReview[];
}
