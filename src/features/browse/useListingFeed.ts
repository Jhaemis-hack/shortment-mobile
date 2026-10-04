import { useEffect, useRef, useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import { getListings } from "../../services";
import { getErrorMessage } from "../../services/http";
import { toast } from "../../lib/toast";
import type { SearchValues } from "./search";

/**
 * Infinite listing feed for Explore: page 1 loads whenever the filters change,
 * `loadMore` appends the next page, `refresh` reloads page 1 without blanking the list.
 */
export function useListingFeed(filters: SearchValues, pageSize: number) {
  const { ltn, a_type, b_num } = filters;
  const key = `${ltn}|${a_type}|${b_num}`;
  const result = useAsync(() => getListings({ ltn, a_type, b_num, page: 1, page_size: pageSize }), [key, pageSize]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const busy = useRef(false);
  // Responses for filters the user has since changed are dropped.
  const currentKey = useRef(key);
  useEffect(() => {
    currentKey.current = key;
  }, [key]);

  const loadMore = async () => {
    if (result.status !== "success" || busy.current) return;
    const { items, currentPage, totalPages } = result.data;
    if (currentPage >= totalPages) return;
    busy.current = true;
    setLoadingMore(true);
    try {
      const next = await getListings({ ltn, a_type, b_num, page: currentPage + 1, page_size: pageSize });
      if (currentKey.current !== key) return;
      const seen = new Set(items.map(item => item.id));
      result.setData({ ...next, items: [...items, ...next.items.filter(item => !seen.has(item.id))] });
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn't load more apartments."));
    } finally {
      busy.current = false;
      setLoadingMore(false);
    }
  };

  const refresh = async () => {
    if (result.status !== "success") {
      result.reload();
      return;
    }
    setRefreshing(true);
    try {
      const page = await getListings({ ltn, a_type, b_num, page: 1, page_size: pageSize });
      if (currentKey.current === key) result.setData(page);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRefreshing(false);
    }
  };

  return { result, loadingMore, refreshing, loadMore, refresh };
}
