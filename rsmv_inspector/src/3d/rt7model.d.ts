import * as THREE from "three";
import { CacheFileSource } from "../cache";
export type BoneCenter = {
    xsum: number;
    ysum: number;
    zsum: number;
    weightsum: number;
};
export type ModelData = {
    maxy: number;
    miny: number;
    skincount: number;
    bonecount: number;
    meshes: ModelMeshData[];
    debugmeshes?: THREE.Mesh[];
};
export type ModelMeshData = {
    indices: THREE.BufferAttribute;
    vertexstart: number;
    vertexend: number;
    indexLODs: THREE.BufferAttribute[];
    materialId: number;
    hasVertexAlpha: boolean;
    needsNormalBlending: boolean;
    attributes: {
        pos: THREE.BufferAttribute;
        normals?: THREE.BufferAttribute;
        color?: THREE.BufferAttribute;
        texuvs?: THREE.BufferAttribute;
        skinids?: THREE.BufferAttribute;
        skinweights?: THREE.BufferAttribute;
        boneids?: THREE.BufferAttribute;
        boneweights?: THREE.BufferAttribute;
    };
};
export declare function getBoneCenters(model: ModelData): BoneCenter[];
export declare function getModelCenter(model: ModelData): BoneCenter;
export declare function parsePosData(arr: Int16Array): THREE.BufferAttribute;
export declare function addBoneIdBuffer(attributes: ModelMeshData["attributes"], boneidBuffer: Uint16Array): void;
export declare function addUvBuffer(attributes: ModelMeshData["attributes"], vertexCount: number, uvBuffer: Uint16Array | Float32Array): void;
export declare function addNormalsBuffer(attributes: ModelMeshData["attributes"], normalBuffer: Int8Array | Int16Array): void;
export declare function parseOb3Model(modelfile: Buffer, source: CacheFileSource): ModelData;
/**
 * Parses a "Thick" Model Substrate that has already been parsed into a JSON object
 * with materialized TypedArrays.
 */
export declare function parseThickModelData(parsed: any): ModelData;
export declare function makeModelData(meshes: ModelData["meshes"]): ModelData;
