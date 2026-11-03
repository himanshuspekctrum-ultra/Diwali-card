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
    textColor: '#8A3638',          // Crimson maroon: RGB(138, 54, 56)
    bgColor: '#FBF3E8',            // Antique cream background
    maskComma: true,
    commaRect: [266, 532, 8, 14],  // [x, y, w, h] to cover baked-in comma
    positions: {
      bottom: {
        anchorX: 184,              // Left-aligned flush with 'Dear'
        baselineY: 578,            // Positioned below 'Dear'
        fontSize: 38,
        maxSafeWidth: 720,
        leadingSpace: false
      },
      side: {
        anchorX: 268,              // Beside 'Dear'
        baselineY: 543,
        fontSize: 42,
        maxSafeWidth: 680,
        leadingSpace: true
      }
    },
    // Defaults for backward compatibility
    anchorX: 184,
    baselineY: 578,
    fontSize: 38,
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
    textColor: '#7A3101',          // Warm bronze: RGB(122, 49, 1)
    bgColor: '#FEEDC1',
    maskComma: false,
    positions: {
      bottom: {
        anchorX: 106,              // Left-aligned flush with 'Dear'
        baselineY: 365,            // Centered in spacious area below 'Dear'
        fontSize: 44,
        maxSafeWidth: 840,
        leadingSpace: false
      },
      side: {
        anchorX: 208,              // Beside 'Dear'
        baselineY: 292,
        fontSize: 44,
        maxSafeWidth: 760,
        leadingSpace: true
      }
    },
    anchorX: 106,
    baselineY: 365,
    fontSize: 44,
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
    textColor: '#7A3101',          // Warm bronze: RGB(122, 49, 1)
    bgColor: '#F3EFE5',
    maskComma: false,
    positions: {
      bottom: {
        anchorX: 129,              // Left-aligned flush with 'Dear'
        baselineY: 205,            // Centered in spacious area below 'Dear'
        fontSize: 44,
        maxSafeWidth: 820,
        leadingSpace: false
      },
      side: {
        anchorX: 230,              // Beside 'Dear'
        baselineY: 131,
        fontSize: 44,
        maxSafeWidth: 530,         // Safe distance before Spekctrum logo at x=780
        leadingSpace: true
      }
    },
    anchorX: 129,
    baselineY: 205,
    fontSize: 44,
    maxSafeWidth: 820,
    spec: 'Template 3: Poppins Bold (#7A3101)'
  }
};

module.exports = {
  ROOT_DIR,
  TEMPLATES_DIR,
  TEMPLATES
};
