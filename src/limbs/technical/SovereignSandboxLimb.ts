import fs from 'fs';
import path from 'path';
import { resolveSovereignPath } from '../../utils/SovereignPathResolver.js';

/**
 * 🧬 SovereignSandboxLimb
 * The 'Lua-inspired Editor' for POG2 Sandbox Game Nodes.
 * Mirrors the Morrowind MWSE-Lua 'writeGameStateFile' pattern.
 */
export class SovereignSandboxLimb {
  private sandboxPath = resolveSovereignPath('memory/pedagogy/sandbox_synthesis.json');

  constructor() { }

  /**
   * POG2 Editorial: Sculpt the sandbox node.
   * "lua for new creations based on pre existing rs mechanics"
   */
  public async sculpt(command: string): Promise<string> {
    console.log(`[POG2 Sandbox] Sculpting: ${command}`);

    if (!fs.existsSync(this.sandboxPath)) {
      return "Error: Sandbox substrate not found.";
    }

    const manifest = JSON.parse(fs.readFileSync(this.sandboxPath, 'utf-8'));
    const parts = command.split(' ');
    const action = parts[0].toLowerCase();

    switch (action) {
      case 'spawn_npc': {
        const id = parseInt(parts[1]);
        const x = parseInt(parts[2]);
        const z = parseInt(parts[3]);
        manifest.entities.push({
          type: 'npc',
          id: id,
          name: `POG2_NPC_${id}`,
          x: x,
          z: z,
          plane: 0,
          rotation: 0,
          modelIds: [] // rsmv MeshLoader will resolve these from cache at runtime
        });
        break;
      }

      case 'place_object': {
        const id = parseInt(parts[1]);
        const x = parseInt(parts[2]);
        const z = parseInt(parts[3]);
        manifest.entities.push({
          type: 'object',
          id: id,
          name: `POG2_OBJ_${id}`,
          x: x,
          z: z,
          plane: 0,
          rotation: 0,
          locType: 10,
          modelIds: []
        });
        break;
      }

      case 'clear_sandbox': {
        manifest.entities = [];
        break;
      }

      default:
        return `Unknown command: ${action}`;
    }

    // Persistence: Mirroring the MWSE 'state writing'
    fs.writeFileSync(this.sandboxPath, JSON.stringify(manifest, null, 2));
    return `Success: ${action} manifest in Sandbox Hub.`;
  }
}

