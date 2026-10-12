// Reports foreground/background pairs in styles.css below WCAG 2 AA (4.5:1 text).
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/renderer/styles.css', import.meta.url), 'utf8');
const vars = Object.fromEntries([...css.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,6})/g)].map((m) => [m[1], m[2]]));
const rgb = (h) => {
  h = h.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const lum = (c) => {
  const [r, g, b] = c.map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(rgb(a)), lum(rgb(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const val = (s) => {
  const v = s.match(/var\(--([\w-]+)\)/);
  if (v) return vars[v[1]];
  const h = s.match(/#[0-9a-fA-F]{3,6}\b/);
  return h ? h[0] : null;
};

let failures = 0;
for (const [, sel, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const c = body.match(/(?<![-\w])color\s*:\s*([^;!}]+)/);
  const fg = c && val(c[1]);
  if (!fg) continue;
  const bg = body.match(/background(?:-color)?\s*:\s*([^;}]+)/);
  const bgv = bg && val(bg[1]);
  // Rules without their own background inherit one: navy inside the sidebar, white/page elsewhere.
  const inherited = /nav-heading|sidebar/.test(sel) ? ['#073249'] : ['#ffffff', '#f2f6f8'];
  for (const b of bgv ? [bgv] : inherited) {
    const r = ratio(fg, b);
    if (r < 4.5) {
      failures++;
      console.log(`${r.toFixed(2)}  ${fg} on ${b}  ${sel.trim().slice(0, 70)}`);
    }
  }
}
console.log(failures ? `${failures} pair(s) below 4.5:1` : 'All checked pairs meet 4.5:1');
process.exit(failures ? 1 : 0);
