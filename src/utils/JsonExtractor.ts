/**
 * JsonExtractor — Parses JSON blocks from LLM markdown responses.
 * Ported from CodeExtractor logic for consistent parsing.
 */

export function extractJson(text: string): string {
    // 1. Try to extract from markdown blocks first
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)```/g;
    let match;
    const blocks: string[] = [];
    while ((match = jsonBlockRegex.exec(text)) !== null) {
        blocks.push(match[1]);
    }

    if (blocks.length > 0) {
        // Return the first block but sanitize it
        return sanitizeJson(blocks[0]);
    }

    // 2. Fallback: Find the most outer-most { } pair
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return sanitizeJson(text.substring(firstBrace, lastBrace + 1));
    }

    // 3. Last resort: just try the whole thing
    return sanitizeJson(text);
}

/**
 * sanitizeJson - Removes comments and fixes common JSON breakage like trailing commas.
 */
function sanitizeJson(json: string): string {
    return json
        .split('\n')
        .map(line => {
            // Remove single-line comments // ... but not within URLs or quoted strings (basic)
            const commentIndex = line.indexOf('//');
            if (commentIndex !== -1) {
                // Check if // is potentially inside a string by looking for odd count of quotes before it
                const before = line.substring(0, commentIndex);
                const quoteCount = (before.match(/"/g) || []).length;
                if (quoteCount % 2 === 0) {
                    return before.trim();
                }
            }
            return line;
        })
        .join('\n')
        // Remove trailing commas before closing braces/brackets
        .replace(/,(\s*[\]}])/g, '$1')
        .trim();
}
