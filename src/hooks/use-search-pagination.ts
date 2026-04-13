import { useMemo, useState } from "react";

const PER_PAGE = 6;

export function useSearchPagination<T>(items: T[], searchFn: (item: T, query: string) => boolean) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => searchFn(item, q));
  }, [items, search, searchFn]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const onSearch = (q: string) => { setSearch(q); setPage(1); };

  return { search, onSearch, page: safePage, setPage, totalPages, paginated, total: filtered.length };
}
