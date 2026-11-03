/**
 * Template Specifications & Calibration Configuration
 * Spekctrum.com & Partner Brands
 */

const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'assets', 'templates');

const TEMPLATES = {
  '1': {
    id: '1',
    key: 'soldier',
    name: 'Tricolour & Soldiers',
    file: path.join(TEMPLATES_DIR, 'template1_soldier.jpg'),
    fontFamily: 'TemplateSerif',
    fallbackFamily: 'serif',
    fontWeight: 'normal',
    fontSize: 38,
    textColor: '#8A3638',          // Crimson maroon: RGB(138, 54, 56)
    bgColor: '#FBF3E8',            // Antique cream background
    anchorX: 184,                  // Left-aligned flush with 'Dear'
    baselineY: 578,                // Positioned below 'Dear'
    maskComma: true,
    commaRect: [266, 532, 8, 14],  // [x, y, w, h] to cover baked-in comma
    maxSafeWidth: 720,
    spec: 'Template 1: Serif Regular (#8A3638)'
  },
  '2': {
    id: '2',
    key: 'diyas',
    name: 'Golden Hanging Diyas',
    file: path.join(TEMPLATES_DIR, 'template2_diyas.jpg'),
    fontFamily: 'TemplateSansBold',
    fallbackFamily: 'sans-serif',
    fontWeight: 'bold',
    fontSize: 44,
    textColor: '#7A3101',          // Warm bronze: RGB(122, 49, 1)
    bgColor: '#FEEDC1',
    anchorX: 106,                  // Left-aligned flush with 'Dear'
    baselineY: 365,                // Centered in spacious area below 'Dear'
    maskComma: false,
    maxSafeWidth: 840,
    spec: 'Template 2: Poppins Bold (#7A3101)'
  },
  '3': {
    id: '3',
    key: 'corporate',
    name: 'Corporate Reflections',
    file: path.join(TEMPLATES_DIR, 'template3_corporate.jpg'),
    fontFamily: 'TemplateSansBold',
    fallbackFamily: 'sans-serif',
    fontWeight: 'bold',
    fontSize: 44,
    textColor: '#7A3101',          // Warm bronze: RGB(122, 49, 1)
    bgColor: '#F3EFE5',
    anchorX: 129,                  // Left-aligned flush with 'Dear'
    baselineY: 205,                // Centered in spacious area below 'Dear'
    maskComma: false,
    maxSafeWidth: 820,
    spec: 'Template 3: Poppins Bold (#7A3101)'
  }
};

module.exports = {
  ROOT_DIR,
  TEMPLATES_DIR,
  TEMPLATES
};

