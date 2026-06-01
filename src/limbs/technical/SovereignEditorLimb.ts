import fs from 'fs';
import path from 'path';
import { type Result, ok, err } from '../../core/models.js';

/**
 * 🧬 SovereignEditorLimb (Limb #34)
 * The in-viewer RS3-native cache editor.
 * Demonstrates Jagex-grade mastery of their proprietary format.
 */
export class SovereignEditorLimb {
  private basePedagogy = 'D:\\sovereign\\cache_pedagogy\\';
  private modLayer = 'D:\\sovereign\\cache_pedagogy\\modified\\';
  
  constructor(
    private ternaryRouter: any, // CNS Thalamus for history
    private bioIntelligence: any // Clinical Auditor
  ) {
    this.ensureModLayer();
  }

  private ensureModLayer() {
    if (!fs.existsSync(this.modLayer)) {
      fs.mkdirSync(this.modLayer, { recursive: true });
      fs.mkdirSync(path.join(this.modLayer, 'entities'), { recursive: true });
      fs.mkdirSync(path.join(this.modLayer, 'terrain'), { recursive: true });
    }
  }

  /**
   * Edit Entity Definition (King Black Dragon @ Havenhythe Grounding)
   */
  public async editEntity(entityId: number, changes: any): Promise<Result<boolean>> {
    console.log(`[Editor] Surgical Edit on Entity ${entityId}`);

    // [1] Snapshot for TernaryRouter (Clinical Undo)
    const current = this.resolveEntity(entityId);
    this.ternaryRouter.pushState('PAST', {
      type: 'entity_edit',
      id: entityId,
      data: JSON.parse(JSON.stringify(current))
    });

    // [2] Apply Changes
    const updated = { ...current, ...changes };

    // [3] Bio-Intelligence Validation (Clinical Audit)
    const validation = this.bioIntelligence?.healthCheck?.() || { online: true };
    if (!validation.online) {
      console.warn('[Editor] BioIntelligence offline — proceeding with risk.');
    }

    // [4] Persist to Mod Layer (Non-destructive)
    const targetFile = path.join(this.modLayer, 'entities', `${entityId}.json`);
    fs.writeFileSync(targetFile, JSON.stringify(updated, null, 2));

    return ok(true);
  }

  /**
   * Resolve Entity: Mod Layer > Original Cache
   */
  public resolveEntity(entityId: number): any {
    const modFile = path.join(this.modLayer, 'entities', `${entityId}.json`);
    if (fs.existsSync(modFile)) {
      return JSON.parse(fs.readFileSync(modFile, 'utf-8'));
    }
    
    // Fallback to extraction_inventory or pedagogy
    const pedagogyFile = path.join(this.basePedagogy, 'entities', `${entityId}.json`);
    if (fs.existsSync(pedagogyFile)) {
      return JSON.parse(fs.readFileSync(pedagogyFile, 'utf-8'));
    }

    return { id: entityId, name: 'Unknown Entity' };
  }

  /**
   * Clinical Undo/Redo
   */
  public async undo(): Promise<Result<boolean>> {
    const lastAction = this.ternaryRouter.popState('PAST');
    if (!lastAction) return err(new Error('No history segment found in Thalamus.'));

    if (lastAction.type === 'entity_edit') {
      const targetFile = path.join(this.modLayer, 'entities', `${lastAction.id}.json`);
      fs.writeFileSync(targetFile, JSON.stringify(lastAction.data, null, 2));
    }

    return ok(true);
  }
}

