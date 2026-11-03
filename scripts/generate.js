#!/usr/bin/env node
/**
 * CLI Greeting Card Generator
 * Usage:
 *   node scripts/generate.js --name "Rahul Sharma" --template all
 *   npm run generate -- --name "Pooja Patel" --template 2
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { TEMPLATES, ROOT_DIR } = require('../src/config');
const { renderCard } = require('../src/cardRenderer');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    name: null,
    file: null,
    template: 'all',
    outdir: path.join(ROOT_DIR, 'output'),
    addComma: true
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--name' && args[i + 1]) {
      options.name = args[++i];
    } else if (arg === '--file' && args[i + 1]) {
      options.file = args[++i];
    } else if (arg === '--template' && args[i + 1]) {
      options.template = args[++i];
    } else if (arg === '--outdir' && args[i + 1]) {
      options.outdir = path.resolve(args[++i]);
    } else if (arg === '--no-comma') {
      options.addComma = false;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Diwali Greeting Card Generator CLI (Node.js)
Spekctrum.com & Partner Brands

Usage:
  node scripts/generate.js [options]

Options:
  --name <string>        Recipient name (e.g. "Rahul Sharma")
  --file <filepath>      Path to text or CSV file with names (one per line)
  --template <1|2|3|all> Template ID to generate (default: all)
  --outdir <dirpath>     Output directory (default: ./output)
  --no-comma             Do not append trailing comma after name
  -h, --help             Show this help message

Examples:
  node scripts/generate.js --name "Rahul Sharma"
  node scripts/generate.js --name "Pooja Patel" --template 2
  node scripts/generate.js --file employees.txt --template all --outdir finalized
`);
}

async function promptName() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question('Enter recipient name: ', answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const options = parseArgs();
  const names = [];

  if (options.name) {
    names.push(options.name);
  } else if (options.file) {
    const filePath = path.resolve(options.file);
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n')
      .map(l => l.trim().replace(/^["',]+|["',]+$/g, ''))
      .filter(l => l.length > 0);
    names.push(...lines);
  } else {
    const inputName = await promptName();
    if (inputName) {
      names.push(inputName);
    } else {
      console.log('No name provided. Exiting.');
      process.exit(0);
    }
  }

  const templatesToRun = options.template === 'all' ? ['1', '2', '3'] : [options.template];
  fs.mkdirSync(options.outdir, { recursive: true });

  console.log(`\n🪔 Generating greeting cards for ${names.length} recipient(s)...`);

  for (const name of names) {
    const safeName = name.replace(/[^a-zA-Z0-9 _-]/g, '_');
    for (const tId of templatesToRun) {
      const cfg = TEMPLATES[tId];
      if (!cfg) {
        console.warn(`Warning: Template ${tId} is invalid. Skipping.`);
        continue;
      }

      const filename = `Diwali_Greeting_${safeName}_Template_${tId}_${cfg.key}.jpg`;
      const outPath = path.join(options.outdir, filename);

      try {
        const jpegBuffer = await renderCard(tId, name, { addComma: options.addComma });
        fs.writeFileSync(outPath, jpegBuffer);
        console.log(`  ✓ Generated [Template ${tId}]: ${filename}`);
      } catch (err) {
        console.error(`  ✗ Error rendering ${name} on template ${tId}:`, err.message);
      }
    }
  }

  console.log(`\n🎉 Done! All cards saved in: ${options.outdir}\n`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

