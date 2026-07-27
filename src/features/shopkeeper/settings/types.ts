import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  shopName: z.string().min(2, "Shop name is required"),
  shopAddress: z.string().min(5, "Shop address is required"),
  whatsappNumber: z.string().min(10, "Invalid WhatsApp number"),
  googleReviewPageUrl: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^https?:\/\/\S+$/i.test(value), {
      message: "Please enter a valid URL",
    }),
  image: z.any().optional(),
});

export type ProfileValues = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type PasswordValues = z.infer<typeof passwordSchema>;

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  shopName?: string;
  shopAddress?: string;
  whatsappNumber?: string;
  googleReviewPageUrl?: string;
  currency?: string;
  image?: {
    url: string;
    public_id: string;
  };
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: UserProfile;
}

export interface RepairProblemDescription {
  _id: string;
  deviceModel: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface RepairProblemDescriptionsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: RepairProblemDescription[];
}
