/**
 * InterfaceParser – POG2‑native replacement for the interface‑specific
 * part of rsmv/opdecoder.js.
 *
 * It builds a parser from the interface definition found in
 * rsmv_inspector/src/opcodes/interfaces.jsonc using the same
 * OpcodeReader that the rest of POG2 already uses.
 */
import { buildParser } from '../../core/OpcodeReader.js';

// Import the JSON schema files as raw objects.
// (tsc must be run with "resolveJsonModule": true, which is already the case in this repo.)
import typeDefs from '../../rsmv_inspector/src/opcodes/typedef.jsonc' with { type: 'json' };
import ifaceDef  from '../../rsmv_inspector/src/opcodes/interfaces.jsonc' with { type: 'json' };

// Build the parser once – it is stateless and thread‑safe.
const ifaceParser = buildParser(null, ifaceDef as any, typeDefs);

/**
 * Parse an interface binary blob.
 *
 * @param state  The parser state object (must contain .buffer, .scan, .endoffset, .args)
 * @returns      The parsed interface interface – exactly the shape the existing
 *               HUDForensicsLimb expects (type, textdata?, spritedata?, modeldata?,
 *               baseposx/y, basewidth/height, hidden, parentid, optmask, cursor,
 *               scripts, menucounts, rightclickopts, rightclickcursors, containerdata, …)
 */
export class InterfaceParser {
    static read(state: any): any {
        return ifaceParser.read(state);
    }
}