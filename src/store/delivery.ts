import type { DeliverySettingsRecord } from "pocketbase-types";
import { create } from "zustand";

function validate(s: Partial<DeliverySettingsRecord>) {
  return !!s.fullAdress?.trim();
}

const useDeliverySettings = create<{
  delivery_settings: Partial<DeliverySettingsRecord>;
  isValid: boolean;
  [key: string]: any;
  updateDeliverySettings: (
    newSettings: Partial<DeliverySettingsRecord>,
  ) => void;
}>((set) => ({
  delivery_settings: {
    location: { lat: 0, lon: 0 },
    fullAdress: "",
    city: "",
    state: "",
    profile: "",
  },
  isValid: false,
  updateDeliverySettings: (newSettings) =>
    set({ delivery_settings: newSettings, isValid: validate(newSettings) }),
}));
