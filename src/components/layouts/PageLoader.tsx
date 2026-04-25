import { extract_message } from "@/helpers/api";
import type { QueryObserver, QueryObserverResult } from "@tanstack/react-query";

interface PageLoader<TData> {
  children?: React.ReactNode | ((data: TData) => React.ReactNode);
  query: QueryObserverResult<TData>;
  customLoading?: React.ReactNode;
}

export default function PageLoader<TData>(props: PageLoader<TData>) {
  const { query, customLoading } = props;
  if (query.isLoading) {
    if (customLoading) {
      return customLoading;
    }
    return (
      <div className="min-h-screen grid place-items-center bg-base-200">
        <div className="flex flex-col items-center space-y-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-loader-2 animate-spin text-primary"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span className="text-xl font-semibold text-base-content">
            Loading...
          </span>
          <progress className="progress progress-primary w-56"></progress>
        </div>
      </div>
    );
  }
  if (query.isError) {
    const error = extract_message(query.error as any);
    return (
      <>
        <div className="p-4 min-h-screen grid place-items-center bg-base-300 rounded-md">
          <div className="p-4 space-y-4">
            <div className="text-lg text-center fieldset-label font-bold wrap-anywhere">
              {error}
            </div>
            <button
              className="btn btn-error btn-block"
              onClick={() => props.query.refetch()}
            >
              Reload
            </button>
          </div>
        </div>
      </>
    );
  }

  if (props.query.isSuccess && props.query.data)
    return (
      <>
        {/*{showTitle && (
          <SimpleHeader title={props.title}>{props.headerActions}</SimpleHeader>
        )}*/}
        <div className="flex-1">
          {typeof props.children === "function"
            ? props.children(props.query.data) // ✅ fully inferred
            : props.children}
        </div>
      </>
    );
}
