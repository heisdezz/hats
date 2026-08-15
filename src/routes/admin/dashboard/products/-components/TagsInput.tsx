import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import { X, Tag as TagIcon, Plus } from "lucide-react";
import type { TagsResponse } from "pocketbase-types";

export type Tag = { tagName: string; tagId: string | null };

/**
 * Robustly normalizes tags from any format:
 * - JSON string: '[{"tagname":"black hat","tagid":null}]'
 * - Objects with tagname / tagName / name / label
 * - Comma-delimited strings: 'hat, straw, wide'
 * - Nested arrays
 */
export function normalizeTagItem(item: any): Tag[] {
  if (!item) return [];

  // String handling
  if (typeof item === "string") {
    const trimmed = item.trim();
    if (!trimmed) return [];

    // Check if it's a JSON array or object
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeTagItem(parsed);
      } catch (_) {
        // Not valid JSON, continue with raw string
      }
    }

    // Comma-separated tags
    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ tagName: s, tagId: null }));
    }

    return [{ tagName: trimmed, tagId: null }];
  }

  // Array handling
  if (Array.isArray(item)) {
    return item.flatMap((sub) => normalizeTagItem(sub));
  }

  // Object handling
  if (typeof item === "object") {
    const rawName =
      item.tagName ||
      item.tagname ||
      item.name ||
      item.label ||
      item.title ||
      "";
    const rawId = item.tagId || item.tagid || item.id || null;

    if (typeof rawName === "string") {
      const trimmed = rawName.trim();
      if (
        (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
        (trimmed.startsWith("{") && trimmed.endsWith("}"))
      ) {
        try {
          const parsed = JSON.parse(trimmed);
          return normalizeTagItem(parsed);
        } catch (_) {}
      }

      if (trimmed) {
        return [{ tagName: trimmed, tagId: rawId || null }];
      }
    }
  }

  return [];
}

export function parseProductTags(product: any): Tag[] {
  if (!product) return [];

  // 1. Check expanded tags first
  const expanded = product.expand?.tags;
  if (Array.isArray(expanded) && expanded.length > 0) {
    const parsed = expanded
      .map((t: any) => ({
        tagName: t.name || t.tagName || t.tagname || "",
        tagId: t.id || null,
      }))
      .filter((t) => Boolean(t.tagName));
    if (parsed.length > 0) return parsed;
  }

  // 2. Fallback to product.tags field
  if (product.tags) {
    return normalizeTagItem(product.tags);
  }

  return [];
}

interface TagsInputProps {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  label?: string;
}

export default function TagsInput({
  value = [],
  onChange,
  label = "Tags",
}: TagsInputProps) {
  const [input, setInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize incoming value to ensure no raw JSON strings are ever rendered as tag badges
  const cleanTags = useMemo(() => {
    return normalizeTagItem(value).filter((t, idx, arr) => 
      arr.findIndex((other) => other.tagName.toLowerCase() === t.tagName.toLowerCase()) === idx
    );
  }, [value]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedInput(input.trim()), 250);
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
    cleanTags.some((t) => t.tagName.toLowerCase() === name.toLowerCase());

  const addTag = (tag: Tag) => {
    const normalized = normalizeTagItem(tag);
    if (!normalized.length) return;

    const toAdd = normalized.filter((t) => !isDupe(t.tagName));
    if (!toAdd.length) return;

    onChange([...cleanTags, ...toAdd]);
    setInput("");
    setDebouncedInput("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagName: string) => {
    onChange(cleanTags.filter((t) => t.tagName !== tagName));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = input.replace(/,/g, "").trim();
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
    if (e.key === "Backspace" && !input && cleanTags.length > 0) {
      removeTag(cleanTags[cleanTags.length - 1].tagName);
    }
    if (e.key === "Escape") setOpen(false);
  };

  const suggestions = data?.items ?? [];
  const trimmed = input.replace(/,/g, "").trim();
  const exactMatch = suggestions.some(
    (s) => s.name?.toLowerCase() === trimmed.toLowerCase(),
  );
  const showAddNew = trimmed.length > 0 && !exactMatch && !isDupe(trimmed);
  const showDropdown =
    open && debouncedInput.length > 0 && (suggestions.length > 0 || showAddNew);

  return (
    <div className="space-y-2.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold flex items-center gap-1.5">
          <TagIcon className="size-3.5 text-primary" />
          <span>{label}</span>
        </label>
        <span className="text-xs text-base-content/40">Press Enter or comma to add</span>
      </div>

      {cleanTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-base-200/40 border border-base-200 min-h-[42px] items-center">
          {cleanTags.map((tag) => (
            <span
              key={tag.tagName}
              className="badge badge-neutral gap-1.5 py-3 px-2.5 rounded-lg shrink-0 text-xs shadow-2xs group"
            >
              <span className="font-medium">{tag.tagName}</span>
              {tag.tagId === null && (
                <span className="text-[10px] opacity-50 uppercase tracking-wider">new</span>
              )}
              <button
                type="button"
                onClick={() => removeTag(tag.tagName)}
                className="hover:text-error transition-colors p-0.5 rounded-full"
                aria-label={`Remove tag ${tag.tagName}`}
              >
                <X size={12} />
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
          placeholder="Type tag name and press Enter (e.g. Fascinator, Wide Brim, Silk)..."
          className="input input-sm input-bordered w-full rounded-xl text-xs"
        />

        {showDropdown && (
          <ul className="absolute z-50 top-full mt-1.5 w-full bg-base-100 border border-base-200 rounded-2xl shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto">
            {suggestions
              .filter((s) => !isDupe(s.name ?? ""))
              .map((tag) => (
                <li key={tag.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-base-200 flex items-center justify-between transition-colors"
                    onClick={() =>
                      addTag({ tagName: tag.name!, tagId: tag.id })
                    }
                  >
                    <span className="font-medium">{tag.name}</span>
                    <span className="badge badge-ghost badge-xs text-[10px]">existing</span>
                  </button>
                </li>
              ))}
            {showAddNew && (
              <li className="border-t border-base-200 mt-1 pt-1">
                <button
                  type="button"
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-primary/10 text-primary transition-colors flex items-center gap-2"
                  onClick={() => addTag({ tagName: trimmed, tagId: null })}
                >
                  <Plus className="size-3.5" />
                  <span>Create tag "<strong>{trimmed}</strong>"</span>
                  <span className="badge badge-primary badge-xs ml-auto">new</span>
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
