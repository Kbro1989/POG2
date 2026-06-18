import { mkdirSync, rmSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { ToolRegistry } from '../ToolRegistry.js';
import { SkillsLimb } from '../limbs/system/SkillsLimb.js';

const repoRoot = path.resolve(process.cwd());
const skillsRoot = path.join(repoRoot, '.agents', 'skills');
const testSkillDir = path.join(skillsRoot, 'test-foreign-skill');

function computeExpectedProof(skill: {
    name: string;
    description: string;
    instructions: string;
    referenceDocs: string[];
    scripts: string[];
    examples: string[];
    auxiliaryFiles: string[];
    metadata: Record<string, string>;
}): string {
    const sortStrings = (items: string[]): string[] => [...items].sort();
    const sortedMetadata: Record<string, string> = {};
    for (const key of Object.keys(skill.metadata).sort()) {
        sortedMetadata[key] = skill.metadata[key];
    }

    const canonical = {
        name: skill.name,
        description: skill.description,
        instructions: skill.instructions,
        referenceDocs: sortStrings(skill.referenceDocs),
        scripts: sortStrings(skill.scripts),
        examples: sortStrings(skill.examples),
        auxiliaryFiles: sortStrings(skill.auxiliaryFiles),
        metadata: sortedMetadata
    };

    return `sha256:${createHash('sha256').update(JSON.stringify(canonical)).digest('hex')}`;
}

async function main(): Promise<void> {
    if (!existsSync(skillsRoot)) {
        mkdirSync(skillsRoot, { recursive: true });
    }

    if (existsSync(testSkillDir)) {
        rmSync(testSkillDir, { recursive: true, force: true });
    }

    mkdirSync(path.join(testSkillDir, 'reference'), { recursive: true });
    mkdirSync(path.join(testSkillDir, 'scripts'), { recursive: true });
    mkdirSync(path.join(testSkillDir, 'examples'), { recursive: true });

    const skillContent = `---\nname: Test Foreign Skill\ndescription: A test foreign skill for hash verification\nauthor: sovereign-unit-test\n---\n\nThis is a deterministic test skill instruction block.\n`;
    writeFileSync(path.join(testSkillDir, 'SKILL.md'), skillContent, 'utf8');
    writeFileSync(path.join(testSkillDir, 'reference', 'readme.md'), '# Reference\nTest reference doc.', 'utf8');
    writeFileSync(path.join(testSkillDir, 'scripts', 'runner.ts'), 'console.log("runner");', 'utf8');
    writeFileSync(path.join(testSkillDir, 'examples', 'example.txt'), 'example', 'utf8');

    const registry = new ToolRegistry();
    const skillsLimb = new SkillsLimb(registry);
    await skillsLimb.bootstrapLocalSkills();

    const tool = registry.getTool('Test Foreign Skill');
    if (!tool) {
        throw new Error('Test foreign skill was not assimilated into the ToolRegistry.');
    }

    if (!tool.isForeign) {
        throw new Error('Assimilated tool is not marked as foreign.');
    }

    const expectedProof = computeExpectedProof({
        name: 'Test Foreign Skill',
        description: 'A test foreign skill for hash verification',
        instructions: 'This is a deterministic test skill instruction block.',
        referenceDocs: [path.join(testSkillDir, 'reference', 'readme.md')],
        scripts: [path.join(testSkillDir, 'scripts', 'runner.ts')],
        examples: [path.join(testSkillDir, 'examples', 'example.txt')],
        auxiliaryFiles: [],
        metadata: { author: 'sovereign-unit-test' }
    });

    if (tool.proof !== expectedProof) {
        throw new Error(`Proof mismatch. Expected ${expectedProof}, got ${tool.proof}`);
    }

    console.log('✅ Foreign skill ingestion and proof verification passed.');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
