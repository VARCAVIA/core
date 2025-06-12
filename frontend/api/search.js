// frontend/api/search.js
export default function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  const q = (req.body?.q || "").toLowerCase();
  const DATA = [
    {
      title: "Europe – Wikipedia",
      url: "https://en.wikipedia.org/wiki/Europe",
      snippet:
        "Europe is a continent located entirely in the Northern Hemisphere...",
    },
    {
      title: "European Union | Official Site",
      url: "https://europa.eu",
      snippet:
        "The EU is a unique economic and political union between 27 European countries.",
    },
  ];
  const results = DATA.filter(
    (r) =>
      r.title.toLowerCase().includes(q) || r.snippet.toLowerCase().includes(q),
  );
  res.status(200).json({ results });
}
