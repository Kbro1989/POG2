import pathToFileURL from 'url';

const modulePath = pathToFileURL(process.argv[2]);
const imagePath = process.argv[3];
const maxColors = Number(process.argv[4] || '48');

const run = async () => {
  const mod = await import(modulePath);
  const m = mod && mod.default ? mod.default : mod;
  const inst = typeof m.getInstance === 'function' ? m.getInstance() : m;
  if (!inst || typeof inst.process !== 'function') {
    console.error('Missing .process()');
    process.exit(2);
  }
  const result = await inst.process(imagePath, maxColors);
  const top6 = [...(result.qutritRegions || [])]
    .sort((a, b) => b.pixels.length - a.pixels.length)
    .slice(0, 6)
    .map((r) => ({ regionId: r.id, state: r.qutritState, hex: result.palette[r.colorId]?.hex, px: r.pixels.length }));
  const qDist = (result.qutritRegions || []).reduce((a, r) => {
    a[r.qutritState] = (a[r.qutritState] || 0) + r.pixels.length;
    return a;
  }, {});
  console.log(JSON.stringify({ image: imagePath, w: result.originalWidth, h: result.originalHeight, paletteSize: result.palette.length, regionCount: result.regions.length, qDist, top6 }, null, 2));
};
run().catch((e) => { console.error('Pipeline error:', e?.stack || e); process.exit(1); });
