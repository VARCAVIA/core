import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Dummy in-memory dataset (titolo, url, snippet).
 * Sostituisci con il vero indice appena disponibile.
 */
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

/* POST /search { q: "query" } → { results: [...] } */
app.post("/search", (req, res) => {
  const q = (req.body.q || "").toLowerCase();
  const results = DATA.filter(
    (r) =>
      r.title.toLowerCase().includes(q) || r.snippet.toLowerCase().includes(q),
  );
  res.json({ results });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Backend ready on http://localhost:${PORT}`),
);
