import { DecodeState, EncodeState } from "../OpcodeReader.js";

export interface ClientscriptObfuscation {
    readOpcode(state: DecodeState): any;
    writeOpCode(state: EncodeState, v: unknown): void;
}

export type ClientScriptOp = {
    opcode: number;
    imm: number;
    imm_obj: number | string | [number, number] | null;
};

