// Usage: node render_video.js preview t1 t2 ...   |   node render_video.js full
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), fs = require('fs');
const FPS = 30, url = 'file://' + path.resolve(__dirname, 'src/video.html');
const tmp = process.env.TMPDIR_VID || path.resolve(__dirname, '.frames');
async function page(b) {
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.goto(url); await p.evaluate(() => document.fonts.ready); return p;
}
(async () => {
  const mode = process.argv[2];
  const b = await chromium.launch();
  if (mode === 'preview') {
    const p = await page(b);
    for (const t of process.argv.slice(3)) {
      await p.evaluate(t => window.render(t), Number(t));
      const issues = await p.evaluate(() => { const c = document.getElementById('cap'), box = document.getElementById('caption');
        return box.scrollHeight > box.clientHeight + 1 ? 'CAPTION OVERFLOW' : ''; });
      await p.screenshot({ path: `${tmp}/preview_${t}.png` }); console.log(t, issues);
    }
  } else {
    const total = await (await page(b)).evaluate(() => window.TOTAL);
    const N = Math.round(total * FPS), W = 4, per = Math.ceil(N / W);
    fs.mkdirSync(tmp, { recursive: true });
    await Promise.all([...Array(W).keys()].map(async w => {
      const p = await page(b);
      const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), `${tmp}/seg${w}.mp4`]);
      for (let f = w * per; f < Math.min(N, (w + 1) * per); f++) {
        await p.evaluate(t => window.render(t), f / FPS);
        const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
        if (f % 300 === 0) console.log('frame', f, '/', N);
      }
      ff.stdin.end(); await new Promise(r => ff.on('close', r));
    }));
    fs.writeFileSync(`${tmp}/list.txt`, [0, 1, 2, 3].map(w => `file 'seg${w}.mp4'`).join('\n'));
    const out = path.resolve(__dirname, '../output/benefits_loop_video.mp4');
    await new Promise(r => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${tmp}/list.txt`, '-c', 'copy', '-movflags', '+faststart', out], { stdio: 'inherit' }).on('close', r));
    console.log('done', out);
  }
  await b.close();
})();
