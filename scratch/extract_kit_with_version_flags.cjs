const path = require('path');
const fs = require('fs');

const inspectorPath = 'C:/Users/krist/Desktop/rsmv';
const sqlitePath = path.join(inspectorPath, 'src/cache/sqlite.ts');
const opdecoderPath = path.join(inspectorPath, 'src/opdecoder.ts');

const { GameCacheLoader } = require(sqlitePath);
const { parse } = require(opdecoderPath);

const CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape';
const KIT_IDS = [12428, 31149, 37641, 420];
const OUT_DIR = 'C:/Users/krist/.gemini/antigravity/scratch/pog2/public/models';

function scoreInteractionFlags(modelId, vertexCount, submeshCount, hasIndices, hasNormals, hasUvs) {
  const flags = [];
  let count = 0;
  if (vertexCount > 0) { flags.push('has_vertices'); count++; }
  if (submeshCount > 1) { flags.push('submeshes_' + submeshCount); count++; }
  if (hasIndices) { flags.push('has_indices'); count++; }
  if (hasNormals) { flags.push('has_normals'); count++; }
  if (hasUvs > 0) { flags.push('has_uvs'); count++; }
  if (modelId === 420) { flags.push('base_model'); count++; }
  if (vertexCount > 500) { flags.push('high_poly'); count++; }
  return { count, flags };
}

async function extractModel(cache, modelId) {
  try {
    const buf = await cache.getFile(47, modelId);
    return buf;
  } catch (e) {
    console.error('Model ' + modelId + ' extraction failed:', e.message);
    return null;
  }
}

async function decodeModel(buf, cache, modelId) {
  try {
    const model = parse.models.read(buf, cache, { clientVersion: 1149 });
    return model;
  } catch (e) {
    console.error('Model ' + modelId + ' parsing failed:', e.message);
    return null;
  }
}

function buildKitMesh(model, modelId) {
  const meshdata = model.meshdata || {};
  const positions = Array.from(meshdata.positionBuffer || []);
  const normals = meshdata.normalBuffer ? Array.from(meshdata.normalBuffer) : [];
  const uvs = meshdata.uvBuffer ? Array.from(meshdata.uvBuffer).map((v) => v / 65536.0) : [];
  const renders = meshdata.renders || [];

  const allIndices = [];
  const submeshes = [];

  for (let i = 0; i < renders.length; i++) {
    const render = renders[i];
    if (!render.buf || render.buf.length === 0) continue;
    if (render.isHidden) continue;

    const indices = Array.from(render.buf);
    submeshes.push({ materialArgument: render.materialArgument || 0, indexOffset: allIndices.length, indexCount: indices.length });
    allIndices.push(...indices);
  }

  const interaction = scoreInteractionFlags(modelId, positions.length / 3, submeshes.length, allIndices.length > 0, normals.length > 0, uvs.length);

  return {
    positions,
    normals,
    uvs,
    indices: allIndices,
    submeshes,
    metadata: {
      vertexCount: positions.length / 3,
      faceCount: allIndices.length / 3,
      submeshCount: submeshes.length,
      betaFormat: model.format,
      betaVersion: model.version,
      interactionFlagCount: interaction.count,
      interactionFlags: interaction.flags,
    }
  };
}

async function main() {
  console.log('=== KIT EXTRACTION WITH INTERACTION FLAGS ===\n');
  const cache = new GameCacheLoader(CACHE_PATH);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const timestamp = new Date().toISOString();
  const summary = { timestamp, extracted: [], fullModelId: null, manifest: null };
  let best = null;

  for (const modelId of KIT_IDS) {
    console.log('Processing kit model: ' + modelId + '...');
    const buf = await extractModel(cache, modelId);
    if (!buf) continue;

    const model = await decodeModel(buf, cache, modelId);
    if (!model) continue;

    const kit = buildKitMesh(model, modelId);
    const outPath = path.join(OUT_DIR, 'kit_' + modelId + '.json');
    fs.writeFileSync(outPath, JSON.stringify(kit, null, 2));
    console.log('  -> wrote ' + outPath + ' | vertices=' + kit.metadata.vertexCount + ' faces=' + kit.metadata.faceCount + ' flags=' + kit.metadata.interactionFlagCount);

    const entry = {
      modelId,
      vertexCount: kit.metadata.vertexCount,
      faceCount: kit.metadata.faceCount,
      submeshCount: kit.metadata.submeshCount,
      interactionFlagCount: kit.metadata.interactionFlagCount,
      interactionFlags: kit.metadata.interactionFlags,
    };
    summary.extracted.push(entry);

    if (!best || kit.metadata.interactionFlagCount > best.interactionFlagCount) {
      best = entry;
    }
  }

  summary.fullModelId = best ? best.modelId : null;
  summary.manifest = {
    cachePath: CACHE_PATH,
    extractedAt: timestamp,
    kitIds: KIT_IDS,
    fullModelId: summary.fullModelId,
    fullModelReason: best ? best.interactionFlags : null,
  };

  const manifestPath = path.join(OUT_DIR, 'kit_version_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(summary, null, 2));
  console.log('\nManifest:', manifestPath);
  console.log('Full model with most interaction flags:', summary.fullModelId);

  cache.close && cache.close();
}

main().catch(console.error);
