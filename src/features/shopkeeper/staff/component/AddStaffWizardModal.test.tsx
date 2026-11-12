import React from "react";
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
(global as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder =
  TextDecoder;

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AddStaffWizardModal } from "./AddStaffWizardModal";

jest.mock("./StaffAppointmentLetter", () => ({
  generateStaffAppointmentLetter: jest.fn(),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || "mocked image"} />;
  },
}));

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("AddStaffWizardModal Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderModal = (isOpen = true) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AddStaffWizardModal
          isOpen={isOpen}
          onClose={jest.fn()}
          shopkeeperId="mock-shopkeeper-id"
          shops={[
            { _id: "shop-1", shopName: "Romford Store", isDefault: true },
            { _id: "shop-2", shopName: "Ilford Store" },
          ]}
        />
      </QueryClientProvider>,
    );
  };

  it("renders Step 1 (Staff Details) with personal fields, staff ID and address auto finder", () => {
    renderModal();

    expect(screen.getByText("Add Staff Member")).toBeInTheDocument();
    expect(screen.getByText("Staff Details")).toBeInTheDocument();
    expect(screen.getByText("Personal Details")).toBeInTheDocument();
    expect(screen.getByText("Create Staff ID Manually")).toBeInTheDocument();
    expect(screen.getByText("Suggest Staff ID (Auto)")).toBeInTheDocument();
    expect(screen.getByText("Address (Auto Finder)")).toBeInTheDocument();
    expect(screen.getByText("Find Address")).toBeInTheDocument();
    expect(screen.getByText("Next: Access & Schedule →")).toBeInTheDocument();
  });

  it("allows switching between manual Staff ID and auto-suggested Staff ID", () => {
    renderModal();

    const autoBtn = screen.getByText("Suggest Staff ID (Auto)");
    fireEvent.click(autoBtn);

    const manualBtn = screen.getByText("Create Staff ID Manually");
    fireEvent.click(manualBtn);

    expect(screen.getByPlaceholderText("STF-4130")).toBeInTheDocument();
  });

  it("advances to Step 2 (Access & Schedule) when valid details are provided", async () => {
    renderModal();

    const firstNameInput = screen.getByPlaceholderText("Tariq");
    const lastNameInput = screen.getByPlaceholderText("Mahmood");
    const emailInput = screen.getByPlaceholderText("tariq@example.com");

    fireEvent.change(firstNameInput, { target: { value: "Tariq" } });
    fireEvent.change(lastNameInput, { target: { value: "Mahmood" } });
    fireEvent.change(emailInput, { target: { value: "tariq@example.com" } });

    // Fill PIN inputs (4 digits)
    const pinInputs = screen.getAllByPlaceholderText("••••");
    fireEvent.change(pinInputs[0], { target: { value: "1234" } });
    fireEvent.change(pinInputs[1], { target: { value: "1234" } });

    const nextBtn = screen.getByText("Next: Access & Schedule →");
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText("Store Assignment & Role")).toBeInTheDocument();
      expect(screen.getByText("Wages & Payment Basis")).toBeInTheDocument();
      expect(
        screen.getByText("Next: Face & ID Verification →"),
      ).toBeInTheDocument();
    });
  });
});
