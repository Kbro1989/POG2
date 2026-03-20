// src/scripts/inject_kbd_geometry.ts
// Phase 6: Raw Geometry Injection - Jagex Arv47 -> GLTF 2.0

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
// @ts-ignore - Importing from sibling project substrate
import { parseOb3Model } from '../../tmp_rsmv_inspect/src/3d/rt7model.js';
// @ts-ignore
import { buildAttributeBuffer } from '../../tmp_rsmv_inspect/src/3d/gltfutil.js';
// @ts-ignore
import { GameCacheLoader } from '../../tmp_rsmv_inspect/src/cache/sqlite.js';

interface ModelManifest {
  npcId: number;
  modelIds: number[];
  files: {
    models: string[];
  };
}

const ASSET_DIR = join(process.cwd(), 'audit_output', 'kbd_cinema');
const OUTPUT_DIR = join(ASSET_DIR, 'gltf_export');
const MANIFEST_PATH = join(ASSET_DIR, 'manifest.json');
const CACHE_DIR = 'C:\\ProgramData\\Jagex\\RuneScape';

async function executeInjection() {
  console.log('📐 Phase 6: Sovereign Geometry Injection\n');

  // Initialize Cache Loader to satisfy opdecoder requirements
  const cache = new GameCacheLoader(CACHE_DIR) as any;
  cache.buildnr = 940; // Standard RS3 build for current opcodes

  try {
    if (!existsSync(MANIFEST_PATH)) {
      console.error('❌ Manifest not found. Run extraction first.');
      return;
    }

    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as ModelManifest;
    const gltfPath = join(OUTPUT_DIR, 'kbd_sovereign.gltf');
    const binPath = join(OUTPUT_DIR, 'kbd_geometry.bin');

    if (!existsSync(gltfPath)) {
      console.error('❌ GLTF shell not found. Run Phase 5 orchestrator first.');
      return;
    }

    const gltf = JSON.parse(readFileSync(gltfPath, 'utf8'));
    const allBuffers: Buffer[] = [];
    let bufferOffset = 0;

    console.log(`📦 Processing ${manifest.modelIds.length} model parts...`);

    // Clear existing accessors and bufferViews for clean injection
    gltf.accessors = [];
    gltf.bufferViews = [];
    gltf.meshes = [];

    for (let i = 0; i < manifest.modelIds.length; i++) {
        const modelId = manifest.modelIds[i];
        
        try {
            console.log(`  📐 Fetching Model ${modelId} from JS5 Archive 47 (fallback 52)...`);
            
            let rawBuffer: Buffer | null = null;
            try {
                rawBuffer = await cache.getFile(47, modelId);
            } catch (e) {
                console.log(`    ⚠️ Archive 47 failed, attempting Archive 52...`);
                rawBuffer = await cache.getFile(52, modelId);
            }

            if (!rawBuffer) {
                console.error(`    ❌ Model ${modelId} not found in cache.`);
                continue;
            }

            const modelData = parseOb3Model(rawBuffer, cache);
            
            console.log(`    🧬 Part ${modelId}: ${modelData.meshes.length} meshes found (${rawBuffer.length} bytes)`);

            const gltfMesh: any = { name: `part_${modelId}`, primitives: [] };

            for (const mesh of modelData.meshes) {
                const attrSources: any = {
                    POSITION: { source: mesh.attributes.pos.array, vecsize: 3, newtype: 'f32' }
                };

                if (mesh.attributes.color) {
                    attrSources.COLOR_0 = { source: mesh.attributes.color.array, vecsize: 4, newtype: 'u8' };
                }
                if (mesh.attributes.texuvs) {
                    attrSources.TEXCOORD_0 = { source: mesh.attributes.texuvs.array, vecsize: 2, newtype: 'f32' };
                }
                if (mesh.attributes.skinids && mesh.attributes.skinweights) {
                    attrSources.JOINTS_0 = { source: mesh.attributes.skinids.array, vecsize: 4, newtype: 'u16' };
                    attrSources.WEIGHTS_0 = { source: mesh.attributes.skinweights.array, vecsize: 4, newtype: 'u8' };
                }

                const packed = buildAttributeBuffer(attrSources);
                const packedBuffer = Buffer.from(packed.buffer.buffer, packed.buffer.byteOffset, packed.buffer.byteLength);

                // Add Indices
                const indicesBuffer = Buffer.from(mesh.indices.array.buffer, mesh.indices.array.byteOffset, mesh.indices.array.byteLength);
                
                // 1. BufferView for Attributes
                const attrViewIdx = gltf.bufferViews.length;
                gltf.bufferViews.push({
                    buffer: 0,
                    byteOffset: bufferOffset,
                    byteLength: packedBuffer.length,
                    byteStride: packed.bytestride,
                    target: 34962 // ARRAY_BUFFER
                });
                allBuffers.push(packedBuffer);
                bufferOffset += packedBuffer.length;

                // 2. BufferView for Indices
                const indicesViewIdx = gltf.bufferViews.length;
                gltf.bufferViews.push({
                    buffer: 0,
                    byteOffset: bufferOffset,
                    byteLength: indicesBuffer.length,
                    target: 34963 // ELEMENT_ARRAY_BUFFER
                });
                allBuffers.push(indicesBuffer);
                bufferOffset += indicesBuffer.length;

                // 3. Accessors
                const primitive: any = { attributes: {}, indices: gltf.accessors.length + Object.keys(packed.attributes).length };
                
                let accessorIdx = gltf.accessors.length;
                for (const attrName in packed.attributes) {
                    const attr = packed.attributes[attrName];
                    primitive.attributes[attrName] = accessorIdx++;
                    gltf.accessors.push({
                        bufferView: attrViewIdx,
                        byteOffset: attr.byteoffset,
                        componentType: attr.gltype,
                        count: packed.vertexcount,
                        type: attr.veclength === 2 ? 'VEC2' : (attr.veclength === 3 ? 'VEC3' : 'VEC4'),
                        min: attrName === 'POSITION' ? attr.min : undefined,
                        max: attrName === 'POSITION' ? attr.max : undefined,
                        normalized: attrName === 'COLOR_0' || attrName === 'WEIGHTS_0'
                    });
                }

                // Index Accerssor
                gltf.accessors.push({
                    bufferView: indicesViewIdx,
                    byteOffset: 0,
                    componentType: 5123, // UNSIGNED_SHORT
                    count: mesh.indices.count,
                    type: 'SCALAR'
                });

                gltfMesh.primitives.push(primitive);
            }
            gltf.meshes.push(gltfMesh);
        } catch (err) {
            console.error(`  ❌ Error processing part ${modelId}: ${(err as Error).message}`);
        }
    }

    // Update buffers info
    gltf.buffers = [{
        uri: 'kbd_geometry.bin',
        byteLength: bufferOffset
    }];

    // Update nodes to point to new meshes
    gltf.nodes = manifest.modelIds.map((id: number, idx: number) => ({
        name: `KBD_Part_${id}`,
        mesh: idx
    }));
    gltf.scenes[0].nodes = gltf.nodes.map((_: any, i: number) => i);

    // Write files
    writeFileSync(binPath, Buffer.concat(allBuffers));
    writeFileSync(gltfPath, JSON.stringify(gltf, null, 2));

    console.log(`\n🏆 Injection Complete!`);
    console.log(`  💾 Geometry: ${binPath} (${(bufferOffset / 1024).toFixed(2)} KB)`);
    console.log(`  💾 GLTF: ${gltfPath}`);
  } finally {
    cache.close();
  }
}

executeInjection().catch(console.error);
