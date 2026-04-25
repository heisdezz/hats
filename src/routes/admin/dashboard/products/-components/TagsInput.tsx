import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import { X } from "lucide-react";
import type { TagsResponse } from "pocketbase-types";

export type Tag = { tagName: string; tagId: string | null };

interface TagsInputProps {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  label?: string;
}

export default function TagsInput({
  value,
  onChange,
  label = "Tags",
}: TagsInputProps) {
  const [input, setInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedInput(input.trim()), 300);
    return () => clearTimeout(t);
  }, [input]);

  const { data } = useQuery({
    queryKey: ["tags-search", debouncedInput],
    queryFn: () =>
      pb.collection("tags").getList<TagsResponse>(1, 8, {
        filter: pb.filter("name ~ {:q}", { q: debouncedInput }),
      }),
    enabled: debouncedInput.length > 0,
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isDupe = (name: string) =>
    value.some((t) => t.tagName.toLowerCase() === name.toLowerCase());

  const addTag = (tag: Tag) => {
    if (isDupe(tag.tagName)) return;
    onChange([...value, tag]);
    setInput("");
    setDebouncedInput("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagName: string) =>
    onChange(value.filter((t) => t.tagName !== tagName));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) return;
      const exact = data?.items.find(
        (s) => s.name?.toLowerCase() === trimmed.toLowerCase(),
      );
      addTag(
        exact
          ? { tagName: exact.name!, tagId: exact.id }
          : { tagName: trimmed, tagId: null },
      );
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1].tagName);
    }
    if (e.key === "Escape") setOpen(false);
  };

  const suggestions = data?.items ?? [];
  const trimmed = input.trim();
  const exactMatch = suggestions.some(
    (s) => s.name?.toLowerCase() === trimmed.toLowerCase(),
  );
  const showAddNew = trimmed.length > 0 && !exactMatch && !isDupe(trimmed);
  const showDropdown =
    open && debouncedInput.length > 0 && (suggestions.length > 0 || showAddNew);

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="fieldset-label font-semibold">
        <span className="text-sm">{label}</span>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag.tagName}
              className="badge badge-neutral gap-1 py-3 shrink-0"
            >
              {tag.tagName}
              {tag.tagId === null && (
                <span className="opacity-50 text-xs">new</span>
              )}
              <button
                type="button"
                onClick={() => removeTag(tag.tagName)}
                className="hover:text-error transition-colors"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => trimmed && setOpen(true)}
          placeholder="Search or add tags..."
          className="input input-bordered w-full text-sm"
        />

        {showDropdown && (
          <ul className="absolute z-50 top-full mt-1 w-full bg-base-100 border border-base-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions
              .filter((s) => !isDupe(s.name ?? ""))
              .map((tag) => (
                <li key={tag.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-base-200 transition-colors"
                    onClick={() =>
                      addTag({ tagName: tag.name!, tagId: tag.id })
                    }
                  >
                    {tag.name}
                  </button>
                </li>
              ))}
            {showAddNew && (
              <li className="border-t border-base-200">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-base-200 transition-colors flex items-center gap-2"
                  onClick={() => addTag({ tagName: trimmed, tagId: null })}
                >
                  <span className="text-base-content/50">Add</span>
                  <span className="badge badge-sm badge-outline">
                    {trimmed}
                  </span>
                  <span className="text-xs text-base-content/30 ml-auto">
                    new
                  </span>
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
