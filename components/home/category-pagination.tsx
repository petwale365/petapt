"use client";

import { parseAsInteger, useQueryState } from "nuqs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CategoryPaginationProps {
  totalPages: number;
}

export function CategoryPagination({ totalPages }: CategoryPaginationProps) {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleNext = () => {
    handlePageChange((page || 1) + 1);
  };

  const handlePrevious = () => {
    handlePageChange(Math.max((page || 1) - 1, 1));
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePrevious}
            aria-disabled={page === 1}
          />
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            aria-disabled={page === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
