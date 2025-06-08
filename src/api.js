// src/api.js
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 3000;

// Logging minimal JSON (file + stdout)
function log(event, data = {}) {
  const entry = { ts: new Date().toISOString(), event, ...data };
  fs.appendFile('history/api.log', JSON.stringify(entry) + '\n').catch(() => {});
  console.log(JSON.stringify(entry));
}

// Abilita solo richieste dalla stessa macchina/localhost (CORS minimo)
const corsOptions = {
  origin: [/^http:\/\/localhost/, /^file:\/\//],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Blocca flood: max 10 richieste/sec per IP
let requests = {};
setInterval(() => { requests = {}; }, 1000);
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  requests[ip] = (requests[ip] || 0) + 1;
  if (requests[ip] > 10) {
    log('blocked', { ip, url: req.url });
    return res.status(429).json({ error: "Too Many Requests" });
  }
  next();
});

// Ricerca dati
app.get('/search', async (req, res) => {
  try {
    log('search', { q: req.query.q || '' });
    const idxFile = await fs.readFile('indexed/index.json', 'utf-8');
    let results = JSON.parse(idxFile);

    const q = (req.query.q || '').toLowerCase();
    // Ricerca semplice su più campi
    results = results.filter(d =>
      (!q || JSON.stringify(d).toLowerCase().includes(q))
    );
    // Ordinamento: data discendente, poi rilevanza futura
    results = results.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    res.json(results.slice(0, 20));
  } catch (e) {
    log('error', { error: e.message });
    res.status(500).json({ error: "API error" });
  }
});

app.listen(PORT, () => {
  log('start', { port: PORT });
  console.log(`API running on http://localhost:${PORT}`);
});
