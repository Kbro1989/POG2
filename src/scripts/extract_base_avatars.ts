// src/scripts/extract_base_avatars.ts
// Extract base male and female avatars as raw models, then export to GLTF
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { getSovereignRoot, getrsmvSubstratePath, getrsmvCachePath } from '../utils/SovereignPathResolver.js';

const rsmv = getrsmvSubstratePath();
let avatarToModel: any = null;
let writeAvatar: any = null;
let GameCacheLoader: any = null;
let EngineCache: any = null;
let parseOb3Model: any = null;
let buildAttributeBuffer: any = null;

try { ({ avatarToModel, writeAvatar } = require(join(rsmv, 'src', '3d', 'avatar.js'))); } catch (e) { console.error('Failed to load avatar', e); }
try { ({ GameCacheLoader } = require(join(rsmv, 'src', 'cache', 'sqlite.js'))); } catch (e) { console.error('Failed to load cache', e); }
try { ({ EngineCache } = require(join(rsmv, 'src', '3d', 'modeltothree.js'))); } catch (e) { console.error('Failed to load engine cache', e); }
try { ({ parseOb3Model } = require(join(rsmv, 'src', '3d', 'rt7model.js'))); } catch (e) { console.error('Failed to load rt7model', e); }
try { ({ buildAttributeBuffer } = require(join(rsmv, 'src', '3d', 'gltfutil.js'))); } catch (e) { console.error('Failed to load gltfutil', e); }

const OUTPUT_DIR = join(process.cwd(), 'to-do-list-kv-template-123', 'public', 'avatars', 'base');

async function extractBaseAvatar(gender: 'male' | 'female', engineCache: any, cache: any, parse: any) {
    console.log(`\n📦 Extracting Base ${gender.toUpperCase()} Avatar...`);

    const playerkitarch = await engineCache.getArchiveById(2, 3);
    const playerkit = Object.fromEntries(playerkitarch.map((q: any) => [q.fileid, parse.identitykit.read(q.buffer, engineCache.rawsource)]));

    const maleKits = [0, 10, 18, 26, 33, 36, 42];
    const femaleKits = [45, 56, 61, 68, 70, 79];

    const kitsToUse = gender === 'male' ? maleKits : femaleKits;
    const modelIds: number[] = [];

    for (const kitId of kitsToUse) {
        const kit = playerkit[kitId];
        if (kit && kit.models) {
            modelIds.push(...kit.models);
        }
    }

    console.log(`✅ Base ${gender} resolved to ${modelIds.length} raw models.`);
    console.log(`Model IDs:`, modelIds);

    // 3. Export to GLTF using the geometry injection logic
    await exportModelsToGLB(modelIds, `${gender}_base`, cache);
}

async function exportModelsToGLB(modelIds: number[], name: string, cache: any) {
    console.log(`🛠️ Baking ${modelIds.length} geometries into ${name}.glb...`);

    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const gltfPath = join(OUTPUT_DIR, `${name}.gltf`);
    const binPath = join(OUTPUT_DIR, `${name}.bin`);

    // Basic GLTF shell
    const gltf: any = {
        asset: { version: "2.0", generator: "Sovereign Avatar Composition Engine" },
        scene: 0,
        scenes: [{ nodes: [] }],
        nodes: [],
        meshes: [],
        accessors: [],
        bufferViews: [],
        buffers: []
    };

    const allBuffers: Buffer[] = [];
    let bufferOffset = 0;

    for (let i = 0; i < modelIds.length; i++) {
        const modelId = modelIds[i];

        let rawBuffer: Buffer | null = null;
        try { rawBuffer = await cache.getFile(47, modelId); } catch (e) {
            try { rawBuffer = await cache.getFile(52, modelId); } catch (e) { }
        }

        if (!rawBuffer) {
            console.warn(`⚠️ Model ${modelId} not found in cache!`);
            continue;
        }

        const modelData = parseOb3Model(rawBuffer, cache);
        const gltfMesh: any = { name: `part_${modelId}`, primitives: [] };

        for (const mesh of modelData.meshes) {
            const attrSources: any = {
                POSITION: { source: mesh.attributes.pos.array, vecsize: 3, newtype: 'f32' }
            };

            if (mesh.attributes.color) attrSources.COLOR_0 = { source: mesh.attributes.color.array, vecsize: 4, newtype: 'u8' };
            if (mesh.attributes.texuvs) attrSources.TEXCOORD_0 = { source: mesh.attributes.texuvs.array, vecsize: 2, newtype: 'f32' };
            if (mesh.attributes.skinids && mesh.attributes.skinweights) {
                attrSources.JOINTS_0 = { source: mesh.attributes.skinids.array, vecsize: 4, newtype: 'u16' };
                attrSources.WEIGHTS_0 = { source: mesh.attributes.skinweights.array, vecsize: 4, newtype: 'u8' };
            }

            const packed = buildAttributeBuffer(attrSources);
            const packedBuffer = Buffer.from(packed.buffer.buffer, packed.buffer.byteOffset, packed.buffer.byteLength);
            const indicesBuffer = Buffer.from(mesh.indices.array.buffer, mesh.indices.array.byteOffset, mesh.indices.array.byteLength);

            const attrViewIdx = gltf.bufferViews.length;
            gltf.bufferViews.push({
                buffer: 0,
                byteOffset: bufferOffset,
                byteLength: packedBuffer.length,
                byteStride: packed.bytestride,
                target: 34962
            });
            allBuffers.push(packedBuffer);
            bufferOffset += packedBuffer.length;

            const indicesViewIdx = gltf.bufferViews.length;
            gltf.bufferViews.push({
                buffer: 0,
                byteOffset: bufferOffset,
                byteLength: indicesBuffer.length,
                target: 34963
            });
            allBuffers.push(indicesBuffer);
            bufferOffset += indicesBuffer.length;

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

            gltf.accessors.push({
                bufferView: indicesViewIdx,
                byteOffset: 0,
                componentType: 5123,
                count: mesh.indices.count,
                type: 'SCALAR'
            });

            gltfMesh.primitives.push(primitive);
        }
        gltf.meshes.push(gltfMesh);
    }

    gltf.buffers = [{ uri: `${name}.bin`, byteLength: bufferOffset }];
    gltf.nodes = modelIds.map((id: number, idx: number) => ({ name: `Part_${id}`, mesh: idx }));
    gltf.scenes[0].nodes = gltf.nodes.map((_: any, i: number) => i);

    writeFileSync(binPath, Buffer.concat(allBuffers));
    writeFileSync(gltfPath, JSON.stringify(gltf, null, 2));

    console.log(`✅ Base avatar GLTF exported: ${gltfPath}`);
}

let parse: any = null;
try { ({ parse } = require(join(rsmv, 'src', 'opdecoder.js'))); } catch (e) { console.error('Failed to load parse', e); }

async function run() {
    const CACHE_DIR = getrsmvCachePath();
    const cache = new GameCacheLoader(CACHE_DIR);
    cache.buildnr = 940;

    // We instantiate the model cache with the db
    const engineCache = await EngineCache.create(cache);

    await extractBaseAvatar('male', engineCache, cache, parse);
    await extractBaseAvatar('female', engineCache, cache, parse);

    console.log('\n🏁 Avatar extraction sequence complete.');
    cache.close();
}

run().catch(e => console.error(e));
