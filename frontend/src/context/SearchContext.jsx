import React, { createContext, useState, useContext } from "react";
import { search } from "../api/search";

const SearchCtx = createContext();
export const useSearch = () => useContext(SearchCtx);

export const SearchProvider = ({ children }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const data = await search(query);
      setResults(data.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SearchCtx.Provider value={{ results, loading, error, performSearch }}>
      {children}
    </SearchCtx.Provider>
  );
};
