import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { Search as IconSearch, X as IconX } from "lucide-react";

interface Props {
  defaultValue?: string;
}

export default function OrderSearch({ defaultValue = "" }: Props) {
  const form = useForm({ defaultValues: { reference: defaultValue } });
  const nav = useNavigate();

  const submit = ({ reference }: { reference: string }) => {
    nav({
      to: "/profile/orders/",
      search: (prev: any) => ({
        ...prev,
        reference: reference.trim() || undefined,
        page: 1,
      }),
    });
  };

  const clear = () => {
    form.reset({ reference: "" });
    nav({
      to: "/profile/orders/",
      search: (prev: any) => ({ ...prev, reference: undefined, page: 1 }),
    });
  };

  const value = form.watch("reference");

  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="input flex items-center gap-2 w-full bg-base-200 border-base-200 focus-within:border-base-300"
    >
      <IconSearch size={16} className="text-base-content/40 shrink-0" />
      <input
        {...form.register("reference")}
        type="text"
        placeholder="Search by reference..."
        className="grow text-sm bg-transparent outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="text-base-content/40 hover:text-base-content shrink-0"
        >
          <IconX size={14} />
        </button>
      )}
    </form>
  );
}
