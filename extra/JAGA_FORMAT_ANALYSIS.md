
# JAGA Audio Batch Format Analysis

## Overview
This is a **JAGA** (Jagex Audio) container format used by RuneScape for streaming
Ogg Vorbis audio. The format represents a single music track split into multiple
chunks, where only the first chunk contains embedded audio data and subsequent
chunks reference external cache file IDs.

## File Structure

### Container Header (per file)
| Field      | Type   | Value/Description |
|------------|--------|-------------------|
| magic      | string | "4a414741" = "JAGA" in ASCII |
| unk_1      | uint32 | 0 (unknown purpose) |
| unk_2      | uint32 | 3916080 (unknown, possibly duration in samples or ticks) |
| samplefreq | uint32 | 44100 Hz (sample rate) |
| unk_3      | uint32 | 2 (unknown, possibly channels: stereo=2) |
| chunks     | array  | List of audio segments |

### Chunk Structure
| Field   | Type   | Description |
|---------|--------|-------------|
| len     | uint32 | Declared length of this chunk in bytes |
| fileid  | uint32 | Cache file ID reference (0 = embedded data) |
| data    | bytes  | Embedded Ogg Vorbis data (null for external refs) |

## Key Observations

1. **Chunk 0** is the only chunk with embedded data (fileid=0, 91,089 bytes)
2. **Chunks 1-22** reference external cache file IDs (5922-5944) with null data
3. Total declared length across all chunks: ~1,957,064 bytes
4. Actual embedded data: 91,089 bytes (~4.6% of total)
5. The `$fileid` field at the end appears to be `[next_fileid, 0]` = [5945, 0]

## Audio Properties
- **Format**: Ogg Vorbis container
- **Sample Rate**: 44,100 Hz (CD quality)
- **Channels**: Likely stereo (unk_3 = 2)
- **Codec**: Vorbis (signature found at byte 29)
- **Pages**: 22 Ogg pages in the embedded segment

## RuneScape Context
This format aligns with RS3's audio system:
- Pre-RS3: MIDI + custom soundbank (Index 6/14/15)
- RS3-era: Switched to Ogg Vorbis for higher quality music
- The external fileid references suggest this is a **streaming manifest** 
  pointing to cache entries that would be fetched on-demand

## Decoder Notes
- The JSON stores binary data as JavaScript buffer literals: `buffer[]{byte,byte,...}`
- Some entries have "buffer buffer[]" double prefix (parsing artifact)
- Null data fields indicate external cache references, not missing data
