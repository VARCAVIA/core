// frontend/src/api/search.js
const API_URL = "http://localhost:4000";   // dev hard-coded

export const search = async (query) => {
  const res = await fetch(`${API_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: query }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();             // { results: [...] }
};
