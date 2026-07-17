# Extra / Items

Bulk item-validation artifacts produced by the hex-error / item-name search pipeline.

## Files

- `pass-61773.hexerr.json` through `pass-61822.hexerr.json` (~61,535 files total).

## Structure

Each file is a JSON batch of item-cache entries that passed validation for a specific hex/name scan pass. Filenames encode the sequential pass number.

## Usage

Used for offline item-cache audits and lookups. Not loaded by the production runtime.
