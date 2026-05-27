export interface ProgressionGate {
  name: string;
  minCombatLevel: number;
  requiredQuests: string[];
  requiredItems: number[]; // Item IDs
  requiredSkills: Record<string, number>; // skill → level
  location: { x: number; y: number; plane: number };
}

export const ZUK_GATE: ProgressionGate = {
  name: 'TzKal-Zuk',
  minCombatLevel: 126,
  requiredQuests: ['the_brink_of_extinction', 'the_elder_kiln'],
  requiredItems: [49444], // Igneous stone or equivalent
  requiredSkills: { prayer: 95, herblore: 96, constitution: 99 },
  location: { x: 3200, y: 3200, plane: 0 } // Zuk arena
};

export class ProgressionValidator {
  static canEnter(gate: ProgressionGate, state: any): boolean {
    if (!state) return false;

    // 1. Combat Level check
    const combatLevel = this.calculateCombatLevel(state.skills ?? {});
    if (combatLevel < gate.minCombatLevel) return false;
    
    // 2. Quest stage check
    const quests = state.questStages ?? state.quests?.quests ?? state.quests ?? {};
    for (const quest of gate.requiredQuests) {
      const stage = quests[quest];
      const stageNum = typeof stage === 'object' ? (stage.stage ?? stage.status ?? 0) : (stage ?? 0);
      if (stageNum < 100) return false;
    }
    
    // 3. Item check (Inventory + Bank)
    const inventory = Array.isArray(state.inventory) ? state.inventory : [];
    const bank = Array.isArray(state.bank) ? state.bank : [];
    const inventoryAndBank = [...inventory, ...bank];
    
    for (const itemId of gate.requiredItems) {
      if (!inventoryAndBank.some((i: any) => {
        const id = typeof i === 'object' ? i.id : i;
        return id === itemId;
      })) return false;
    }
    
    // 4. Skill requirements
    for (const [skill, minLevel] of Object.entries(gate.requiredSkills)) {
      if (this.getSkillLevel(state.skills, skill, 1) < minLevel) return false;
    }
    
    return true;
  }

  private static getSkillLevel(skills: any, skillName: string, defaultValue: number): number {
    if (!skills) return defaultValue;
    
    const skillIds: Record<string, number> = {
      attack: 1,
      strength: 2,
      defence: 5,
      ranged: 3,
      magic: 4,
      prayer: 7,
      constitution: 6,
      herblore: 9
    };
    
    const id = skillIds[skillName];
    
    // Check by string key first (e.g. skills.attack)
    let val = skills[skillName];
    if (val !== undefined) {
      return typeof val === 'object' ? (val.level ?? val.base ?? val.current ?? defaultValue) : val;
    }
    
    // Check by numeric ID (e.g. skills[1])
    if (id !== undefined) {
      val = skills[id];
      if (val !== undefined) {
        return typeof val === 'object' ? (val.level ?? val.base ?? val.current ?? defaultValue) : val;
      }
    }
    
    return defaultValue;
  }

  public static calculateCombatLevel(skills: any): number {
    const attack = this.getSkillLevel(skills, 'attack', 1);
    const strength = this.getSkillLevel(skills, 'strength', 1);
    const defence = this.getSkillLevel(skills, 'defence', 1);
    const ranged = this.getSkillLevel(skills, 'ranged', 1);
    const magic = this.getSkillLevel(skills, 'magic', 1);
    const prayer = this.getSkillLevel(skills, 'prayer', 1);
    const constitution = this.getSkillLevel(skills, 'constitution', 10);
    
    const base = 0.25 * (defence + constitution + Math.floor(prayer / 2));
    const melee = 0.325 * (attack + strength);
    const range = 0.325 * (Math.floor(ranged / 2) + ranged);
    const mage = 0.325 * (Math.floor(magic / 2) + magic);
    
    return Math.floor(base + Math.max(melee, range, mage));
  }
}
