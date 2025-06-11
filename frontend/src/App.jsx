import SearchBar from "./components/SearchBar";
import ResultsGrid from "./components/ResultsGrid";
import { SearchProvider } from "./context/SearchContext";

export default function App() {
  return (
    <SearchProvider>
      <main className="min-h-screen flex flex-col items-center p-8">
        <h1 className="text-3xl font-bold mb-8">Varcavia Search</h1>
        <SearchBar />
        <ResultsGrid />
      </main>
    </SearchProvider>
  );
}
