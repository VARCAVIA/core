export const search = async (query) => {
  const res = await fetch("http://localhost:3000/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: query }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { results: [...] }
};
