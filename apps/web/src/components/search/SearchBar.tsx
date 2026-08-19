// src/components/search/SearchBar.tsx

import { memo } from "react";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
  resultCount?: number | null;
}

const SearchBar = memo(function SearchBar({
  query,
  onQueryChange,
  placeholder = "Search animals by name, owner, type, or county...",
  resultCount = null,
}: SearchBarProps) {
  const handleClear = () => {
    onQueryChange("");
  };

  return (
    <div className="card p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-text-tertiary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={placeholder}
              className="input-field pl-10 pr-10"
              aria-label="Search animals"
            />

            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {query && (
                <button
                  onClick={handleClear}
                  className="text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {resultCount !== null && query && (
            <div className="mt-2 text-sm text-text-secondary">
              {resultCount === 0 ? (
                <span className="text-warning">
                  No results found for "{query}"
                </span>
              ) : (
                <span>
                  Found <strong className="text-accent">{resultCount}</strong>{" "}
                  {resultCount === 1 ? "animal" : "animals"} matching "{query}"
                </span>
              )}
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center text-xs text-text-tertiary bg-bg-secondary px-3 py-2 rounded-lg border border-border">
          <svg
            className="h-4 w-4 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Search by name, owner, type, county, or ID</span>
        </div>
      </div>
    </div>
  );
});

export default SearchBar;
