// Original flat vector icons. Each returns an SVG <g> string drawn in a 100x100 box.
const C = {
  bg: '#F7F5F0', text: '#2E3338', sub: '#5B636B', teal: '#1F8A8A', tealLight: '#D5ECEA',
  coral: '#E2725B', coralLight: '#F8DDD6', gray: '#9AA1A8', grayLight: '#E4E2DC', line: '#C9C6BE'
};

function person(x, y, s, color) {
  // x,y = top-left of a 40x80 figure, scaled by s
  return `<g transform="translate(${x},${y}) scale(${s})" fill="${color}">
    <circle cx="20" cy="12" r="11"/>
    <path d="M2 74 V44 a18 18 0 0 1 36 0 V74 a4 4 0 0 1 -4 4 H6 a4 4 0 0 1 -4 -4 Z"/>
  </g>`;
}
function family(color, extra = 0, extraColor) {
  // two adults and a child; extra = scale (0..1) of a 4th member (another child)
  let g = person(6, 14, 0.95, color) + person(40, 10, 1.0, color) + person(74, 42, 0.6, color);
  if (extra > 0) {
    const s = 0.6 * extra;
    g += `<g opacity="${Math.min(1, extra * 1.4)}">` + person(100 + (1 - extra) * 12, 42 + (1 - extra) * 24, s, extraColor || color) + '</g>';
  }
  return `<g>${g}</g>`;
}
function house(color) {
  return `<g fill="${color}"><path d="M50 12 L90 46 H80 V88 H20 V46 H10 Z"/>
    <rect x="42" y="60" width="16" height="28" rx="2" fill="${C.bg}"/></g>`;
}
function dollar(color) {
  return `<g><circle cx="50" cy="50" r="40" fill="${color}"/>
    <text x="50" y="66" text-anchor="middle" font-family="Inter" font-weight="800" font-size="48" fill="${C.bg}">$</text></g>`;
}
function building(color) {
  return `<g fill="${color}">
    <path d="M50 8 L92 30 H8 Z"/><rect x="10" y="32" width="80" height="6"/>
    <rect x="16" y="42" width="10" height="36"/><rect x="34" y="42" width="10" height="36"/>
    <rect x="56" y="42" width="10" height="36"/><rect x="74" y="42" width="10" height="36"/>
    <rect x="8" y="80" width="84" height="8"/><rect x="4" y="90" width="92" height="6"/></g>`;
}
function chain(color) {
  return `<g fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round">
    <rect x="8" y="34" width="50" height="32" rx="16" transform="rotate(-30 33 50)"/>
    <rect x="42" y="34" width="50" height="32" rx="16" transform="rotate(-30 67 50)"/></g>`;
}
function paycheck(color, amountScale = 1) {
  return `<g><rect x="6" y="20" width="88" height="60" rx="8" fill="${color}"/>
    <circle cx="28" cy="50" r="13" fill="${C.bg}"/>
    <text x="28" y="57" text-anchor="middle" font-family="Inter" font-weight="800" font-size="20" fill="${color}">$</text>
    <rect x="50" y="36" width="${34 * amountScale}" height="7" rx="3.5" fill="${C.bg}"/>
    <rect x="50" y="52" width="26" height="7" rx="3.5" fill="${C.bg}" opacity="0.7"/></g>`;
}
function wallet(color, fill = 1) {
  // fill 0..1: how many bills remain
  const bills = [0, 1, 2].map(i => {
    const vis = Math.max(0, Math.min(1, fill * 3 - i));
    return `<rect x="${22 + i * 6}" y="${18 + i * 4 - (1 - vis) * 10}" width="54" height="30" rx="4" fill="${C.teal}" opacity="${vis}" stroke="${C.bg}" stroke-width="2"/>`;
  }).join('');
  return `<g>${bills}<rect x="8" y="36" width="84" height="56" rx="10" fill="${color}"/>
    <rect x="64" y="54" width="28" height="20" rx="6" fill="${C.bg}" opacity="0.85"/>
    <circle cx="74" cy="64" r="4" fill="${color}"/></g>`;
}
function icon(name, color, x, y, size, ...args) {
  const f = { family, house, dollar, building, chain, paycheck, wallet }[name];
  return `<g transform="translate(${x},${y}) scale(${size / 100})">${f(color, ...args)}</g>`;
}
if (typeof module !== 'undefined') module.exports = { C, icon, person };
