"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export type GeoapifyAddress = {
  address_line1?: string;
  address_line2?: string;
  city?: string;
  country?: string;
  country_code?: string;
  formatted: string;
  housenumber?: string;
  lat?: number;
  lon?: number;
  postcode?: string;
  state?: string;
  street?: string;
};

type GeoapifyResponse = {
  results?: GeoapifyAddress[];
};

type AddressType =
  "country" | "state" | "city" | "postcode" | "street" | "amenity" | "locality";

export type AddressAutocompleteProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "autoComplete"
> & {
  addressType?: AddressType;
  countryCodes?: string[];
  debounceMs?: number;
  minLength?: number;
  onPlaceSelect?: (place: GeoapifyAddress) => void;
};

const endpoint = "https://api.geoapify.com/v1/geocode/autocomplete";

export async function getAddressSuggestions(
  text: string,
  options: {
    apiKey: string;
    signal?: AbortSignal;
    type?: AddressType;
    countryCodes?: string[];
  },
): Promise<GeoapifyAddress[]> {
  const url = new URL(endpoint);
  url.searchParams.set("text", text);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "6");
  url.searchParams.set("apiKey", options.apiKey);

  if (options.type) url.searchParams.set("type", options.type);
  if (options.countryCodes?.length) {
    url.searchParams.set(
      "filter",
      `countrycode:${options.countryCodes.join(",").toLowerCase()}`,
    );
  }

  const response = await fetch(url, { signal: options.signal });
  if (!response.ok) {
    throw new Error(`Geoapify autocomplete failed (${response.status})`);
  }

  const data = (await response.json()) as GeoapifyResponse;
  return data.results ?? [];
}

function valueForType(place: GeoapifyAddress, type?: AddressType) {
  if (type === "city")
    return place.city || place.address_line1 || place.formatted;
  if (type === "postcode")
    return place.postcode || place.address_line1 || place.formatted;
  if (type === "state")
    return place.state || place.address_line1 || place.formatted;
  if (type === "country") return place.country || place.formatted;
  if (type === "street") {
    return (
      place.address_line1 ||
      [place.housenumber, place.street].filter(Boolean).join(" ") ||
      place.formatted
    );
  }
  return place.formatted;
}

export const AddressAutocomplete = forwardRef<
  HTMLInputElement,
  AddressAutocompleteProps
>(function AddressAutocomplete(
  {
    addressType,
    className,
    countryCodes,
    debounceMs = 300,
    disabled,
    minLength = 3,
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    onPlaceSelect,
    value,
    defaultValue,
    ...props
  },
  forwardedRef,
) {
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const [query, setQuery] = useState(String(value ?? defaultValue ?? ""));
  const [suggestions, setSuggestions] = useState<GeoapifyAddress[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  useEffect(() => {
    if (value !== undefined) setQuery(String(value ?? ""));
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsFocused(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (disabled || !apiKey || !isFocused || trimmedQuery.length < minLength) {
      setSuggestions([]);
      setActiveIndex(-1);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await getAddressSuggestions(trimmedQuery, {
          apiKey,
          signal: controller.signal,
          type: addressType,
          countryCodes,
        });
        setSuggestions(results);
        setActiveIndex(-1);
        setHasSearched(true);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSuggestions([]);
          setHasSearched(true);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    addressType,
    apiKey,
    countryCodes,
    debounceMs,
    disabled,
    isFocused,
    minLength,
    query,
  ]);

  const emitChange = (nextValue: string) => {
    setQuery(nextValue);
    onChange?.({
      target: { name: props.name, value: nextValue },
      currentTarget: { name: props.name, value: nextValue },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const selectPlace = (place: GeoapifyAddress) => {
    emitChange(valueForType(place, addressType));
    setSuggestions([]);
    setActiveIndex(-1);
    setIsFocused(false);
    onPlaceSelect?.(place);
  };

  const isOpen =
    isFocused &&
    Boolean(apiKey) &&
    query.trim().length >= minLength &&
    (isLoading || suggestions.length > 0 || hasSearched);

  return (
    <div ref={rootRef} className="relative w-full">
      <input
        {...props}
        ref={inputRef}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
        }
        autoComplete="off"
        className={cn(
          "flex w-full border bg-background px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        disabled={disabled}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          onChange?.(event);
        }}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          if (isOpen && suggestions.length) {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => (index + 1) % suggestions.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex(
                (index) =>
                  (index - 1 + suggestions.length) % suggestions.length,
              );
            } else if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault();
              selectPlace(suggestions[activeIndex]);
            } else if (event.key === "Escape") {
              setIsFocused(false);
            }
          }
          onKeyDown?.(event);
        }}
      />

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-[100] mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl"
        >
          {isLoading && suggestions.length === 0 ? (
            <div className="px-3 py-3 text-xs font-semibold text-muted-foreground">
              Searching addresses…
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((place, index) => (
              <button
                id={`${listboxId}-${index}`}
                key={`${place.lat}-${place.lon}-${place.formatted}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  "block w-full rounded-lg px-3 py-2 text-left transition-colors",
                  index === activeIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/70",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectPlace(place)}
              >
                <span className="block text-sm font-semibold">
                  {place.address_line1 || place.formatted}
                </span>
                {place.address_line2 && (
                  <span className="block truncate text-xs text-muted-foreground">
                    {place.address_line2}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-xs font-semibold text-muted-foreground">
              No matching addresses
            </div>
          )}
          <div className="border-t border-border px-3 py-1.5 text-right text-[10px] text-muted-foreground">
            Powered by Geoapify
          </div>
        </div>
      )}
    </div>
  );
});
