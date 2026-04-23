import type { DeliverySettingsRecord } from "pocketbase-types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

function validate(s: Partial<DeliverySettingsRecord>) {
  return !!s.fullAdress?.trim();
}

export const useDeliverySettings = create<{
  delivery_settings: Partial<DeliverySettingsRecord>;
  isValid: boolean;
  [key: string]: any;
  updateDeliverySettings: (
    newSettings: Partial<DeliverySettingsRecord>,
  ) => void;
}>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "delivery-settings",
    },
  ),
);
