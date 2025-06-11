import { useSearch } from "../context/SearchContext";

export default function ResultsGrid() {
  const { results, loading, error } = useSearch();

  if (loading) return null;
  if (error) return <p className="text-red-600 mt-6">{error}</p>;
  if (!results.length) return null;

  return (
    <ul className="grid gap-4 mt-6 max-w-4xl mx-auto">
      {results.map((r, i) => (
        <li key={i} className="p-4 rounded-xl shadow">
          <a href={r.url} className="text-lg font-semibold hover:underline">
            {r.title}
          </a>
          <p className="text-sm mt-1">{r.snippet}</p>
        </li>
      ))}
    </ul>
  );
}
