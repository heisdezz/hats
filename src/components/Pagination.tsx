import { useNavigate } from "@tanstack/react-router";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export default function Pagination({ page, totalPages }: PaginationProps) {
  const nav = useNavigate();

  if (totalPages <= 1) return null;

  const goto = (p: number) => {
    nav({ search: (prev: any) => ({ ...prev, page: p }) });
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="join flex justify-center">
      <button
        className="join-item btn btn-sm"
        onClick={() => goto(page - 1)}
        disabled={page <= 1}
      >
        «
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`join-item btn btn-sm ${p === page ? "btn-active" : ""}`}
          onClick={() => goto(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="join-item btn btn-sm"
        onClick={() => goto(page + 1)}
        disabled={page >= totalPages}
      >
        »
      </button>
    </div>
  );
}
