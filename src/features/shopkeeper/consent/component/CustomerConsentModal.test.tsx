import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomerConsentModal } from "./CustomerConsentModal";

// Mock consentApi to avoid real network requests
jest.mock("../api/consent.api", () => ({
  consentApi: {
    requestConsent: jest.fn(),
    verifyCustomerCode: jest.fn(),
    approveDirectConsent: jest.fn(),
    checkConsentStatus: jest.fn(),
  },
}));

describe("CustomerConsentModal", () => {
  const initialData = {
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+1234567890",
    itemName: "iPhone 13 Pro",
    agreedValue: 500,
    currency: "USD",
    paymentMethod: "cash",
  };

  it("renders exactly one close button and calls onClose when clicked", () => {
    const handleClose = jest.fn();
    const handleApproved = jest.fn();

    render(
      <CustomerConsentModal
        isOpen={true}
        onClose={handleClose}
        onApproved={handleApproved}
        initialData={initialData}
      />,
    );

    // Look for all close buttons
    const closeButtons = screen.getAllByRole("button", { name: /close/i });
    expect(closeButtons).toHaveLength(1);

    fireEvent.click(closeButtons[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
