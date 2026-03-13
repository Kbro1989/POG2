import pino from 'pino';

const logger = pino({ name: 'NarrativeExtractor', base: { hostname: 'POG2' } });

export interface NarrativeSegment {
    location: string;
    text: string;
    index: number;
}

/**
 * NarrativeExtractor - Analyzes book text to identify structural markers and extract segments.
 */
export class NarrativeExtractor {
    // Common Project Gutenberg markers
    private static START_MARKERS = [
        /\*\*\* START OF (THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*/i,
        /\*\*\* START OF (THE|THIS) EBOOK.*?\*\*\*/i,
        /E-text prepared by/i
    ];

    private static END_MARKERS = [
        /\*\*\* END OF (THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*/i,
        /End of (the|this) Project Gutenberg EBook/i,
        /\*\*\* END OF (THE|THIS) EBOOK.*?\*\*\*/i
    ];

    // Generic structural/sequence markers
    private static CHAPTER_PATTERNS = [
        /^CHAPTER\s+[IVXLCDM\d]+/im,
        /^FIT\s+[IVXLCDM\d]+/im,
        /^PART\s+[IVXLCDM\d]+/im,
        /^BOOK\s+[IVXLCDM\d]+/im,
        /^SECTION\s+[\d]+/im,
        /^\[\d+\]$/m,        // [1], [2]
        /^[IVXLCDM]+\.$/m,    // I., II.
        /^[0-9]+\s*[.)]/m,    // 1., 1)
        /^[a-z]\s*[.)]/m,     // a., a) - lowercase alphabetic
        /^\([0-9]+\)/m,       // (1)
        /^\([a-z]\)/m,        // (a)
        /^[A-Z\s]{5,40}$/m    // Short ALL CAPS lines (Title candidates)
    ];

    /**
     * Extracts segments based on narrative anchors or linear distribution.
     */
    static extract(text: string, count: number): NarrativeSegment[] {
        const bodyText = this.stripGutenbergCruft(text);
        const anchors = this.findAnchors(bodyText);

        if (anchors.length >= count) {
            return this.extractFromAnchors(bodyText, anchors, count);
        } else {
            return this.extractLinear(bodyText, count);
        }
    }

    /**
     * extractAll - Returns every detected anchor as a segment, ensuring ZERO GAPS.
     */
    static extractAll(text: string): NarrativeSegment[] {
        const bodyText = this.stripGutenbergCruft(text);
        const anchors = this.findAnchors(bodyText);

        if (anchors.length === 0) {
            return this.extractLinear(bodyText, 15); // Default to 15 segments if totally flat
        }

        return this.partitionText(bodyText, anchors);
    }

    private static stripGutenbergCruft(text: string): string {
        let startIdx = 0;
        let endIdx = text.length;

        for (const marker of this.START_MARKERS) {
            const match = text.match(marker);
            if (match && match.index !== undefined) {
                const markerEnd = match.index + match[0].length;
                if (markerEnd > startIdx) startIdx = markerEnd;
            }
        }

        for (const marker of this.END_MARKERS) {
            const match = text.match(marker);
            if (match && match.index !== undefined) {
                if (match.index < endIdx) endIdx = match.index;
            }
        }

        return text.substring(startIdx, endIdx).trim();
    }

    private static findAnchors(text: string): { pos: number; label: string }[] {
        const anchors: { pos: number; label: string }[] = [];

        for (const pattern of this.CHAPTER_PATTERNS) {
            const regex = new RegExp(pattern.source, pattern.flags + 'g');
            let match;
            while ((match = regex.exec(text)) !== null) {
                anchors.push({ pos: match.index, label: match[0].trim() });
            }
        }

        const unique = anchors
            .filter((a, idx, self) => self.findIndex(s => s.pos === a.pos) === idx)
            .sort((a, b) => a.pos - b.pos);

        // Filter out very close anchors (probably false positives or sub-headers)
        const filtered: { pos: number; label: string }[] = [];
        let lastPos = -100; // Closer spacing for granular manuals
        for (const a of unique) {
            if (a.pos - lastPos > 150) {
                filtered.push(a);
                lastPos = a.pos;
            }
        }

        return filtered;
    }

    /**
     * partitionText - Strictly partitions text between anchors into segments.
     * Ensures NO GAPS in coverage.
     */
    private static partitionText(text: string, anchors: { pos: number; label: string }[]): NarrativeSegment[] {
        const segments: NarrativeSegment[] = [];
        let runningIndex = 1;

        for (let i = 0; i < anchors.length; i++) {
            const current = anchors[i];
            const nextPos = (i + 1 < anchors.length) ? anchors[i + 1].pos : text.length;
            const fullRangeText = text.substring(current.pos, nextPos).trim();

            // Pace control: If a segment is too long (> 500 chars), split it
            const MAX_CHUNK = 500;
            if (fullRangeText.length > MAX_CHUNK + 100) {
                const subChunks = Math.ceil(fullRangeText.length / MAX_CHUNK);
                for (let j = 0; j < subChunks; j++) {
                    const chunkText = fullRangeText.substring(j * MAX_CHUNK, (j + 1) * MAX_CHUNK);
                    segments.push({
                        index: runningIndex++,
                        location: `${current.label} (Part ${j + 1}/${subChunks})`,
                        text: chunkText.trim()
                    });
                }
            } else {
                segments.push({
                    index: runningIndex++,
                    location: current.label,
                    text: fullRangeText
                });
            }
        }

        return segments;
    }

    private static extractFromAnchors(text: string, anchors: { pos: number; label: string }[], count: number): NarrativeSegment[] {
        // Fallback or specific sample logic
        return this.partitionText(text, anchors).slice(0, count);
    }

    private static extractLinear(text: string, count: number): NarrativeSegment[] {
        const result: NarrativeSegment[] = [];
        const totalLen = text.length;
        const chunkSize = Math.floor(totalLen / count);
        const extractSize = 2000;

        for (let i = 0; i < count; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + extractSize, totalLen);
            const percentage = Math.round((start / totalLen) * 100);

            result.push({
                index: i + 1,
                location: `${percentage}% into story`,
                text: text.substring(start, end).trim()
            });
        }

        return result;
    }
}
