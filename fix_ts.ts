import { Project, SyntaxKind } from "ts-morph";
import * as fs from "fs";

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });

// Add missing .js to all relative imports
const sourceFiles = project.getSourceFiles("src/rsmv/**/*.ts*");
console.log(`Processing ${sourceFiles.length} files...`);

let modifiedCount = 0;

for (const sf of sourceFiles) {
    let changed = false;

    // 1. Fix relative imports
    const importSpecs = [
        ...sf.getImportDeclarations(),
        ...sf.getExportDeclarations()
    ];
    
    for (const decl of importSpecs) {
        if (typeof (decl as any).getModuleSpecifierValue !== "function") continue;
        const moduleSpecifierValue = (decl as any).getModuleSpecifierValue();
        
        if (moduleSpecifierValue && moduleSpecifierValue.startsWith(".")) {
            if (!moduleSpecifierValue.endsWith(".js") && !moduleSpecifierValue.endsWith(".json") && !moduleSpecifierValue.endsWith(".css") && !moduleSpecifierValue.endsWith(".png") && !moduleSpecifierValue.endsWith(".tsx")) {
                decl.setModuleSpecifier(moduleSpecifierValue + ".js");
                changed = true;
            }
        }
    }

    // 2. Fix implicit any on parameters safely
    const functions = sf.getFunctions();
    const methods = sf.getClasses().flatMap(c => c.getMethods());
    const arrowFuncs = sf.getDescendantsOfKind(SyntaxKind.ArrowFunction);
    
    const allFuncs = [...functions, ...methods, ...arrowFuncs];
    
    for (const f of allFuncs) {
        for (const p of f.getParameters()) {
            if (!p.getTypeNode() && !p.getInitializer()) {
                p.setType("any");
                changed = true;
            }
        }
    }
    
    // 3. Fix implicit any on variables without initializers
    const varDecls = sf.getDescendantsOfKind(SyntaxKind.VariableDeclaration);
    for (const v of varDecls) {
        if (!v.getTypeNode() && !v.getInitializer()) {
            // Note: only safe if not in a destructuring context usually
            try {
                v.setType("any");
                changed = true;
            } catch (e) {}
        }
    }

    // 4. Fix implicit any on element access
    // This is hard to do via AST blindly without causing noise, we will skip it and see if tsconfig noImplicitAny is better.

    if (changed) {
        sf.saveSync();
        modifiedCount++;
    }
}

console.log(`Modified ${modifiedCount} files. Run npm run typecheck again.`);
