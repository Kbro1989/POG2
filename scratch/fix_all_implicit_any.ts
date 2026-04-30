import fs from 'fs';
import path from 'path';

const errorLog = fs.readFileSync('build_errors_utf8.txt', 'utf8');
const lines = errorLog.split('\n');

const fileFixes: Record<string, { line: number, col: number, name?: string, type: string }[]> = {};

const ts7006Regex = /^(.*?)\((\d+),(\d+)\): error TS7006: Parameter '(.*?)' implicitly has an 'any' type\./;
const ts7017Regex = /^(.*?)\((\d+),(\d+)\): error TS7017: Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature\./;
const ts7053Regex = /^(.*?)\((\d+),(\d+)\): error TS7053: Element implicitly has an 'any' type because expression of type '(.*?)' can't be used to index type '(.*?)'\./;
const ts18046Regex = /^(.*?)\((\d+),(\d+)\): error TS18046: '(.*?)' is of type 'unknown'\./;
const ts2556Regex = /^(.*?)\((\d+),(\d+)\): error TS2556: A spread argument must either have a tuple type or be passed to a rest parameter\./;

lines.forEach(line => {
    let match = line.match(ts7006Regex);
    if (match) {
        const [_, file, lineNum, colNum, name] = match;
        if (!fileFixes[file]) fileFixes[file] = [];
        fileFixes[file].push({ line: parseInt(lineNum), col: parseInt(colNum), name, type: 'TS7006' });
        return;
    }
    match = line.match(ts7017Regex);
    if (match) {
        const [_, file, lineNum, colNum] = match;
        if (!fileFixes[file]) fileFixes[file] = [];
        fileFixes[file].push({ line: parseInt(lineNum), col: parseInt(colNum), type: 'TS7017' });
        return;
    }
    match = line.match(ts7053Regex);
    if (match) {
        const [_, file, lineNum, colNum] = match;
        if (!fileFixes[file]) fileFixes[file] = [];
        fileFixes[file].push({ line: parseInt(lineNum), col: parseInt(colNum), type: 'TS7053' });
        return;
    }
    match = line.match(ts18046Regex);
    if (match) {
        const [_, file, lineNum, colNum, name] = match;
        if (!fileFixes[file]) fileFixes[file] = [];
        fileFixes[file].push({ line: parseInt(lineNum), col: parseInt(colNum), name, type: 'TS18046' });
        return;
    }
    match = line.match(ts2556Regex);
    if (match) {
        const [_, file, lineNum, colNum] = match;
        if (!fileFixes[file]) fileFixes[file] = [];
        fileFixes[file].push({ line: parseInt(lineNum), col: parseInt(colNum), type: 'TS2556' });
        return;
    }
});

Object.entries(fileFixes).forEach(([file, fixes]) => {
    const filePath = path.resolve(file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let contentLines = content.split('\n');

    fixes.sort((a, b) => b.line - a.line || b.col - a.col);

    fixes.forEach(fix => {
        const lineIdx = fix.line - 1;
        const lineContent = contentLines[lineIdx];
        if (!lineContent) return;

        const colIdx = fix.col - 1;
        const prefix = lineContent.substring(0, colIdx);
        const suffix = lineContent.substring(colIdx);

        if (fix.type === 'TS7006') {
            if (suffix.startsWith(fix.name!)) {
                // Wrap in parentheses if it's an arrow function or just naked parameter
                const remaining = suffix.substring(fix.name!.length);
                if (!remaining.trim().startsWith(':')) {
                    // Check if it's already in parentheses
                    if (prefix.trim().endsWith('(') && remaining.trim().startsWith(',')) {
                        contentLines[lineIdx] = prefix + fix.name + ': any' + remaining;
                    } else {
                        contentLines[lineIdx] = prefix + '(' + fix.name + ': any)' + remaining;
                    }
                }
            }
        } else if (fix.type === 'TS18046') {
             if (suffix.startsWith(fix.name!)) {
                contentLines[lineIdx] = prefix + '(' + fix.name + ' as any)' + suffix.substring(fix.name!.length);
            }
        } else if (fix.type === 'TS7017') {
            const globalIdx = prefix.lastIndexOf('globalThis');
            if (globalIdx !== -1) {
                const p1 = prefix.substring(0, globalIdx);
                const p2 = prefix.substring(globalIdx);
                contentLines[lineIdx] = p1 + '(globalThis as any)' + p2.substring('globalThis'.length) + suffix;
            }
        } else if (fix.type === 'TS7053') {
            const bracketIdx = prefix.lastIndexOf('[');
            if (bracketIdx !== -1) {
                const lastSeparator = Math.max(
                    prefix.lastIndexOf(' ', bracketIdx),
                    prefix.lastIndexOf('\t', bracketIdx),
                    prefix.lastIndexOf('.', bracketIdx),
                    prefix.lastIndexOf('(', bracketIdx),
                    prefix.lastIndexOf(',', bracketIdx)
                );
                const objStart = lastSeparator + 1;
                const objName = prefix.substring(objStart, bracketIdx).trim();
                if (objName && objName !== 'any') {
                    const p1 = prefix.substring(0, objStart);
                    const p2 = prefix.substring(objStart, bracketIdx);
                    contentLines[lineIdx] = p1 + '(' + p2 + ' as any)' + prefix.substring(bracketIdx) + suffix;
                }
            }
        } else if (fix.type === 'TS2556') {
            const callIdx = prefix.lastIndexOf('.call');
            if (callIdx !== -1) {
                const lastSeparator = Math.max(
                    prefix.lastIndexOf(' ', callIdx),
                    prefix.lastIndexOf('\t', callIdx),
                    prefix.lastIndexOf('.', callIdx)
                );
                const funcStart = lastSeparator + 1;
                const funcName = prefix.substring(funcStart, callIdx).trim();
                if (funcName) {
                    const p1 = prefix.substring(0, funcStart);
                    const p2 = prefix.substring(funcStart, callIdx);
                    contentLines[lineIdx] = p1 + '(' + p2 + ' as any)' + prefix.substring(callIdx) + suffix;
                }
            }
        }
    });

    fs.writeFileSync(filePath, contentLines.join('\n'));
});
