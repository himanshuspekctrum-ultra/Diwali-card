/**
 * Core Node.js Canvas Rendering Engine
 * Spekctrum.com & Partner Brands
 */

const fs = require('fs');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const { TEMPLATES } = require('./config');

// Register TrueType fonts (bundled first for Vercel/serverless portability, fallback to system)
const path = require('path');
const BUNDLED_SERIF = path.join(__dirname, '..', 'assets', 'fonts', 'LiberationSerif-Regular.ttf');
const BUNDLED_SANS = path.join(__dirname, '..', 'assets', 'fonts', 'LiberationSans-Bold.ttf');

const SERIF_FONTS = [
  BUNDLED_SERIF,
  '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
  '/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
];

const SANS_FONTS = [
  BUNDLED_SANS,
  '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  '/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf'
];

let serifRegistered = false;
for (const p of SERIF_FONTS) {
  if (fs.existsSync(p)) {
    GlobalFonts.registerFromPath(p, 'TemplateSerif');
    serifRegistered = true;
    break;
  }
}

let sansRegistered = false;
for (const p of SANS_FONTS) {
  if (fs.existsSync(p)) {
    GlobalFonts.registerFromPath(p, 'TemplateSansBold');
    sansRegistered = true;
    break;
  }
}

// In-memory cache for base template images
const imageCache = {};

async function getTemplateImage(templateId) {
  if (!imageCache[templateId]) {
    const cfg = TEMPLATES[templateId];
    if (!cfg) {
      throw new Error(`Template config not found: ${templateId}`);
    }
    const basename = path.basename(cfg.file);
    const candidates = [
      cfg.file,
      path.join(__dirname, '..', 'assets', 'templates', basename),
      path.join(__dirname, '..', 'public', basename),
      path.join(__dirname, '..', basename),
      path.join(process.cwd(), 'assets', 'templates', basename),
      path.join(process.cwd(), 'public', basename),
      path.join(process.cwd(), basename)
    ];

    let foundPath = null;
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        foundPath = c;
        break;
      }
    }

    if (!foundPath) {
      throw new Error(`Template image not found: ${basename}`);
    }
    imageCache[templateId] = await loadImage(foundPath);
  }
  return imageCache[templateId];
}

/**
 * Render a customized greeting card at 1132 × 1600 px
 * @param {string|number} templateId - '1', '2', or '3'
 * @param {string} name - Recipient name
 * @param {object} options - { addComma, fontSize, xOffset, yOffset }
 * @returns {Promise<Buffer>} - High-definition JPEG Buffer
 */
async function renderCard(templateId, name, options = {}) {
  const idStr = String(templateId);
  const cfg = TEMPLATES[idStr];
  if (!cfg) {
    throw new Error(`Invalid template ID: ${templateId}. Available: '1', '2', or '3'.`);
  }

  const baseImage = await getTemplateImage(idStr);
  const canvas = createCanvas(1132, 1600);
  const ctx = canvas.getContext('2d');

  // 1. Draw background image
  ctx.drawImage(baseImage, 0, 0, 1132, 1600);

  // 2. Comma patch for Template 1 if needed
  if (cfg.maskComma) {
    ctx.fillStyle = cfg.bgColor;
    ctx.fillRect(...cfg.commaRect);
  }

  // 3. Format name text
  const cleanName = (name || '').trim();
  if (!cleanName) {
    return canvas.encode('jpeg', 98);
  }

  const position = (options.position === 'side' || options.position === 'beside') ? 'side' : 'bottom';
  const posCfg = (cfg.positions && cfg.positions[position]) ? cfg.positions[position] : cfg;

  const addComma = options.addComma !== undefined ? options.addComma : true;
  const hasLeadingSpace = posCfg.leadingSpace !== undefined ? posCfg.leadingSpace : (position === 'side');
  const prefix = hasLeadingSpace ? ' ' : '';
  const displayText = addComma ? `${prefix}${cleanName},` : `${prefix}${cleanName}`;

  // 4. Calculate font family & size
  const chosenFontFamily = (cfg.fontFamily === 'TemplateSerif' && serifRegistered) 
    ? 'TemplateSerif' 
    : (cfg.fontFamily === 'TemplateSansBold' && sansRegistered) 
      ? 'TemplateSansBold' 
      : cfg.fallbackFamily;

  let fontSize = options.fontSize || posCfg.fontSize || cfg.fontSize;
  ctx.font = `${cfg.fontWeight} ${fontSize}px ${chosenFontFamily}`;
  ctx.textBaseline = 'alphabetic';

  // Dynamic auto-scaling to prevent overflow
  const maxSafeWidth = posCfg.maxSafeWidth || cfg.maxSafeWidth;
  let textWidth = ctx.measureText(displayText).width;
  while (textWidth > maxSafeWidth && fontSize > 20) {
    fontSize -= 2;
    ctx.font = `${cfg.fontWeight} ${fontSize}px ${chosenFontFamily}`;
    textWidth = ctx.measureText(displayText).width;
  }

  // 5. Draw text at baseline
  const renderX = (options.anchorX !== undefined ? options.anchorX : posCfg.anchorX) + (options.xOffset || 0);
  const renderY = (options.baselineY !== undefined ? options.baselineY : posCfg.baselineY) + (options.yOffset || 0);

  ctx.fillStyle = cfg.textColor;
  ctx.fillText(displayText, renderX, renderY);

  return canvas.encode('jpeg', 98);
}

module.exports = {
  renderCard
};

