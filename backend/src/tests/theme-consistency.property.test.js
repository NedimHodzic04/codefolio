/**
 * Feature: portfolio-customization, Property: Theme CSS matches configured theme names
 *
 * Property: Every valid theme name has a portfolio CSS class with complete color values.
 */

import fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { THEMES } from '../models/user.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const themesCssPath = path.resolve(__dirname, '../../../frontend/src/themes.css');
const themesCss = fs.readFileSync(themesCssPath, 'utf8');

const REQUIRED_CSS_VARS = [
  '--background',
  '--foreground',
  '--primary',
  '--secondary',
  '--muted',
  '--border',
];

const themeClassPattern = /\.theme-([a-z]+)\s*\{([^}]+)\}/g;

function parseThemeBlocks(css) {
  const blocks = new Map();
  let match = themeClassPattern.exec(css);

  while (match) {
    blocks.set(match[1], match[2]);
    match = themeClassPattern.exec(css);
  }

  return blocks;
}

const themeBlocks = parseThemeBlocks(themesCss);

function getPortfolioThemeClass(themeName) {
  const normalized = themeName || 'light';
  return `theme-${normalized}`;
}

const runPropertyTest = async () => {
  console.log('Starting Property Test: Theme CSS matches configured theme names\n');

  try {
    console.log('Testing: Every configured theme has a CSS class block...');
    await fc.assert(
      fc.property(fc.constantFrom(...THEMES), (themeName) => {
        if (!themeBlocks.has(themeName)) {
          throw new Error(`Missing CSS block for theme "${themeName}"`);
        }
        return true;
      }),
      { numRuns: THEMES.length },
    );
    console.log(`✓ All ${THEMES.length} configured themes have CSS blocks`);

    console.log('\nTesting: Each theme defines required CSS variables as complete colors...');
    await fc.assert(
      fc.property(fc.constantFrom(...THEMES), (themeName) => {
        const block = themeBlocks.get(themeName);

        for (const cssVar of REQUIRED_CSS_VARS) {
          const pattern = new RegExp(`${cssVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*([^;]+);`);
          const match = block.match(pattern);

          if (!match) {
            throw new Error(`Theme "${themeName}" is missing ${cssVar}`);
          }

          const value = match[1].trim();
          const isCompleteColor =
            value.startsWith('hsl(') ||
            value.startsWith('oklch(') ||
            value.startsWith('#') ||
            value.startsWith('rgb(');

          if (!isCompleteColor) {
            throw new Error(
              `Theme "${themeName}" has invalid ${cssVar} value "${value}". ` +
                'Expected a complete CSS color (e.g. hsl(...)).',
            );
          }
        }

        return true;
      }),
      { numRuns: THEMES.length },
    );
    console.log('✓ Each theme defines required CSS variables as complete colors');

    console.log('\nTesting: Portfolio theme class names map to configured themes...');
    await fc.assert(
      fc.property(fc.constantFrom(...THEMES), (themeName) => {
        const themeClass = getPortfolioThemeClass(themeName);
        const expectedClass = `theme-${themeName}`;

        if (themeClass !== expectedClass) {
          throw new Error(`Theme class mismatch for "${themeName}"`);
        }

        if (!themeBlocks.has(themeName)) {
          throw new Error(`Theme class "${themeClass}" has no CSS block`);
        }

        return true;
      }),
      { numRuns: THEMES.length },
    );
    console.log('✓ Portfolio theme class names map to configured themes');

    console.log('\nTesting: Invalid non-empty themes produce unique CSS class names...');
    await fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((name) => !THEMES.includes(name.toLowerCase())),
        (invalidTheme) => {
          const themeClass = getPortfolioThemeClass(invalidTheme);
          if (themeClass !== `theme-${invalidTheme}`) {
            throw new Error(`Unexpected class for invalid theme "${invalidTheme}"`);
          }
          return true;
        },
      ),
      { numRuns: 50 },
    );
    console.log('✓ Invalid non-empty theme names produce predictable class names (50 runs)');

    console.log('\n✓ All theme consistency tests passed!');
  } catch (error) {
    console.error('✗ Property test failed!');
    console.error(error.message);
    throw error;
  }
};

runPropertyTest()
  .then(() => {
    console.log('\nTest completed successfully.');
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
