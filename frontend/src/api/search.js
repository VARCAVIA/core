const API_URL =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:4000"; // fallback

export const search = async (query) => {
  const res = await fetch(`${API_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: query }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
