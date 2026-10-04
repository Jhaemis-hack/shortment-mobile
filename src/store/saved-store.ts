import { create } from "zustand";
import { getSaved, saveListing, unsaveListing } from "../services";
import { getErrorMessage } from "../services/http";
import { toast } from "../lib/toast";

interface SavedState {
  /** Listing ids the signed-in guest has saved; null until loaded. */
  ids: ReadonlySet<string> | null;
  load: () => Promise<void>;
  toggle: (listingId: string) => Promise<void>;
  reset: () => void;
}

const withId = (ids: ReadonlySet<string> | null, id: string, present: boolean) => {
  const next = new Set(ids ?? []);
  if (present) next.add(id);
  else next.delete(id);
  return next;
};

export const useSavedStore = create<SavedState>()((set, get) => ({
  ids: null,
  load: async () => {
    try {
      const page = await getSaved(1, 50);
      set({ ids: new Set(page.items.map(item => item.id)) });
    } catch {
      // Hearts just show as unsaved; the Saved screen surfaces its own errors.
      set({ ids: new Set() });
    }
  },
  toggle: async listingId => {
    const wasSaved = get().ids?.has(listingId) ?? false;
    set(state => ({ ids: withId(state.ids, listingId, !wasSaved) }));
    try {
      if (wasSaved) await unsaveListing(listingId);
      else await saveListing(listingId);
      toast.success(wasSaved ? "Removed from Saved" : "Added to Saved");
    } catch (error) {
      set(state => ({ ids: withId(state.ids, listingId, wasSaved) }));
      toast.error(getErrorMessage(error, "We couldn't update your saved apartments."));
    }
  },
  reset: () => set({ ids: null }),
}));
