import { useForm } from "react-hook-form";
import { Search as IconSearch, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export default function SearchBar() {
  const form = useForm({ defaultValues: { query: "" } });
  const nav = useNavigate();
  const queryValue = form.watch("query");

  const search = ({ query }: { query: string }) => {
    nav({
      to: "/store/catalog",
      search: (prev: any) => ({ ...prev, search: query || undefined }),
    });
  };

  const handleClear = () => {
    form.setValue("query", "");
  };

  return (
    <form
      onSubmit={form.handleSubmit(search)}
      className="relative flex items-center w-full group  "
    >
      <input
        {...form.register("query")}
        type="text"
        placeholder="Search handcrafted hats, fascinators, jewelry..."
        className="w-full h-10 pl-10 pr-10 text-sm rounded-full bg-base-200/80 border border-base-300 focus:border-primary/50 focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-base-content/40"
      />
      <IconSearch
        size={16}
        className="absolute left-3.5 text-base-content/40 group-focus-within:text-primary transition-colors pointer-events-none"
      />
      {queryValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-0.5 rounded-full hover:bg-base-300 text-base-content/50 transition-colors"
          title="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </form>
  );
}
