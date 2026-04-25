import { extract_message } from "@/helpers/api";
import type { QueryObserver, QueryObserverResult } from "@tanstack/react-query";

interface PageLoader<TData> {
  children?: React.ReactNode | ((data: TData) => React.ReactNode);
  query: QueryObserverResult<TData>;
  customLoading?: React.ReactNode;
  customError?: (data: any) => React.ReactNode;
}

export default function CompLoader<TData>(props: PageLoader<TData>) {
  const { query, customLoading, customError } = props;
  if (query.isLoading) {
    if (customLoading) {
      return customLoading;
    }
    return (
      <div className={` flex-1 p-6 grid place-items-center bg-base-200`}>
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
  if (query.error) {
    const error = extract_message(query.error as any);
    if (customError) {
      return customError(error);
    }
    return (
      <>
        <div className={`p-4  grid place-items-center bg-base-300 rounded-md`}>
          <div className="p-4 space-y-4">
            <div className="text-lg text-center fieldset-label font-bold wrap-anywhere">
              {error}
            </div>
            <button
              className="btn btn-error btn-block"
              onClick={() => {
                return props.query.refetch();
              }}
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
        {typeof props.children === "function"
          ? props.children(props.query.data) // ✅ fully inferred
          : props.children}
      </>
    );
}
