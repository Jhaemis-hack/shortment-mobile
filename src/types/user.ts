/** The signed-in user's profile as returned by /user/login and /user/me. */
export interface Profile {
  id: string;
  unique_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  country_code: string | null;
  phone_number: string | null;
  address: string | null;
  gender: "male" | "female" | null;
  profile_image: string | null;
  role: string;
  is_verified: boolean;
  has_password: boolean;
}
