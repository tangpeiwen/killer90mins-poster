---
name: update-killer90mins-poster
description: Update and visually verify the Killer90mins Adobe Illustrator poster from an event brief while preserving the approved master design. Use when Codex needs to replace the five actors, editable stamped name tags, host badge, date, weekday, time, or ACTOR_05 photo/secret-guest state in Killer90mins .ai files; place transparent PNG portraits using visible-person focal data; calibrate slot-specific name-tag geometry against an approved JPG/PDF; export AI/PNG/PDF outputs; or diagnose whether the Illustrator master supports repeatable automation.
---

# Update Killer90mins Poster

> **状态（2026-08-23）**：模板几何已全面实测，本文若干条目据此更正。
> 权威依据：`docs/specs/2026-08-23-killer90mins-poster-automation-design.md`（含画板/黑板/角度的精确常量、四条摆放规则、L1-L4 分层、发顶的规范定义）。
> 参数化更新器（L3）尚未落地；在它跑通并经 L4 复核之前，本文的工作流部分仍是描述性的。

Update a working copy of the Illustrator master from a structured brief. Preserve all static artwork and treat the designer-approved JPG/PDF—not a successful script message—as the visual source of truth.

## Required inputs

Confirm or locate:

- the editable `.ai` master;
- the approved JPG or PDF reference exported from that master;
- the event brief: date, time, ordered cast, host, and secret-guest mode;
- transparent actor PNG files;
- required editable fonts.

Do not require Illustrator only for reading the brief or auditing files. Require Illustrator when modifying native `.ai` objects or exporting the final artwork.

Read [references/brief-schema.md](references/brief-schema.md) when converting a message or spreadsheet row into structured input. Read [references/template-contract.md](references/template-contract.md) before modifying a new or revised master.

## Workflow

### 1. Protect the master

Open the `.ai` master and immediately work on a named copy. Never overwrite the untouched master during testing. Keep the reference JPG/PDF open for comparison.

Prefer native Illustrator editing over PDF/JPG reconstruction. A PDF preview can omit editable font glyphs and object structure; a JPG contains no editable vectors, clipping paths, or text objects.

### 2. Audit the template

Verify the layers and objects in [references/template-contract.md](references/template-contract.md).

Stop and report a template-contract failure when a required dynamic object is outlined, embedded in a PNG, absent, or locked in a way that cannot be safely changed. Do not fabricate a new layout silently.

Allow documented legacy aliases only for the current test master, such as `PHTOTO` for `ACTOR_03/PHOTO`. Prefer fixing aliases in the master instead of perpetuating them in future scripts.

### 3. Normalize the brief

Map the ordered cast to `ACTOR_01` through `ACTOR_05`. Record the host separately from the display name. Derive `MONTH`, `DAY`, `WEEKDAY`, and `EVENT_TIME` from the supplied date and time.

Require an explicit mode for the fifth slot:

- `PHOTO`: show the actor photo and editable name; hide the silhouette;
- `SECRET_GUEST`: hide the photo mode; show the silhouette, black panel, and secret-guest label.

Resolve actor files by actor ID, not by list position or filename prefix alone.

### 4. Replace portraits without changing frames

Reuse each slot's existing clipping path. Replace only the image object inside `PHOTO`; do not recreate the black panel or frame geometry unless the master lacks a usable photo mode.

Compute placement from the PNG alpha channel, not from visual judgement and not from the transparent canvas centre. Head top = first row where `alpha >= 128` covers at least 0.1% of image height. Head centre X = horizontal centre of the alpha silhouette over the band from head top down 12% of image height. `alpha > 16` is WRONG: it counts 6%-opacity hair strands that render as black and are invisible, misplacing fluffy-haired subjects by ~0.8 mm. Scale proportionally to cover the full clipping mask. Ensure no transparent or black gap appears at the bottom or sides; add controlled bleed beyond the mask when necessary.

Align head centre X to the black-panel centre; measured deviation in the approved master is under 1 mm on four of five slots. Bounding-box centre, pixel centroid, and per-row median all agree within 0.4% of image width, so any of them is acceptable. Keep the subject away from either vertical edge unless the approved reference intentionally crops it.

### 5. Calibrate name tags by slot

Treat each name tag as one transformable unit containing editable text and its white stamped plate/appearance. Preserve its scale and style when changing the name.

Store the approved anchor, angle, safe width, and head-gap target separately for `ACTOR_01` through `ACTOR_05`. Calibrate these values from the approved reference:

- keep the **minimum perpendicular clearance** from the name tag's ink bottom edge to the portrait silhouette at **12 mm ± 1 mm**. Measure it by iterating over integer pixel columns (one sample per column) and taking the minimum; the closest point is NOT at the head centre - it lands at 19%-50% of tag width, differing per slot. The approved master already satisfies this: 11.40 / 11.73 / 12.16 / 12.53 / 12.15 mm;
- keep the tag nearly parallel to the local upper border of its actor slot;
- keep long names, including `CHIN WANG`, inside the slot without losing the white stamped background;
- preserve slot-specific geometry when actors change positions.

Do not apply one global downward offset or one global angle to all five tags: the five top-edge angles are 8.07 / 19.46 / 22.97 / 19.46 / 8.07 degrees.

Tag geometry IS derived from the clipping path, and this is now measured rather than assumed: tag angle equals that slot's panel top-edge angle (error <= 0.11 degrees across all five), and the tag is centred horizontally on the panel (deviation -0.89 / -0.29 / +0.66 / -0.68 / -0.81 mm). The tag position depends only on the template, never on which actor occupies the slot - so it must be frozen once and never moved per job.

After fixing the tag calibration, adjust the portrait inside its mask to meet the calibrated head gap. Do not move the tag and portrait together on every job.

### 6. Update text and state

Set each editable `NAME` to **lowercase**, matching the master (`ian`, `kent`, `chin wang`, `caleb`, `jorge`). The white stamped plate is part of the `La Machine Company` glyphs, NOT a separate object - writing uppercase risks losing it. Verify the uppercase glyphs carry the plate before ever using uppercase.

Chinese names fall back to `Huiwen-MinchoGBK-Regular`, which has no stamped plate at all (see `预览2.jpg`, 凌 浩) and whose ink insets are 1.5x the Latin ones. Chinese names need their own rule or a stamped CJK face.

Show `HOST_BADGE` only on the host slot and preserve its approved placement relative to the host portrait.

Update `MONTH`, `DAY`, `WEEKDAY`, and `EVENT_TIME` as separate objects. Reflow the date group using actual text widths and the master safety boundary. Preserve the weekday period, for example `sat.`.

Do not change static background, KILLER artwork, logo, QR codes, venue line, border, or other locked static content.

### 7. Export and verify

Save a new `.ai` output and export a full-resolution PNG. Export PDF when requested or when a shareable vector preview is useful.

Compare the result with the approved reference at the same useful zoom. Inspect the full poster and actor/date crops at `45%–100%`; do not approve fine alignment at `18.54%`, where a material point adjustment can appear as only a few screen pixels. Follow [references/qa-checklist.md](references/qa-checklist.md).

Do not call the output complete solely because a script finished without an error. Verify that the intended objects actually moved and that the open document is the expected working copy.

If visual QA fails, classify the issue before editing:

- actor metadata problem: correct focal point, visible bounds, or scale;
- slot calibration problem: correct the reusable slot anchor/angle once;
- template-contract problem: ask the designer to repair the master;
- one-off content problem: adjust only the current job and record why.

When a JSX uses idempotency markers, rerunning it will not apply the adjustment again. If a calibration is insufficient, create a new versioned calibration or return to the last approved working copy; do not tell the user to rerun an already-marked patch and do not stack unknown one-off offsets.

### 8. Hand off

Deliver the `.ai` and PNG paths, plus PDF if produced. State any remaining font substitutions, missing links, manual visual judgments, or deviations from the approved master.

## Rules learned from the test scripts

Treat `fix_labels_and_jorge.jsx`, `fix_date_layout.jsx`, `fix_kent_chinwang_position.jsx`, `lower_chinwang_nametag.jsx`, `match_standard_nametags.jsx`, and similar files as diagnostic history. Do not chain them as the production workflow.

Read [references/history-to-rules.md](references/history-to-rules.md) when maintaining or replacing those scripts. Consolidate stable behavior into one parameterized updater and external actor/slot configuration.

## Current limitation

This skill defines the repeatable workflow and data contract but does not yet bundle the final parameterized Illustrator updater. Continue using one versioned working-copy JSX during testing. Add the production updater only after the designer-approved master contract, dual-state fifth slot, editable date objects, and five slot calibrations are stable.
