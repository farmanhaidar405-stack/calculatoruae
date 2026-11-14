// Generates static/assets/rosette.svg: a banknote-style engraved rosette.
import { writeFileSync } from 'node:fs';
const pts = (fn, n = 360) => {
  let d = '';
  for (let i = 0; i <= n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const r = fn(a);
    d += `${i ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
  }
  return `${d}Z`;
};
const outer = pts((a) => 70 + 26 * Math.cos(12 * a));
const mid = pts((a) => 48 + 20 * Math.cos(8 * a));
const inner = pts((a) => 24 + 11 * Math.cos(6 * a));
const uses = (id, count, step) =>
  Array.from({ length: count }, (_, i) => `<use href="#${id}" transform="rotate(${(i * step).toFixed(2)})"/>`).join('');
const rings = [98, 96.5, 30.5, 12, 10.5].map((r) => `<circle r="${r}"/>`).join('');
writeFileSync(
  new URL('../static/assets/rosette.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200" fill="none" stroke="#f2b33d" stroke-width=".28"><defs><path id="a" d="${outer}"/><path id="b" d="${mid}"/><path id="c" d="${inner}"/></defs>${uses('a', 10, 3)}${uses('b', 9, 5)}${uses('c', 8, 7.5)}${rings}</svg>\n`,
);
console.log('rosette.svg written');
