/**
 * CodeExtractor - Extracting pure code from markdown-wrapped LLM responses.
 * 
 * Philosophy: Absolute extraction. No markdown boilerplate in the final substrate.
 */

export function extractCodeBlock(text: string): string | null {
    // Standard markdown code block regex
    const regex = /```(?:\w+)?\s*([\s\S]*?)```/g;
    let match;
    const matches: string[] = [];
    while ((match = regex.exec(text)) !== null) {
        matches.push(match[1]);
    }

    if (matches.length > 0) {
        // Return the first block (usually the primary code)
        return matches[0].trim();
    }

    return null;
}

/**
 * Extracts all code blocks as an array (useful for multi-file generation)
 */
export function extractAllCodeBlocks(text: string): string[] {
    const regex = /```(?:\w+)?\s*([\s\S]*?)```/g;
    let match;
    const matches: string[] = [];
    while ((match = regex.exec(text)) !== null) {
        matches.push(match[1].trim());
    }
    return matches;
}

/**
 * Strips all markdown and returns raw text if no blocks are found
 */
export function ensurePureCode(text: string): string {
    const extract = extractCodeBlock(text);
    return extract || text.trim();
}

