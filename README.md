# GTA Save Studio v3.1 — GTA IV Compatibility + Search Visibility & Analytics

**New:** Search-friendly pages for all six GTA games, a sitemap, canonical/social metadata, an opt-in Google Analytics 4 integration, and privacy controls. **Start with [`SEO-ANALYTICS-SETUP.md`](SEO-ANALYTICS-SETUP.md)** for GitHub Pages publishing, Google Search Console verification, and statistics setup. Analytics is OFF until you add your public `G-...` measurement ID and a visitor agrees. Save-file content is not transmitted.

---


## GitHub Pages project deployment

This repository includes a portable `index.html` and `404.html` for project URLs such as `https://chrisgenao.github.io/gta-save-studio/`. Use the updated **GITHUB-PAGES.md** guide to publish, diagnose 404 errors, and verify asset URLs. Both branch-root publishing and the included GitHub Actions workflow are supported; no `--base` flag is needed.

# GTA Save Studio · v3.1

A local-first, glassmorphism savegame editor for **Grand Theft Auto III**, **GTA: Vice City**, **GTA: San Andreas**, **GTA IV**, **The Lost and Damned**, and **The Ballad of Gay Tony** (PC saves).

- **Six independent game editors.** The GTA San Andreas overview and editors are exclusively for CJ and San Andreas save data. GTA III, Vice City and GTA IV have their own game-specific screens. Drop any supported save file or use **Import save**: the file is detected by its binary format and routed to its game, regardless of the currently open section.
- **Real binary editing** — not a visual mockup. Money, health, armor, activity stats and supported rewards are modified inside a copy of the save file. On export, a fresh checksum is calculated.
- **Independent, documented schemas** for GTA III, Vice City, San Andreas and GTA IV. Only one save file is open at a time; each editor knows its own valid fields and binary layout.
- **No account, database, external API or uploads.** Save files stay in browser memory. The included Node server only serves static files.
- Full-width glassmorphism design, a working desktop sidebar collapse, mobile slide-out navigation, statistic editors, reward switches, and 8-slot classic export and 12-slot GTA IV export.
- **San Andreas Mission Tracker** with saved-script-counter evidence (✓ passed, ✕ not passed, ? unverified), per-mission prerequisite inspection, and a restricted advanced counter editor.
- Six-girlfriend relationship inspector with story prerequisites; unlock writes deliberately blocked where active state, rewards and keycards are not proven.

## Dashboard & game URLs (updated in v2.6)

The app **always starts on the main dashboard at `/`**, not on an individual game editor. Each game has its own direct URL:

| Page | URL | Game | Icon |
|---|---|---|---|
| Main dashboard | `http://localhost:5173/` | All six campaigns | GTA Save Studio |
| Liberty City editor | `http://localhost:5173/gtaiii` | GTA III (Claude) | Uploaded GTA III logo |
| Vice City editor | `http://localhost:5173/gtavc` | GTA Vice City (Tommy) | Uploaded VC logo |
| San Andreas editor | `http://localhost:5173/gtasa` | GTA San Andreas (CJ) | Uploaded SA logo |
| GTA IV editor | `http://localhost:5173/gtaiv` | GTA IV (Niko) | User-supplied IV logo |
| TLAD editor | `http://localhost:5173/tlad` | The Lost and Damned (Johnny) | Original episode title treatment |
| TBoGT editor | `http://localhost:5173/tbogt` | The Ballad of Gay Tony (Luis) | Original episode title treatment |

The sidebar has **Main Dashboard** first, followed by six expandable game sections with their own logos. Main dashboard cards also link directly to the correct editor. Inside each game, subpages are represented by fragments such as `/gtasa#stats` or `/gtavc#rewards`. Links work when entered directly or refreshed because the included local Node.js server serves the app for all seven routes. Back and Forward navigation work while the app stays open.

You can **import any supported PC save on the dashboard**; it automatically opens the matching game URL. This is a **one-file-at-a-time editor**, not a save library. Switching to another game closes the current save (with a warning if it has pending edits). The main dashboard does not list previously opened files. A browser refresh clears the current file, so export before refreshing. Your original files on disk are never overwritten.

Game logos live in `assets/` and come from the three image files supplied for the project. The app uses no external image or font hosting. GTA IV uses your supplied transparent PNG logo; the classic trilogy also uses your uploaded logos. The two EFLC episodes use the logos provided by the user.



## v3.1: GTA IV PC version compatibility

The importer previously rejected two valid Complete Edition saves with the message `GTA IV checksum mismatch`. GTA IV supports more than one checksum footer layout. This release handles the two verified formats **without disabling checksum validation** and fixes the associated **four-byte statistics alignment difference**.

- Original `SGTA4xx`: 12-byte trailer, legacy stat base `0x6c`, 100% progress, 85 missions passed.
- `SGTA400`: zero-byte trailer, CE stat base `0x68`, ~2.09% progress, 3 missions passed.
- `SGTA412`: zero-byte trailer, CE stat base `0x68`, ~3.49% progress, 5 missions passed.

Both new files import and export successfully. The genuine samples were used only for local tests and are not included in the project ZIP. Read **[GTA-IV-COMPATIBILITY.md](GTA-IV-COMPATIBILITY.md)** for tested layout signatures, supported vs unverified releases, checksum preservation, and regression-test instructions. **Not every possible edition or platform's save is currently supported.**

## v2.6: Episodes from Liberty City

The main dashboard has **six campaign cards**. GTA IV uses the uploaded transparent `IV` logo. TLAD and TBoGT use the **two user-supplied transparent logo images**. These episodes each have dedicated editors and direct routes `/tlad` and `/tbogt`.

**Important distinction:** all three HD-era games use the same `SGTA4xx` PC container. The browser recognizes the save episode from the **UTF-16 title** in its metadata, requiring the `TLAD - ` or `TBoGT - ` title prefix for the respective expansion (per GTAMods). Rename-protection ensures editing a title never silently changes the game's episode identity. A file not carrying either episode prefix is treated as the base GTA IV save. The filename is **not** enough to distinguish the games.

In **TLAD**, the editor recognizes Johnny Klebitz and supports the documented episode-specific stat IDs, including completion stat **133**, Billy/Jim/Terry/Clay relations, gang wars, bike races, seagulls, bike deliveries and other activity records. In **TBoGT**, it recognizes Luis Lopez and supports progress stat **187**, Tony/Yusuf/Mori relationships or progress, drug wars, nightclub jobs, base jumps, cage fights, golf, and episode collectibles. Both also expose documented PlayerInfo money, health, armor, caps and perk flags and export with regenerated checksums. All unrecognized blocks are preserved.

The **GTA IV sample `SGTA4xx` was supplied and tested**; **you have not provided real TLAD or TBoGT examples yet**. Synthetic episode fixtures validate detection, editing, checksum updates, reimport and isolation, but in-game compatibility and episode-specific field layouts need validation with real saves. Before importing, make a backup. Individual mission completions, world pickups and special episode rewards are **not** implemented; changing a counter cannot legitimately complete them.

The GTA IV and episode exports use `SGTA400`–`SGTA411` for manual slots. Autosaves use `SGTA412`, `SGTA413` (TLAD) and `SGTA414` (TBoGT); this editor avoids autosave overwrite by exporting manual slots only.

Format references: [GTA IV save structure](https://gtamods.com/wiki/Saves_(GTA_4)) and [GTA IV / episode stats table](https://gtamods.com/wiki/List_of_statistics_(GTA4)).

## Requirements

- Windows 10/11, macOS or Linux
- Node.js **18 or newer**
- Modern browser (Chrome, Edge, Firefox)
- Supported game save (`*.b` for classic GTA, `SGTA4xx` for GTA IV) from a supported PC version

**No `npm install` or other dependency installation is required.**

## Start (Windows)

1. Extract the ZIP into a folder, e.g. `C:\GTA-Save-Studio`.
2. Double-click **`start-windows.bat`**. Or open a terminal in the folder and run:

   ```powershell
   node --version
   npm start
   ```

3. Open **http://localhost:5173/** in your web browser.

## Start (macOS/Linux)

```bash
cd /path/to/gta-save-studio
npm start
```

Or use `./start-macos-linux.sh`. Visit **http://localhost:5173/**.

To use another port, set the `PORT` environment variable (`$env:PORT=8080` in PowerShell, `PORT=8080 npm start` on macOS/Linux).

## Supported saves

| Game | PC save name | Exact size | Typical Documents folder |
| --- | --- | ---: | --- |
| GTA III | `GTA3sf1.b` – `GTA3sf8.b` | 201,820 bytes (`0x3145C`) | `GTA3 User Files` |
| GTA Vice City | `GTAVCsf1.b` – `GTAVCsf8.b` | 201,828 bytes (`0x31464`) | `GTA Vice City User Files` |
| GTA San Andreas | `GTASAsf1.b` – `GTASAsf8.b` | 202,752 bytes (`0x31800`) | `GTA San Andreas User Files` |
| GTA IV | `SGTA400` – `SGTA411` (plus autosave slots) | Variable; observed 1,977,934 and 1,982,878 bytes | `Rockstar Games/GTA IV/Profiles/<profile>` |

Example on Windows: `C:\Users\<WindowsUser>\Documents\GTA Vice City User Files\GTAVCsf2.b`.

**Definitive Edition, console, mobile, modded/custom layouts and converted/compressed saves are not supported.** GTA IV legacy/GFWL-style and tested Complete Edition-style PC layouts are supported; other builds may have different internal statistics layouts and are deliberately not accepted until verified. Test exports in the corresponding game build. The parser rejects unknown/corrupt/size-mismatched files rather than writing arbitrary offsets. Back up all original saves and try exported files in-game before relying on them.

## Using the editor

1. Make a **backup** of the existing save from the game's User Files directory.
2. Click **Import save**, choose a `.b` file, or drag/drop it onto the website.
3. Start on the **Main Dashboard** at `/`, or navigate directly to `/gtaiii`, `/gtavc`, `/gtasa`, `/gtaiv`, `/tlad`, or `/tbogt`. Choose the matching game accordion in the sidebar. **San Andreas** shows only CJ-specific features, **Liberty City** only GTA III features, and **Vice City** only Tommy's features. Importing a different supported game automatically redirects to its own accordion without storing earlier saves. Open **Overview** to inspect the save title, progress, cash, health, armor and recorded activities.
4. Open **Player Statistics** for game-specific counters. GTA SA has body, vehicle and weapon skill sliders. GTA III and Vice City have health/armor sliders and exact inputs for their documented stats.
5. Open **Side Missions** to change highest levels where stored, or the actual recorded counters otherwise.
6. Use **Mission Tracker** (San Andreas) to inspect mission completion and requirements. Selecting a mission shows the SCM chain evidence. If every supported prerequisite is satisfied, you may explicitly acknowledge and request a **chain-counter-only edit**, but be aware this is **not a genuine full mission completion**; further native mission side effects may be missing. Girlfriend unlock editing is deliberately disabled.
7. Use **Rewards & Perks** to toggle saved bonuses independently of mission history.
8. Open **Collectibles** to change supported counters. GTA SA also supports certain individual tag and stunt-jump records.
9. Use **Stat Inspector** for additional named fields and **Save Settings** to edit the title.
10. Click **Export save**, select a slot (1–8 for classic games, 1–12 for GTA IV), and download the corrected game-specific filename. GTA IV exports as `SGTA400` etc., with no extension. Copy it into the respective User Files folder.

## Per-game editing scope

### GTA III (Claude)

- Player money, health and armor, editable save display title.
- Paramedic highest level; firefighters' fires extinguished, Vigilante criminals killed, taxi passengers dropped off, ambulance patients saved.
- Documented counters and mission totals, jump counters, completion percentage (read-only calculation), hidden-package count.
- Four documented player rewards: infinite sprint, fast reload, free arrest, free health care.
- No fabricated Firefighter or Vigilante *highest-level* values: GTA III exposes counters for those in its save stats, not those exact highest-level fields.

### GTA Vice City (Tommy Vercetti)

- Player money, health and armor, editable save display title.
- Paramedic / Firefighter / Vigilante highest recorded levels, taxi passengers, Pizza Boy counter, stores, rampages, and other named statistics.
- Hidden-package and unique-jump counters, completion percentage (read-only calculation).
- Eight player flags: infinite sprint, fast reload, fireproof, max health, max armor, free arrest, free health care, drive-by ability.

### GTA IV (Niko Bellic) — new in v2.5

- **New dedicated `/gtaiv` dashboard and sidebar accordion** with its own image, game-specific pages, and in-memory save state.
- Imports **real PC `SGTA4xx` saves**, validates the `SAVE` header, declared length, all 32 variable-sized `BLOCK` records, the `END` footer, and the special GTA IV PC checksum.
- Editable PlayerInfo data: **money (and displayed money), health, armor, maximum health, maximum armor**, plus **six independent player perk flags** and the SimpleVars cheat-history flag.
- Editable **mapped GTA IV statistics**, including completion percentage, mission totals, friends' like/respect percentages, taxi fares, missions attempted, crimes, and supported activity counters. Includes tabs with sliders and a searchable inspector.
- Reads the authoritative **stunt-jump world count** from Block 15 (distinct from raw integer stat counters).
- Editable UTF-16 save title; exports `SGTA400`–`SGTA411` while preserving all unknown blocks, existing file length, and the footer. Unchanged exports are byte-for-byte identical.
- Original **user example `SGTA4xx`** was tested locally and parsed as save version **57**, mission title **“Story Complete”**, **100% progress**, cash **$1,207,452**, health **200**, armor **100**, **50 stunt jumps**, and **85 recorded missions passed**. The sample file is **not included in this distributable ZIP**.

**Not yet supported for GTA IV:** safely marking individual story missions as passed, editing individual flying rats / hidden world pickups, friendship ability activation, or all 50 stunt-jump records. Changing a related percentage or numeric stat **does not complete or unlock those events**. Episodes From Liberty City (TLAD/TBoGT) story script modifications are not mapped.

### GTA San Andreas (CJ)

- Existing SA editor remains available: money, health, armor, title, cheat flag, character body/vehicle/weapon skill sliders, five side-mission records and additional activity stats.
- Individual gang-tag and stunt-jump records (in supported layouts); snapshot/horseshoe/oyster counters; 10 reward flags; advanced numeric stat inspection; mission tracking against script globals on supported original PC 1.00 saves; prerequisite inspection and conservative chain-only editing.

## Important limitations

**Recorded statistics are not story-completion flags.** GTA III and Vice City mission progression involves script globals and world state. Their story mission checklists are not yet mapped. Editing highest levels or counts does not necessarily grant rewards.

### Mission Tracker (San Andreas 1.00 Original PC only)

- The editor reads original script-global counters in **Block 1**. See [SDA mission chains](https://kb.speeddemosarchive.com/Grand_Theft_Auto:_San_Andreas/Missions/Chains) and [SDA memory/SCM variable index mappings](https://kb.speeddemosarchive.com/Grand_Theft_Auto:_San_Andreas/Additional_Resources/Memory_Addresses).  Some chains have cutscene steps and unusual values (for example, the Cesar races); those are mapped explicitly.
- A **green checkmark** means a documented saved chain counter has reached that stage. A **red X** means that counter is below the stage. A **gray question mark** means there is no trustworthy completion mapping, the save's SCM structure differs, or the statistic is otherwise ambiguous. The UI never assumes every earlier story branch passed merely because a later save name appears.
- Clicking a mission displays readable prerequisite checks. The limited **advanced chain counter edit** is allowed only when the save uses original PC 1.00, the script globals are well formed, there is no active mission, the exact previous counter value is present and any declared cross-chain conditions are met. Missions whose extra prerequisites are unknown are **blocked**. A backup acknowledgement is required; edits are performed on a copy. Only the **next** stage can be advanced (no jump-to-end).
- **A chain-counter edit is not equivalent to finishing a mission in-game.** It does not execute the SCM mission's completion code, award money, unlock assets, complete school flags, update phone calls or create/remove world objects, and cannot guarantee every game-specific prerequisite. Do **not** treat it as a safe full story skip. For true comprehensive skip support, each mission requires a verified transaction that updates every related script variable, pickup/blip/world state and reward for the exact `main.scm` build, tested with real saves.
- Girlfriend views show known story gates and, when mapped, relationship progress both in SCM globals and statistics. They do **not** infer an active girlfriend or apply unlocks just from story or a relationship score: bitfields, spawn/pickup records, rewards and keycards must also be verified. Editing these relationship/unlock flags is currently **blocked**.
- For modded, alternative script, Steam or Definitive Edition saves, mission/global offsets may differ. The editor refuses unknown variants rather than guessing. Synthetic unit tests validate the byte edits; they do not establish in-game side effect compatibility.


**Collectible counters are not the same as individual world pickup records.** Changing hidden-package or jump counts does not guarantee the pickups vanish or the in-game unlock triggers. This is clearly labeled beside the affected controls.

**The included automated tests use structurally valid synthetic fixtures.** Manual read/write/export/re-import checks were additionally performed with supplied original GTA III and VC PC save files. No game executable was used to verify in-game effects. Files with unexpected internal layouts are refused.

## Tests and deployment

Run tests:

```bash
npm test
```

The tests cover legacy and Complete Edition GTA IV byte layouts, edits and export/import round trips, checksum regeneration, invalid file rejection, duplicate schema fields and sidebar behavior, plus mission-chain evidence, cross-chain prerequisites, unknown/blocked states and girlfriend gate inspection. Mission test fixtures are synthetic; browser-level testing for v2.1 was not available in this build environment.

The website can be hosted as static files: publish `index.html`, `favicon.svg` and the `src/` folder. No server process is needed once those files are served by a web host. `server.mjs` is a simple local development server.

## Format sources

- [GTA III save format – GTAMods](https://gtamods.com/wiki/Saves_(GTA_3))
- [GTA Vice City save format – GTAMods](https://gtamods.com/wiki/Saves_(GTA_VC))
- [GTA San Andreas save format – GTAMods](https://gtamods.com/wiki/Saves_(GTA_SA))
- [GTA III statistic listing – GTAMods](https://gtamods.com/wiki/List_of_statistics_(III))
- [GTA Vice City statistic listing – GTAMods](https://gtamods.com/wiki/List_of_statistics_(VC))

## Version history

- **2.6** — Added the GTA IV logo supplied by the user; TLAD and TBoGT campaign detection, separate statistic schemas, dedicated routes and workspaces, and safeguards to prevent crossing episode save boundaries.

- **2.1** — Added San Andreas mission ✓ / ✕ / ? status via original SCM counters, inspectable prerequisites, guarded and explicitly experimental chain-counter editing, six girlfriend relationship inspectors, and seven mission unit tests. Full story/relationship state editing still requires validated mappings and real-save testing.

- **2.0** — Added GTA III and Vice City codecs, game-specific pages, side-mission stats, packages, rewards, detection, slot naming and tests; retained SA features.
- **1.1** — Fixed full-width layout and collapsible desktop/mobile navigation.
- **1.0** — Original San Andreas browser save editor.

## v2.8 — Chronological sidebar and dashboard game order

The sidebar's **Your Games** accordions and the dashboard's game cards now use exactly this order:

1. **GTA III** (`/gtaiii`)
2. **GTA Vice City** (`/gtavc`)
3. **GTA San Andreas** (`/gtasa`)
4. **GTA IV** (`/gtaiv`)
5. **The Lost and Damned** (`/tlad`)
6. **The Ballad of Gay Tony** (`/tbogt`)

The first game is labeled **GTA III**, rather than “GTA: Liberty City,” to distinguish the game's title from its setting. Each workspace, import/export codec and direct URL remains unchanged. The list drives both navigation and dashboard ordering.

## v2.2 — Trilogy accordion navigation and real-world compatibility fixes

The sidebar now contains **three independent collapsible game workspaces **in that historical v2.2 release****:

- **GTA III** (Liberty City, Claude)
- **GTA Vice City** (Tommy Vercetti)
- **GTA San Andreas** (CJ)

Expand any game section to access its game-specific overview, statistics, side mission records, completion overview/tracker, collectibles, rewards and settings. In versions up to 2.9, each save was kept in its own in-memory workspace. **As of v2.10, only one active save is retained in memory**, and there is no per-game loaded indicator. Uploading or dragging a save automatically opens the matching game section. Files must still be backed up; nothing is silently written to disk.

Two supplied PC saves were used for **manual binary integration checks** (the save files are *not* part of this source package). Both had valid checksums and each showed 100% completion. These revealed and helped fix:

1. **GTA III “Write exceeds save subblock”**: the final statistics structure was previously probed incorrectly. The validator now checks documented field extents within each nested block.
2. **GTA VC import rejection**: the provided Vice City save has header `0x00031401` while documentation lists `12609` (`0x00003141`). Both are accepted *only* for a file of the correct Vice City size with all expected blocks and a valid checksum.
3. **GTA VC max health/armor preservation**: these bonus fields are *numeric capacity bytes* (e.g. 100 vs 200), not true/false bytes. Switching them on writes 200; switching them off writes 100. Existing 200-byte values remain unchanged when exporting without edits.
4. **Non-destructive round trips**: unchanged imported saves must export as identical bytes; edited saves are re-imported and checked for all edited fields, block shape and checksum.
5. **Statistics bounds**: expanded the Vice City flight-hours field range to cover large existing values rather than rejecting legitimate uploaded saves.
6. **Sidebar**: added the accordion layout, game-specific color accents and scrolling for smaller windows. The hide-sidebar button remains available.

Run `npm test` to execute the included synthetic regression suite. The source includes no actual player savegames. **In-game loading of modified saves has not been verified here**, so test on a backup and avoid assuming that a progress percentage or achievement counter changes all linked world-state flags.

## v2.3 — San Andreas-only workspace

- **San Andreas Overview is exclusive to GTA SA.** Removed cross-game import tiles and trilogy marketing copy from CJ's page. Its import button and descriptions are specifically for `GTASAsf#.b` saves.
- **Strong save boundaries:** a San Andreas parser object can only be mounted in the San Andreas workspace, and a GTA III or Vice City parser object can only be mounted in its matching game. Unsupported game IDs no longer silently fall back to San Andreas.
- **Autodetect and redirect:** if you select the San Andreas section and import a valid GTA III or Vice City file, the application opens the correct game's accordion instead and shows a message. It never renders a Vice City or GTA III editor inside San Andreas.
- **Separate in-memory editor preferences:** search terms, statistics tabs, mission filters and selected save slot remain with their own game's workspace as you switch sections.
- **Guarded rendering and editing:** SA-specific skill and experimental mission-chain writes are permitted only with an actual San Andreas save active. The non-SA sections continue to use their own documented binary schemas.
- **Verification:** `npm test` runs 31 unit tests including new isolation checks. Unchanged and edited import/export/re-import operations were rechecked using the user's real GTA III and Vice City files, which are not distributed in the package. Browser-level automated verification was unavailable in this runtime; use a backed-up in-game save before relying on exported data.


## GTA IV save notes and technical verification

The GTA IV PC format differs substantially from the classic trilogy: a 0x110-byte metadata header, 32 `BLOCK` records of variable lengths, a checksum, and an `END` footer. The editor preserves unmapped bytes and computes a layout-specific checksum: legacy PC/GFWL-style saves have 12 trailing bytes and need the length adjusted by 12, while the tested Complete Edition-style saves have no trailer and need no adjustment. Block 13 stat offsets also differ. See [GTA-IV-COMPATIBILITY.md](GTA-IV-COMPATIBILITY.md) and [GTAMods — Saves (GTA 4)](https://gtamods.com/wiki/Saves_(GTA_4)). Mapped stat types and IDs reference [GTAMods — List of statistics (GTA4)](https://gtamods.com/wiki/List_of_statistics_(GTA4)).

The included GTA IV codec has been tested against the user-provided genuine `SGTA4xx` (legacy-style), `SGTA400` and `SGTA412` (Complete Edition-style). All three are binary version 57; both checksum formats and differing stat offsets now work. Checks include no-edit byte identity, editing sample fields, checksum validation, reset, and re-import of the modified save. Real in-game load after editing has **not yet been verified**; keep backups, and never assume an edit to a recorded statistic unlocks the corresponding mission or reward.

For GTA IV Complete Edition, save files typically live in `Documents\Rockstar Games\GTA IV\Profiles\<profile>\`. Older releases can store them under `%LocalAppData%\Rockstar Games\GTA IV\savegames\user_...`. The `SGTA4XX` suffix represents the zero-based save slot. Your original file is read only in memory; exporting does not overwrite it.

## v2.6 browser-level verification

All seven routes and the logo assets were tested via the bundled HTTP server and returned HTTP 200. Automated Chromium visual testing could not run in the build environment because the browser executable is not installed. The binary regression suite and server integration checks did pass; real TLAD and TBoGT sample saves have not been supplied, so episode compatibility should be verified on backed-up saves from your own installation.


## v2.8 update

- Replaced the placeholder episode artwork with the supplied official-style logos for **The Lost and Damned** and **The Ballad of Gay Tony**.

## Host on GitHub Pages

The project includes an automatic GitHub Actions deployment workflow. See **[GITHUB-PAGES.md](GITHUB-PAGES.md)** for creating the repository, enabling Pages, URL examples, and uploading via Git.


## v2.9 — Unofficial educational project disclaimer

Every editor page includes a persistent legal footer and an accessible **Read full disclaimer** link. The sidebar also links to `disclaimer.html`, an independent legal-notice page. The page is compatible with local hosting and GitHub Pages both from the branch root and the included GitHub Actions workflow.

**Disclaimer:** GTA Save Studio is an independent, unofficial fan-made project for educational purposes only. It is not affiliated with, sponsored by, or endorsed by Rockstar Games, Rockstar North, Take-Two Interactive, or their related companies or sites. All related trademarks belong to their owners. Back up saves before editing.


## v2.10 — Single-save editing flow

- Homepage and sidebar no longer show workspace loaded counts, file collections, or per-game loaded badges.
- **Choose a save → Edit locally → Download** is the core workflow.
- A single file remains open in the current browser tab while editing. Changing to another game's editor releases it from the app's state; you'll be prompted first if it has pending edits.
- Returning to the homepage does not immediately discard the currently open file. Returning to its game editor in the same tab resumes editing.
- Importing a new file replaces the current file, with a confirmation if you have pending edits.
- The site does **not** send save data to a server or persist it in localStorage, IndexedDB, or any database. Closing/reloading the tab loses the editing session.
