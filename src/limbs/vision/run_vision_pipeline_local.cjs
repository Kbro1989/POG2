const path = require('path');
const { pathToFileURL } = require('url');
const [,, modulePathArg, imagePathArg, maxColorsArg] = process.argv;
const modulePath = pathToFileURL(modulePathArg).href;
const imagePath = imagePathArg;
const maxColors = Number(maxColorsArg || '48');
const createPromise = () => {
  const { default: mod } = require(modulePathArg);
  const m = mod && mod.default ? mod.default : mod;
  const inst = typeof m.getInstance === 'function' ? m.getInstance() : m;
  if (!inst || typeof inst.process !== 'function') {
    console.error('ImageProcessorLifestub: .process() not found');
    process.exit(2);
  }
  return inst.process(imagePath, maxColors).then((result) => {
    const out = {
      image: imagePath,
      w: result.originalWidth,
      h: result.originalHeight,
      paletteSize: result.palette.length,
      regionCount: result.regions.length,
      qDist: (result.qutritRegions || []).reduce((a, r) => {
        a[r.qutritState] = (a[r.qutritState] || 0) + r.pixels.length;
        return a;
      }, {}),
      top6: (result.qutritRegions || [])
        .slice()
        .sort((a, b) => b.pixels.length - a.pixels.length)
        .slice(0, 6)
        .map((r) => ({
          regionId: r.id,
          state: r.qutritState,
          hex: result.palette[r.colorId] && result.palette[r.colorId].hex,
          px: r.pixels.length,
        })),
    };
    console.log(JSON.stringify(out, null, 2));
  });
};
createPromise().catch((err) => {
  console.error('Pipeline error:', err && err.stack ? err.stack : err);
  process.exit(1);
});
