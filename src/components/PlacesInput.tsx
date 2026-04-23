import { usePlacesWidget } from "react-google-autocomplete";

type Props = {
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
};

export default function PlacesInput({ onPlaceSelected, placeholder, className }: Props) {
  const { ref } = usePlacesWidget<HTMLInputElement>({
    apiKey: import.meta.env.VITE_TEST_GOOGLE_MAPS_API_KEY as string,
    onPlaceSelected,
    options: {
      componentRestrictions: { country: "ng" },
      fields: ["formatted_address", "address_components", "geometry"],
    },
  });

  return (
    <input
      ref={ref}
      type="text"
      placeholder={placeholder}
      className={className}
    />
  );
}
