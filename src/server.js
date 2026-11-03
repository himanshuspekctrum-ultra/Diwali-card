/**
 * Express HTTP Server
 * Spekctrum.com & Partner Brands
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { TEMPLATES, ROOT_DIR } = require('./config');
const { renderCard } = require('./cardRenderer');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const OUTPUT_DIR = path.join(ROOT_DIR, 'output');

// Helper to resolve files across multiple possible execution locations (Vercel Lambda vs local)
function resolveStaticFile(filename) {
  const candidates = [
    path.join(PUBLIC_DIR, filename),
    path.join(ROOT_DIR, filename),
    path.join(process.cwd(), 'public', filename),
    path.join(process.cwd(), filename),
    path.join(__dirname, '..', 'public', filename),
    path.join(__dirname, '..', filename)
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static directories if present
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
  app.use('/public', express.static(PUBLIC_DIR));
}
if (fs.existsSync(ROOT_DIR)) {
  app.use(express.static(ROOT_DIR));
}

// Explicit root routes for guaranteed index.html delivery
app.get(['/', '/index.html', '/public', '/public/index.html'], (req, res) => {
  const file = resolveStaticFile('index.html');
  if (file) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.sendFile(file);
  }
  res.status(404).send('index.html not found');
});

// Explicit assets.js delivery
app.get(['/assets.js', '/public/assets.js'], (req, res) => {
  const file = resolveStaticFile('assets.js');
  if (file) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    return res.sendFile(file);
  }
  res.status(404).send('assets.js not found');
});

// Explicit template image delivery
app.get([
  '/template1_soldier.jpg', '/public/template1_soldier.jpg',
  '/template2_diyas.jpg', '/public/template2_diyas.jpg',
  '/template3_corporate.jpg', '/public/template3_corporate.jpg'
], (req, res) => {
  const basename = path.basename(req.path);
  let file = resolveStaticFile(basename);
  if (!file) {
    file = resolveStaticFile(path.join('assets', 'templates', basename));
  }
  if (file) {
    res.setHeader('Content-Type', 'image/jpeg');
    return res.sendFile(file);
  }
  res.status(404).send('Template image not found');
});

// Health / Config endpoint (supports both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    app: 'Spekctrum Diwali Personalization Engine',
    resolution: '1132x1600',
    templates: Object.keys(TEMPLATES).map(id => ({
      id,
      name: TEMPLATES[id].name,
      key: TEMPLATES[id].key,
      color: TEMPLATES[id].textColor,
      font: TEMPLATES[id].spec
    }))
  });
});

/**
 * GET /api/card or /card
 * Query params: name, template, download, comma
 */
app.get(['/api/card', '/card'], async (req, res) => {
  try {
    const name = (req.query.name || 'Friend').trim();
    const templateId = String(req.query.template || '1');
    const isDownload = req.query.download === 'true' || req.query.download === '1';
    const addComma = req.query.comma !== 'false';

    if (!TEMPLATES[templateId]) {
      return res.status(400).json({ error: `Invalid template ID: ${templateId}. Available: '1', '2', or '3'.` });
    }

    const jpegBuffer = await renderCard(templateId, name, { addComma });
    const cfg = TEMPLATES[templateId];
    const safeName = name.replace(/[^a-zA-Z0-9 _-]/g, '_');
    const filename = `Diwali_Greeting_${safeName}_Template_${templateId}_${cfg.key}.jpg`;

    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Length': jpegBuffer.length,
      'Cache-Control': 'public, max-age=3600'
    });

    if (isDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    }

    res.end(jpegBuffer);
  } catch (err) {
    console.error('API Card Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/batch or /batch
 * JSON Body: { names: string[], template: "1"|"2"|"3"|"all", comma?: boolean }
 */
app.post(['/api/batch', '/batch'], async (req, res) => {
  try {
    const { names, template = 'all', comma = true } = req.body;
    if (!Array.isArray(names) || names.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of names in "names".' });
    }

    const templatesToRun = template === 'all' ? ['1', '2', '3'] : [String(template)];
    const batchDir = path.join(OUTPUT_DIR, `batch_${Date.now()}`);
    try {
      fs.mkdirSync(batchDir, { recursive: true });
    } catch (_) {}

    const results = [];

    for (const rawName of names) {
      const name = String(rawName).trim();
      if (!name) continue;
      const safeName = name.replace(/[^a-zA-Z0-9 _-]/g, '_');

      for (const tId of templatesToRun) {
        const cfg = TEMPLATES[tId];
        if (!cfg) continue;

        const filename = `Diwali_Greeting_${safeName}_Template_${tId}_${cfg.key}.jpg`;
        const filePath = path.join(batchDir, filename);

        const jpegBuffer = await renderCard(tId, name, { addComma: comma });
        try {
          fs.writeFileSync(filePath, jpegBuffer);
        } catch (_) {}

        results.push({
          name,
          templateId: tId,
          filename,
          sizeBytes: jpegBuffer.length
        });
      }
    }

    res.json({
      success: true,
      count: results.length,
      directory: batchDir,
      cards: results
    });
  } catch (err) {
    console.error('Batch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start listening
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🪔 Spekctrum Diwali Personalization Engine (Node.js)`);
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`🖼️  Card API endpoint: http://localhost:${PORT}/api/card?name=Rahul+Sharma&template=1`);
    console.log(`=================================================\n`);
  });
}

module.exports = app;
