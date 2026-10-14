import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
const svg = readFileSync('public/favicon.svg', 'utf8').replace('rx="32"', 'rx="0"');
writeFileSync('public/apple-touch-icon.png', new Resvg(svg, { fitTo: { mode: 'width', value: 180 }, font: { loadSystemFonts: true } }).render().asPng());
