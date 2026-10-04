import RequireAuth from "../../components/RequireAuth";
import SavedList from "../../features/favorites/SavedList";

export default function FavoritesScreen() {
  return (
    <RequireAuth title="Log in to see your saved apartments">
      <SavedList />
    </RequireAuth>
  );
}
