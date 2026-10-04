import * as yup from "yup";

// Mirrors the backend rules so users see the same errors before submitting.
const email = yup.string().trim().email("Enter a valid email address").required("Email is required");

const newPassword = yup
  .string()
  .min(8, "Use at least 8 characters")
  .matches(/\d/, "Include at least one number")
  .matches(/[!@#$%^&*]/, "Include at least one of ! @ # $ % ^ & *")
  .required("Password is required");

/** 10 digits with an optional +country code, or 11 digits starting with 0. */
const phoneNumber = yup
  .string()
  .trim()
  .matches(/^(\+\d{1,3}\d{10}|\d{10}|0\d{10})$/, "Enter a valid phone number, e.g. 08012345678")
  .required("Phone number is required");

export const loginSchema = yup.object({
  email,
  password: yup.string().required("Password is required"),
});

export const signupSchema = yup.object({
  first_name: yup.string().trim().max(50, "Keep it under 50 characters").defined(),
  last_name: yup.string().trim().max(50, "Keep it under 50 characters").defined(),
  email,
  phone_number: phoneNumber,
  password: newPassword,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords don't match")
    .required("Confirm your password"),
});

export const forgotPasswordSchema = yup.object({ email });

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** Validates `values` against `schema`, returning the first error message per field (empty when valid). */
export async function validateForm<T extends object>(schema: yup.ObjectSchema<T>, values: T): Promise<FieldErrors<T>> {
  try {
    await schema.validate(values, { abortEarly: false });
    return {};
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) throw error;
    const errors: Record<string, string> = {};
    for (const issue of error.inner) {
      if (issue.path && !errors[issue.path]) errors[issue.path] = issue.message;
    }
    return errors as FieldErrors<T>;
  }
}

export const resetPasswordSchema = yup.object({
  password: newPassword,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords don't match")
    .required("Confirm your password"),
});

export const changePasswordSchema = yup.object({
  old_password: yup.string().defined(),
  new_password: newPassword,
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords don't match")
    .required("Confirm your new password"),
});

export const profileSchema = yup.object({
  first_name: yup.string().trim().required("First name is required").max(50, "Keep it under 50 characters"),
  last_name: yup.string().trim().required("Last name is required").max(50, "Keep it under 50 characters"),
  phone_number: phoneNumber,
  address: yup.string().trim().max(200, "Keep it under 200 characters").defined(),
  gender: yup.string().oneOf(["", "male", "female"]).defined(),
});
