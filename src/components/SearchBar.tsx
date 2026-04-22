import { useForm } from "react-hook-form";
import { Search as IconSearch } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export default function SearchBar() {
  const form = useForm({ defaultValues: { query: "" } });
  const nav = useNavigate();

  const search = ({ query }: { query: string }) => {
    nav({
      //@ts-ignore
      search: (prev) => ({ ...prev, search: query || undefined }),
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(search)}
      className="input input-bordered flex items-center gap-2 w-full rounded-full bg-base-200 border-base-200 focus-within:border-base-300"
    >
      <input
        {...form.register("query")}
        type="text"
        placeholder="I'm shopping for ..."
        className="grow text-sm"
      />
      <IconSearch size={18} className="text-base-content/50" />
    </form>
  );
}
