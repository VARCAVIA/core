export const search = async (query) => {
  const url = `/api/search`;
  console.log("→ chiamata a", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: query }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
