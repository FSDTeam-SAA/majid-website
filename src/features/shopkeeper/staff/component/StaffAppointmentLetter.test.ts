import { generateStaffAppointmentLetter } from "./StaffAppointmentLetter";

jest.mock("jspdf", () => {
  const saveMock = jest.fn();
  const textMock = jest.fn();
  const rectMock = jest.fn();
  const roundedRectMock = jest.fn();
  const lineMock = jest.fn();
  const setFontMock = jest.fn();
  const setFontSizeMock = jest.fn();
  const setTextColorMock = jest.fn();
  const setFillColorMock = jest.fn();
  const setDrawColorMock = jest.fn();
  const setLineWidthMock = jest.fn();

  return jest.fn().mockImplementation(() => ({
    save: saveMock,
    text: textMock,
    rect: rectMock,
    roundedRect: roundedRectMock,
    line: lineMock,
    setFont: setFontMock,
    setFontSize: setFontSizeMock,
    setTextColor: setTextColorMock,
    setFillColor: setFillColorMock,
    setDrawColor: setDrawColorMock,
    setLineWidth: setLineWidthMock,
  }));
});

describe("StaffAppointmentLetter PDF generator", () => {
  it("generates and saves an appointment letter PDF with staff details", () => {
    generateStaffAppointmentLetter({
      fullName: "Tariq Mahmood",
      staffId: "STF-4130",
      email: "tariq@example.com",
      phone: "+44 7123 456789",
      jobRole: "Sales Executive",
      storeName: "Romford Store",
      wageType: "per-day",
      wageAmount: "120.00",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      weekendDays: ["Saturday", "Sunday"],
      pinCode: "1234",
      addressLine1: "12 Maxwell Road",
      townCity: "Romford",
      county: "Essex",
      postcode: "RM7 9AB",
    });

    const jsPDFMock = jest.requireMock("jspdf");
    expect(jsPDFMock).toHaveBeenCalled();
  });
});
