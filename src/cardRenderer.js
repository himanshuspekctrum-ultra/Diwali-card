/**
 * Core Node.js Canvas Rendering Engine
 * Spekctrum.com & Partner Brands
 */

const fs = require('fs');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const { TEMPLATES } = require('./config');

// Register system TrueType fonts
const SERIF_FONTS = [
  '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
  '/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
];

const SANS_FONTS = [
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
    if (!cfg || !fs.existsSync(cfg.file)) {
      throw new Error(`Template image not found: ${cfg ? cfg.file : templateId}`);
    }
    imageCache[templateId] = await loadImage(cfg.file);
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

  const addComma = options.addComma !== undefined ? options.addComma : true;
  const displayText = addComma ? ` ${cleanName},` : ` ${cleanName}`;

  // 4. Calculate font family & size
  const chosenFontFamily = (cfg.fontFamily === 'TemplateSerif' && serifRegistered) 
    ? 'TemplateSerif' 
    : (cfg.fontFamily === 'TemplateSansBold' && sansRegistered) 
      ? 'TemplateSansBold' 
      : cfg.fallbackFamily;

  let fontSize = options.fontSize || cfg.fontSize;
  ctx.font = `${cfg.fontWeight} ${fontSize}px ${chosenFontFamily}`;
  ctx.textBaseline = 'alphabetic';

  // Dynamic auto-scaling to prevent overflow
  let textWidth = ctx.measureText(displayText).width;
  while (textWidth > cfg.maxSafeWidth && fontSize > 20) {
    fontSize -= 2;
    ctx.font = `${cfg.fontWeight} ${fontSize}px ${chosenFontFamily}`;
    textWidth = ctx.measureText(displayText).width;
  }

  // 5. Draw text at baseline
  const renderX = cfg.anchorX + (options.xOffset || 0);
  const renderY = cfg.baselineY + (options.yOffset || 0);

  ctx.fillStyle = cfg.textColor;
  ctx.fillText(displayText, renderX, renderY);

  return canvas.encode('jpeg', 98);
}

module.exports = {
  renderCard
};

