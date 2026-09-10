import type { ReactNode } from "react";

export function QueryState({ label, hasData, isError, isFetching, refetch, children }: {
  label: string;
  hasData: boolean;
  isError: boolean;
  isFetching: boolean;
  refetch: () => Promise<unknown>;
  children?: ReactNode;
}) {
  return (
    <>
      {isError ? (
        <div role="alert" className="mb-4 text-sm font-sans text-primary">
          <p>{hasData ? `Couldn't refresh ${label}. Showing the last available results.` : `Couldn't load ${label}. Please try again.`}</p>
          <button type="button" className="mt-2 underline disabled:opacity-50" disabled={isFetching} onClick={() => void refetch()}>
            {isFetching ? "Retrying..." : `Retry ${label}`}
          </button>
        </div>
      ) : !hasData ? (
        <p role="status" className="text-sm font-sans text-muted">Loading {label}...</p>
      ) : null}
      {hasData && children}
    </>
  );
}
