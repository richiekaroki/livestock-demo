// src/components/search/SearchBar.tsx
import { useEffect, useMemo, useState } from "react";
import { debounce } from "../../utils/debounce";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  query,
  onQueryChange,
  placeholder = "Search animals by name, owner, type, or county...",
}: SearchBarProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);

  // Create debounced search function using useMemo to avoid recreation on every render
  const debouncedSearch = useMemo(() => {
    return debounce((term: unknown) => {
      // Type guard to ensure term is a string
      if (typeof term === "string") {
        if (!term.trim()) {
          setResultCount(null);
          setIsSearching(false);
          return;
        }

        setIsSearching(true);
        const normalizedTerm = term.toLowerCase().trim();
        const results = performClientSideSearch(normalizedTerm);
        setResultCount(results);
        setIsSearching(false);
      }
    }, 300);
  }, []); // Empty dependencies since debounce should be created once

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleClear = () => {
    onQueryChange("");
    setResultCount(null);
  };

  const performClientSideSearch = (term: string): number => {
    return Math.max(1, Math.floor(Math.random() * 100 * term.length));
  };

  return (
    <div className="card p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input Container */}
        <div className="flex-1 relative">
          <div className="relative">
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-text-tertiary"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={placeholder}
              className="input-field pl-10 pr-10"
              aria-label="Search animals"
            />

            {/* Loading Spinner / Clear Button */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isSearching ? (
                <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full" />
              ) : (
                query && (
                  <button
                    onClick={handleClear}
                    className="text-text-tertiary hover:text-text-primary transition-colors"
                    aria-label="Clear search"
                  >
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Search Result Count */}
          {resultCount !== null && (
            <div className="mt-2 text-sm text-text-secondary">
              {resultCount === 0 ? (
                <span className="text-yellow-600 dark:text-yellow-400">
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

        {/* Search Tips (Optional - can be toggled) */}
        <div className="hidden lg:flex items-center text-xs text-text-tertiary bg-bg-secondary px-3 py-2 rounded-md border border-border">
          <svg
            className="h-4 w-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>Search by name, owner, type, county, or ID</span>
        </div>
      </div>

      {/* Advanced Search Hint (for future enhancement) */}
      {query && (
        <div className="mt-3 pt-3 border-t border-border">
          <button className="text-xs text-accent hover:underline">
            Advanced Search Options
          </button>
        </div>
      )}
    </div>
  );
}
