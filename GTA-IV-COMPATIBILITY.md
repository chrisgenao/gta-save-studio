# GTA IV save format compatibility — v3.1

GTA Save Studio is a local browser editor for supported **PC binary** save layouts. It does not upload files to a server. A successful import and checksum round trip does **not** guarantee in-game compatibility across every GTA IV release or after arbitrary stat changes.

## Why previously valid SGTA400 / SGTA412 saves were rejected

The v3.0 codec assumed a legacy GTA IV footer with 12 opaque bytes after the `END\0` marker, and always subtracted 12 from the declared file size when computing the checksum. Real Complete Edition-style saves can end immediately after `END\0`, so the correct adjustment is **zero**. They were incorrectly rejected as "checksum mismatch" even though their checksums were valid.

v3.1 now calculates the checksum based on the *parsed footer length* and preserves that length exactly. The matching stats-block layout is selected using Block 13 size, **not** the file-version dword (both observed layouts use binary version 57).

| Observed binary signature | Footer after `END` | Block 13 data size | Stats offset | Verified with |
|---|---:|---:|---:|---|
| Legacy PC / GFWL-style | 12 bytes | `0x1720` | `0x6C` | `SGTA4xx` (supplied) |
| Complete Edition-style | 0 bytes | `0x1738` | `0x68` | `SGTA400`, `SGTA412` (supplied) |

**Compatibility does not imply conversion.** The exporter preserves the source structure and does not attempt to convert a newer save to an older game executable. The GTA IV 1.2.0.32 and 1.2.0.43 branches have different game compatibility rules even though their save formats are related; see [GTASnP supported GTA IV releases](https://gtasnp.com/help/games/gtaiv). We cannot yet certify the intermediate CE variant independently without a genuine sample.

## Save integrity policy

- A checksum mismatch on a recognized layout is still a hard failure: corrupted files are **not** imported.
- Unmapped block-13 layouts or footer layouts are refused instead of guessing field offsets.
- The imported file is cloned; exports recompute the matching checksum and preserve all unknown bytes, block lengths and trailer bytes.
- Without any edits, export is byte-for-byte identical to the input.
- Edited exports can be re-imported, but still need testing in the exact game version.
- GTA IV, TLAD, and TBoGT share a container, but episode-specific statistics and mission scripts are different. Individual story missions and unverified world state are intentionally not marked complete.

## Verifying a new layout

1. Back up the original GTA save.
2. If this project rejects a save, record the exact error, game and build number (e.g. PC legacy 1.0.8.0 or Complete Edition).
3. Provide a disposable sample save if desired, so its checksum, block sizes, episode identity, stat offsets, and edited export can be independently tested.
4. Add a regression test. Do not add guessed offsets or disable checksum verification to make an import succeed.

### Run tests

```bash
npm test
```

An optional integration test can check actual local player saves without placing those files in the repository:

```bash
# Linux / macOS
GTA4_TEST_SAMPLES_DIR=/path/to/samples node --test tests/gta4-compatibility.test.mjs

# Windows PowerShell
$env:GTA4_TEST_SAMPLES_DIR = 'C:\path\to\saves'
node --test tests/gta4-compatibility.test.mjs
```

The private test directory should contain `SGTA4xx`, `SGTA400` and `SGTA412`, matching the sample progression used in this test. Do not commit those files.
