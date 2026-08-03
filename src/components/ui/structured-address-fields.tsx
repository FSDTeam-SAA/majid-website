"use client";

import { useId } from "react";

import {
  AddressAutocomplete,
  GeoapifyAddress,
} from "@/components/ui/address-autocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AddressParts = {
  buildingNumber: string;
  street: string;
  postcode: string;
  country: string;
};

interface StructuredAddressFieldsProps {
  value: string;
  onChange: (address: string) => void;
  required?: boolean;
  disabled?: boolean;
}

const emptyAddress: AddressParts = {
  buildingNumber: "",
  street: "",
  postcode: "",
  country: "",
};

function toAddressValue({
  buildingNumber,
  street,
  postcode,
  country,
}: AddressParts) {
  const streetLine = [buildingNumber, street].filter(Boolean).join(" ");
  return [streetLine, postcode, country].filter(Boolean).join(", ");
}

function splitAddress(value: string): AddressParts {
  if (!value.trim()) return emptyAddress;

  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const firstLine = parts[0] || "";
  const buildingMatch = firstLine.match(/^([\p{N}\p{L}-]+)\s+(.+)$/u);

  return {
    buildingNumber: buildingMatch?.[1] || "",
    street: buildingMatch?.[2] || firstLine,
    postcode: parts.length > 2 ? parts[parts.length - 2] : "",
    country: parts.length > 1 ? parts[parts.length - 1] : "",
  };
}

function streetFromPlace(place: GeoapifyAddress) {
  if (place.street) return place.street;
  if (place.address_line1) {
    const addressLine = place.address_line1.trim();
    if (place.housenumber && addressLine.startsWith(place.housenumber)) {
      return addressLine.slice(place.housenumber.length).trim();
    }
    return addressLine;
  }
  return "";
}

export function StructuredAddressFields({
  value,
  onChange,
  required,
  disabled,
}: StructuredAddressFieldsProps) {
  const fieldId = useId();
  const address = splitAddress(value);

  const updateAddress = (nextAddress: AddressParts) => {
    onChange(toAddressValue(nextAddress));
  };

  const updateField = (field: keyof AddressParts, fieldValue: string) => {
    updateAddress({ ...address, [field]: fieldValue });
  };

  const handlePlaceSelect = (place: GeoapifyAddress) => {
    updateAddress({
      buildingNumber: place.housenumber || address.buildingNumber,
      street: streetFromPlace(place) || address.street,
      postcode: place.postcode || address.postcode,
      country: place.country || address.country,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label
          className="text-xs font-semibold"
          htmlFor={`${fieldId}-building`}
        >
          Building number
        </Label>
        <Input
          id={`${fieldId}-building`}
          value={address.buildingNumber}
          onChange={(event) =>
            updateField("buildingNumber", event.target.value)
          }
          placeholder="12A"
          disabled={disabled}
          required={required}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold" htmlFor={`${fieldId}-street`}>
          Street
        </Label>
        <AddressAutocomplete
          id={`${fieldId}-street`}
          value={address.street}
          onChange={(event) => updateField("street", event.target.value)}
          onPlaceSelect={handlePlaceSelect}
          addressType="street"
          placeholder="Start typing an address"
          disabled={disabled}
          required={required}
          className="h-9 rounded-md border-input bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          className="text-xs font-semibold"
          htmlFor={`${fieldId}-postcode`}
        >
          Post code
        </Label>
        <Input
          id={`${fieldId}-postcode`}
          value={address.postcode}
          onChange={(event) => updateField("postcode", event.target.value)}
          placeholder="1207"
          disabled={disabled}
          required={required}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold" htmlFor={`${fieldId}-country`}>
          Country
        </Label>
        <AddressAutocomplete
          id={`${fieldId}-country`}
          value={address.country}
          onChange={(event) => updateField("country", event.target.value)}
          addressType="country"
          placeholder="Bangladesh"
          disabled={disabled}
          required={required}
          className="h-9 rounded-md border-input bg-background"
        />
      </div>
    </div>
  );
}
