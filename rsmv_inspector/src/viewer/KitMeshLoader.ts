import * as THREE from 'three';
import { ThreejsSceneCache, applyMaterial } from '../3d/modeltothree';
import { defaultMaterial } from '../3d/jmat';
import { MaterialResolver } from './MaterialResolver';

export interface KitMeshData {
  positions: number[];   // Float32, 3 per vertex
  normals: number[];     // Float32, 3 per vertex
  uvs: number[];         // Float32, 2 per vertex
  indices: number[];     // Uint16, flat triples
  submeshes: Array<{
    materialArgument: number; // Texture/material ID from cache
    indexOffset: number;      // Start index in indices array
    indexCount: number;       // Number of indices (triangles * 3)
  }>;
}

export class KitMeshLoader {
  private resolver: MaterialResolver;

  constructor(private sceneCache: ThreejsSceneCache) {
    this.resolver = new MaterialResolver(this.sceneCache.engine.source);
    this.resolver.initialize().catch(console.error);
  }

  public initializeResolver(cachePath: string) {
    // Left as no-op for compatibility
  }

  /**
   * Materializes a kit_*.json payload into a shaded THREE.Group.
   */
  public async loadKitMesh(data: KitMeshData): Promise<THREE.Group> {
    const group = new THREE.Group();

    // If indices are empty, they are sequential point-cloud/geometry slices
    let indices = data.indices;
    if (!indices || indices.length === 0) {
      indices = [];
      const vertexCount = data.positions.length / 3;
      for (let i = 0; i < vertexCount; i++) {
        indices.push(i);
      }
    }

    // Positions, Normals, UVs
    const positionsAttr = new THREE.Float32BufferAttribute(data.positions, 3);
    
    // Normal & UV checks
    const normalsAttr = data.normals && data.normals.length > 0 
      ? new THREE.Float32BufferAttribute(data.normals, 3) 
      : null;
    const uvsAttr = data.uvs && data.uvs.length > 0 
      ? new THREE.Float32BufferAttribute(data.uvs, 2) 
      : null;

    // Submesh partitioning
    const submeshes = data.submeshes && data.submeshes.length > 0 
      ? data.submeshes 
      : [{ materialArgument: 0, indexOffset: 0, indexCount: indices.length }];

    for (const sub of submeshes) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', positionsAttr);
      
      if (normalsAttr) {
        geo.setAttribute('normal', normalsAttr);
      } else {
        geo.computeVertexNormals();
      }

      if (uvsAttr) {
        geo.setAttribute('uv', uvsAttr);
      }

      // Extract indices for this submesh range
      const subIndices = indices.slice(sub.indexOffset, sub.indexOffset + sub.indexCount);
      geo.setIndex(subIndices);

      const mesh = new THREE.Mesh(geo);
      mesh.name = `submesh_mat_${sub.materialArgument}`;

      try {
        let textureId = sub.materialArgument;
        let brightness = 128;
        let shadow = 128;

        if (this.resolver) {
          const def = await this.resolver.resolve(sub.materialArgument);
          if (def && def.textureId) {
            textureId = def.textureId;
            brightness = def.brightness || 128;
            shadow = def.shadow || 128;
            
            // Spoof the material in the engine cache if it's not already there
            if (!this.sceneCache.engine.materialCache.has(sub.materialArgument)) {
              const spoof = defaultMaterial();
              spoof.textures.diffuse = textureId;
              spoof.texmodes = "repeat";
              spoof.texmodet = "repeat";
              this.sceneCache.engine.materialCache.set(sub.materialArgument, spoof);
              console.log(`[KitMeshLoader] Spoofed material cache for dbrow ${sub.materialArgument} -> texture ${textureId}`);
            }
          }
        }

        // Now sceneCache.getMaterial will find the spoofed material or fall back gracefully
        const parsedMat = await this.sceneCache.getMaterial(sub.materialArgument, false, false);
        applyMaterial(mesh, parsedMat, false, true);
      } catch (err) {
        console.warn(`[KitMeshLoader] Falling back for material arg ${sub.materialArgument}:`, err);
        mesh.material = new THREE.MeshPhongMaterial({
          color: 0x888888,
          side: THREE.DoubleSide,
          flatShading: true
        });
      }

      group.add(mesh);
    }

    return group;
  }
}
