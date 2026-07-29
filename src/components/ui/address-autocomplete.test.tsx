import { getAddressSuggestions } from "./address-autocomplete";

describe("getAddressSuggestions", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
      writable: true,
    });
  });

  afterEach(() => {
    fetchMock.mockReset();
    delete (globalThis as { fetch?: typeof fetch }).fetch;
  });

  it("requests Geoapify autocomplete with the configured search options", async () => {
    const results = [
      {
        formatted: "10 Downing Street, London, United Kingdom",
        city: "London",
        postcode: "SW1A 2AA",
      },
    ];
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ results }),
    });

    await expect(
      getAddressSuggestions("10 Downing", {
        apiKey: "test-key",
        type: "street",
        countryCodes: ["GB"],
      }),
    ).resolves.toEqual(results);

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.origin + requestedUrl.pathname).toBe(
      "https://api.geoapify.com/v1/geocode/autocomplete",
    );
    expect(requestedUrl.searchParams.get("text")).toBe("10 Downing");
    expect(requestedUrl.searchParams.get("type")).toBe("street");
    expect(requestedUrl.searchParams.get("filter")).toBe("countrycode:gb");
    expect(requestedUrl.searchParams.get("apiKey")).toBe("test-key");
    expect(requestedUrl.searchParams.get("limit")).toBe("6");
  });

  it("throws when Geoapify returns an error response", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429 });

    await expect(
      getAddressSuggestions("London", { apiKey: "test-key" }),
    ).rejects.toThrow("Geoapify autocomplete failed (429)");
  });
});
