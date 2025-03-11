"use client";
import React, { useCallback, useState, useEffect } from "react";

import { useQueryState } from "nuqs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";

export function SearchInput() {
  const [search, setSearch] = useQueryState("search", {
    shallow: false,
  });

  // Keep local state for immediate input value updates
  const [inputValue, setInputValue] = useState(search || "");

  // Watch for search param changes (including reset)
  useEffect(() => {
    setInputValue(search || "");
  }, [search]);

  // Create a debounced version of setSearch
  /*eslint-disable */
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setSearch(value || null);
    }, 500),
    [setSearch]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value); // Update local state immediately
    debouncedSetSearch(value); // Debounce the URL update
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search products..."
        className="pl-10"
        value={inputValue}
        onChange={handleSearch}
      />
    </div>
  );
}
