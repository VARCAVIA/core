import { useRef } from "react";
import { useSearch } from "../context/SearchContext";

export default function SearchBar() {
  const inputRef = useRef(null);
  const { performSearch, loading } = useSearch();

  const onSubmit = (e) => {
    e.preventDefault();
    performSearch(inputRef.current.value.trim());
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2 w-full max-w-xl mx-auto">
      <input
        ref={inputRef}
        type="text"
        placeholder="Cerca…"
        className="flex-1 p-3 rounded-xl border outline-none"
        disabled={loading}
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-xl bg-black text-white"
        disabled={loading}
      >
        {loading ? "…" : "Cerca"}
      </button>
    </form>
  );
}
