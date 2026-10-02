export type ConsentChannel = "email" | "sms" | "copy";

export type ConsentStatus =
  "pending" | "verified" | "approved" | "declined" | "expired";

export interface ConsentRecord {
  id?: string;
  consentId?: string;
  reference: string;
  secureToken?: string;
  secureLink?: string;
  code?: string;
  maskedDestination?: string;
  expiresAt?: string;
  copyMessage?: string;
  emailSent?: boolean;
  emailError?: string;
  status: ConsentStatus;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  itemName: string;
  agreedValue: number;
  currency: string;
  paymentMethod: string;
  shopName?: string;
  channel: ConsentChannel;
  verifiedAt?: string;
  approvedAt?: string;
  termsVersion?: string;
  deviceMetadata?: string;
  idImageDeleteAfter?: string;
  allowsCapture?: boolean;
}

export interface RequestConsentPayload {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  itemName: string;
  agreedValue: number;
  currency?: string;
  paymentMethod: string;
  channel?: ConsentChannel;
  sendEmailNow?: boolean;
  customerId?: string;
}

export interface VerifyConsentPayload {
  code: string;
  secureToken?: string;
}

export interface ApproveConsentPayload {
  confirmAge18: boolean;
  confirmOwnership: boolean;
  confirmTermsAgreed: boolean;
  deviceMetadata?: string;
}
