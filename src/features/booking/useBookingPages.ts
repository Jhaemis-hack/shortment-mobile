import { useCallback, useRef, useState } from "react";
import { getBookings } from "../../services";
import type { Booking } from "../../types/booking";

const PAGE_SIZE = 10;

type Status = "loading" | "success" | "error";

/** The guest's bookings, page by page, for an infinite list with pull-to-refresh. */
export const useBookingPages = () => {
  const [items, setItems] = useState<Booking[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<unknown>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaded = useRef(false);
  // Ignore responses from superseded requests (e.g. a refresh while "load more" is in flight).
  const generation = useRef(0);

  /** First page. "initial" shows the spinner; "refresh" the pull indicator; "quiet" nothing. */
  const loadFirst = useCallback(async (mode: "initial" | "refresh" | "quiet") => {
    const run = ++generation.current;
    if (mode === "initial") setStatus("loading");
    if (mode === "refresh") setRefreshing(true);
    try {
      const result = await getBookings(1, PAGE_SIZE);
      if (run !== generation.current) return;
      setItems(result.items);
      setPage(result.currentPage);
      setTotalPages(result.totalPages);
      setStatus("success");
      loaded.current = true;
    } catch (err) {
      if (run !== generation.current) return;
      // A failed background refresh keeps the list we already have.
      if (!loaded.current || mode !== "quiet") {
        setError(err);
        setStatus("error");
      }
    } finally {
      if (run === generation.current) setRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || status !== "success" || page >= totalPages) return;
    const run = generation.current;
    setLoadingMore(true);
    try {
      const result = await getBookings(page + 1, PAGE_SIZE);
      if (run !== generation.current) return;
      setItems(prev => {
        const seen = new Set(prev.map(booking => booking.booking_id));
        return [...prev, ...result.items.filter(booking => !seen.has(booking.booking_id))];
      });
      setPage(result.currentPage);
      setTotalPages(result.totalPages);
    } catch {
      // Leave the list as is; scrolling again retries.
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, page, status, totalPages]);

  /** Spinner on the first load; afterwards a quiet refresh that keeps the current list on failure. */
  const loadOnFocus = useCallback(() => loadFirst(loaded.current ? "quiet" : "initial"), [loadFirst]);

  return { items, status, error, refreshing, loadingMore, hasMore: page < totalPages, loadFirst, loadOnFocus, loadMore };
};
