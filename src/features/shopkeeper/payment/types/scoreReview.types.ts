export interface ScoreReview {
  status: "none" | "recorded";
  source?: string;
  linkedBy?: string;
  reviewUrl?: string;
  recordedAt?: string | null;
  requestSentAt?: string | null;
  requestCount?: number;
  lastRecipientEmail?: string;
}

export interface SendReviewRequestPayload {
  email?: string;
  customerName?: string;
  googleReviewUrl?: string;
}

export interface UpdateReviewStatusPayload {
  status: "none" | "recorded";
  reviewUrl?: string;
  source?: string;
  linkedBy?: string;
}

export interface AttachCustomerPayload {
  customerId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}
