/**
 * SmartEdit - Resilient file editing engine.
 * Decouples model output from exact whitespace/formatting matches.
 */
export class SmartEdit {
    /**
     * Detects the line ending style of a string.
     */
    static detectLineEnding(content) {
        return content.includes('\r\n') ? '\r\n' : '\n';
    }
    /**
     * Restore trailing newline to modified content if original had it.
     */
    static restoreTrailingNewline(originalContent, modifiedContent) {
        const hadTrailingNewline = originalContent.endsWith('\n');
        if (hadTrailingNewline && !modifiedContent.endsWith('\n')) {
            return modifiedContent + '\n';
        }
        else if (!hadTrailingNewline && modifiedContent.endsWith('\n')) {
            return modifiedContent.replace(/\n$/, '');
        }
        return modifiedContent;
    }
    /**
     * Escapes characters with special meaning in regular expressions.
     */
    static escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    /**
     * Main entry point for calculation.
     */
    static async calculateReplacement(currentContent, params) {
        const { old_string, new_string } = params;
        const normalizedCode = currentContent.replace(/\r\n/g, '\n');
        const normalizedSearch = old_string.replace(/\r\n/g, '\n');
        const normalizedReplace = new_string.replace(/\r\n/g, '\n');
        if (normalizedSearch === '') {
            return { newContent: currentContent, occurrences: 0, strategy: 'none' };
        }
        // 1. Exact Strategy
        const exactResult = this.calculateExactReplacement(normalizedCode, normalizedSearch, normalizedReplace);
        if (exactResult.occurrences > 0) {
            return { ...exactResult, strategy: 'exact' };
        }
        // 2. Flexible Strategy (Trimmed matching)
        const flexibleResult = this.calculateFlexibleReplacement(normalizedCode, normalizedSearch, normalizedReplace);
        if (flexibleResult.occurrences > 0) {
            return { ...flexibleResult, strategy: 'flexible' };
        }
        // 3. Regex Strategy (Tokenized matching)
        const regexResult = this.calculateRegexReplacement(normalizedCode, normalizedSearch, normalizedReplace);
        if (regexResult.occurrences > 0) {
            return { ...regexResult, strategy: 'regex' };
        }
        return { newContent: currentContent, occurrences: 0, strategy: 'none' };
    }
    static calculateExactReplacement(code, search, replace) {
        const occurrences = code.split(search).length - 1;
        if (occurrences > 0) {
            const newContent = code.split(search).join(replace);
            return { newContent, occurrences };
        }
        return { newContent: code, occurrences: 0 };
    }
    static calculateFlexibleReplacement(code, search, replace) {
        const sourceLines = code.match(/.*(?:\n|$)/g)?.slice(0, -1) ?? [];
        const searchLinesStripped = search.split('\n').map(line => line.trim());
        const replaceLines = replace.split('\n');
        let occurrences = 0;
        let i = 0;
        const resultLines = [...sourceLines];
        while (i <= resultLines.length - searchLinesStripped.length) {
            const window = resultLines.slice(i, i + searchLinesStripped.length);
            const windowStripped = window.map(line => line.trim());
            const isMatch = windowStripped.every((line, index) => line === searchLinesStripped[index]);
            if (isMatch) {
                occurrences++;
                const firstLineInMatch = window[0];
                if (firstLineInMatch === undefined) {
                    i++;
                    continue;
                }
                const indentationMatch = firstLineInMatch.match(/^(\s*)/);
                const indentation = indentationMatch ? indentationMatch[1] : '';
                const newBlockWithIndent = replaceLines.map(line => `${indentation}${line}`).join('\n') + '\n';
                resultLines.splice(i, searchLinesStripped.length, newBlockWithIndent);
                i += 1; // Move past the replaced block
            }
            else {
                i++;
            }
        }
        if (occurrences > 0) {
            return { newContent: resultLines.join(''), occurrences };
        }
        return { newContent: code, occurrences: 0 };
    }
    static calculateRegexReplacement(code, search, replace) {
        const delimiters = ['(', ')', ':', '[', ']', '{', '}', '>', '<', '='];
        let processedSearch = search;
        for (const delim of delimiters) {
            processedSearch = processedSearch.split(delim).join(` ${delim} `);
        }
        const tokens = processedSearch.split(/\s+/).filter(Boolean);
        if (tokens.length === 0)
            return { newContent: code, occurrences: 0 };
        const escapedTokens = tokens.map(t => this.escapeRegex(t));
        const patternStr = `^(\\s*)${escapedTokens.join('\\s*')}`;
        const regex = new RegExp(patternStr, 'm');
        const match = regex.exec(code);
        if (!match)
            return { newContent: code, occurrences: 0 };
        const indentation = match[1] || '';
        const newBlockWithIndent = replace.split('\n').map(line => `${indentation}${line}`).join('\n');
        // Replace only first occurrence for regex strategy
        const newContent = code.replace(regex, newBlockWithIndent);
        return { newContent, occurrences: 1 };
    }
}
