const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.resolve(__dirname, 'src/infographic.html'));
  await p.evaluate(() => document.fonts.ready);
  const out = path.resolve(__dirname, '../output');
  await p.screenshot({ path: out + '/benefits_loop_infographic.png' });
  await p.pdf({ path: out + '/benefits_loop_infographic.pdf', width: '1080px', height: '1350px', printBackground: true, pageRanges: '1' });
  // overflow / overlap check
  const issues = await p.evaluate(() => {
    const r = [];
    document.querySelectorAll('.card, .panel, .honesty, .footer, h1, .subtitle').forEach(e => {
      if (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1) r.push('overflow: ' + e.className + ' ' + e.textContent.slice(0, 40));
      const b = e.getBoundingClientRect(); if (b.bottom > 1350 || b.right > 1080 || b.left < 0) r.push('offpage: ' + e.textContent.slice(0, 40));
    });
    const boxes = [...document.querySelectorAll('.card, .panel, .honesty, .footer')].map(e => [e, e.getBoundingClientRect()]);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i][1], c = boxes[j][1];
      if (a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom) r.push('overlap: ' + boxes[i][0].textContent.slice(0, 25) + ' | ' + boxes[j][0].textContent.slice(0, 25));
    }
    document.querySelectorAll('.card').forEach(e => { const b = e.getBoundingClientRect(); r.push(`card ${e.dataset.i}: ${Math.round(b.top)}-${Math.round(b.bottom)}`); });
    document.querySelectorAll('.panel > *:last-child').forEach(e => r.push('panel last bottom ' + Math.round(e.getBoundingClientRect().bottom)));
    r.push('footer bottom ' + Math.round(document.querySelector('.footer').getBoundingClientRect().bottom));
    return r;
  });
  console.log(issues.join('\n'));
  await b.close();
})();
