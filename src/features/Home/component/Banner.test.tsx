import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Banner from "./Banner";
import { getServicesApi } from "@/features/shopkeeper/scanDevice/api/scanDevice.api";
import type {
  IMEIService,
  ServiceCategory,
} from "@/features/shopkeeper/scanDevice/types/scanDevice.types";

const push = jest.fn();
let sessionStatus: "authenticated" | "unauthenticated" = "unauthenticated";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({ status: sessionStatus }),
}));

jest.mock("@/features/shopkeeper/scanDevice/api/scanDevice.api", () => ({
  getServicesApi: jest.fn(),
}));

jest.mock("@/components/shared/website/ScannerModal", () => ({
  ScannerModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="scanner-modal" /> : null,
}));

jest.mock("@/components/shared/website/GuestLoginModal", () => ({
  GuestLoginModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="guest-login-modal" /> : null,
}));

const freeService: IMEIService = {
  _id: "free-service",
  serviceId: 6,
  name: "FMI Free Check",
  price: "0",
  priceLabel: "Free",
  category: "Fevourite",
  isFree: true,
  normalizedName: "fmi free check",
  currency: "USD",
};

const paidService: IMEIService = {
  _id: "paid-service",
  serviceId: 12,
  name: "Carrier Premium Check",
  price: "2",
  priceLabel: "$2.00",
  category: "Carrier",
  isFree: false,
  normalizedName: "carrier premium check",
  currency: "USD",
};

const categories: ServiceCategory[] = [
  { category: "Fevourite", services: [freeService] },
  { category: "Carrier", services: [paidService] },
];

const mockedGetServices = jest.mocked(getServicesApi);

describe("Banner verification flow", () => {
  beforeEach(() => {
    push.mockReset();
    sessionStatus = "unauthenticated";
    mockedGetServices.mockResolvedValue({
      success: true,
      message: "Services loaded",
      statusCode: 200,
      data: categories,
    });
  });

  it("allows multiple identifiers on separate lines without submitting on Enter", async () => {
    render(<Banner />);

    const identifier = screen.getByRole("textbox", {
      name: "Enter IMEI or Serial Number...",
    });
    fireEvent.change(identifier, { target: { value: "123456789012345" } });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "FMI Free Check" }),
      ).toBeInTheDocument();
    });

    fireEvent.keyDown(identifier, { key: "Enter", code: "Enter" });

    expect(push).not.toHaveBeenCalled();

    fireEvent.change(identifier, {
      target: { value: "123456789012345\n987654321098765" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Free Check" }));

    expect(push).toHaveBeenCalledWith(
      "/shopkeeper/scan-device?imei=123456789012345%0A987654321098765&serviceId=6",
    );
  });

  it("keeps an empty identifier from submitting", async () => {
    render(<Banner />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "FMI Free Check" }),
      ).toBeInTheDocument();
    });
    const identifier = screen.getByRole("textbox", {
      name: "Enter IMEI or Serial Number...",
    });
    fireEvent.click(screen.getByRole("button", { name: "Free Check" }));

    expect(identifier).toBeInvalid();
    expect(push).not.toHaveBeenCalled();
  });

  it("keeps paid services unavailable to guests", async () => {
    render(<Banner />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "FMI Free Check" }),
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "FMI Free Check" }));

    expect(
      screen.queryByRole("button", { name: /Carrier Premium Check/ }),
    ).not.toBeInTheDocument();
  });

  it("opens the service picker with a quick-check filter", async () => {
    render(<Banner />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "FMI Free Check" }),
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "FMI" }));

    expect(screen.getByRole("searchbox")).toHaveValue("fmi");
    expect(
      screen.getByRole("button", { name: "FMI Free Check" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /FMI Free Check/ }),
    ).toBeInTheDocument();
  });

  it("routes an authenticated check with the selected service", async () => {
    sessionStatus = "authenticated";
    render(<Banner />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Choose Service" }),
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Choose Service" }));
    fireEvent.click(
      screen.getByRole("option", { name: /Carrier Premium Check/ }),
    );

    const identifier = screen.getByRole("textbox", {
      name: "Enter IMEI or Serial Number...",
    });
    fireEvent.change(identifier, { target: { value: "SN-ABC-123" } });
    fireEvent.submit(identifier.closest("form") as HTMLFormElement);

    expect(push).toHaveBeenCalledWith(
      "/shopkeeper/scan-device?imei=SN-ABC-123&serviceId=12",
    );
  });

  it("opens the scanner from an accessible icon button", async () => {
    render(<Banner />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "FMI Free Check" }),
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Scan IMEI" }));
    expect(screen.getByTestId("scanner-modal")).toBeInTheDocument();
  });
});
