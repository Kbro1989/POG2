import { ActionMappingRunner } from "../src/runners/action_mapping";
import { SpecialAbilityRunner } from "../src/runners/special_ability";
import { TriggerParsingRunner } from "../src/runners/trigger_parser";

// Full Mock
const mockOutput = { 
    log: (...args: any[]) => console.log(...args),
    setUI: () => {},
    setState: () => {},
    run: () => {}
} as any;
const fs = require('fs');
const mockFs = { readFileSync: (path: string) => fs.readFileSync(path, 'utf8') } as any;
const mockSource = {} as any;

async function testActionables() {
    const actionRunner = new ActionMappingRunner(mockOutput, mockFs, mockSource);
    const abilityRunner = new SpecialAbilityRunner(mockOutput, mockFs, mockSource);
    const triggerRunner = new TriggerParsingRunner(mockOutput, mockFs, mockSource);
    
    // Chain them: ActionMapping -> SpecialAbility -> TriggerParsing
    actionRunner.setNext(abilityRunner);
    abilityRunner.setNext(triggerRunner);
    
    const tumekensData = { 
        name: "Tumeken's Light", 
        extra: [ 
            { prop: 4333, stringvalue: "Sunfall Slam" }, 
            { prop: 4334, stringvalue: "Slam your target..." },
            { prop: 4330, intvalue: 400 }, 
            { prop: 4332, intvalue: 5 }
        ] 
    };

    console.log('--- Testing Tumeken\'s Light (59350) ---');
    const result = await (actionRunner as any).run({ mappedId: '59350', entityType: 'items', entityData: tumekensData });
    console.log('Final Pipeline Output:', JSON.stringify(result, null, 2));
}

testActionables();
