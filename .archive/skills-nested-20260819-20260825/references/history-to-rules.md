# From test patches to reusable rules

## `audit_ai.jsx`

What it proved:

- Native Illustrator objects can be replaced without rebuilding the whole poster.
- Actor order, names, date, time, host state, and fifth-slot mode need one job-level input.
- Hard-coded absolute paths and object coordinates make the script non-reusable.

Reusable rule: read a job brief and external actor/slot configuration; never encode one cast and date in the updater.

## `fix_chinwang_name.jsx`

What it proved:

- `ACTOR_03` used a different Chinese-name object and lost the English stamped background.

Reusable rule: require the same editable `NAME` construction in every slot. Fix the master instead of duplicating another slot's text object on every run.

## `fix_date_layout.jsx`

What it proved:

- Replacing `8` with `15` changes text width and can collide with adjacent elements.
- Embedded PDF font subsets are not a substitute for installed editable fonts.

Reusable rule: separate `MONTH`, `DAY`, and `WEEKDAY`; lay them out from measured widths and a fixed safety boundary.

## `fix_kent_chinwang_position.jsx`

What it proved:

- Geometric image centering does not center a visible person inside transparent PNG canvas space.

Reusable rule: store actor focal points and visible bounds in an actor library.

## `fix_labels_and_jorge.jsx`

What it proved:

- Moving every portrait/name pair by the same amount can produce a quick visual improvement.
- Jorge needed an actor-specific horizontal focal correction.
- A global pair offset does not generalize across different actors or slots.

Reusable rule: keep name-tag geometry fixed by slot; adjust portrait placement using actor focal metadata. Do not keep `K90_PAIR_DOWN_V1`-style patches in production.

## `apply_final_refinements.jsx` and later name-tag patches

What they proved:

- Transparent lower edges, visible head positions, name angles, and font substitutions all require explicit QA.
- Automatically deriving name position from imperfect clipping-path or raster bounds can still disagree with the approved visual master.

Reusable rule: treat the approved master as the calibration source. Use distances as QA tolerances, not as a replacement for master slot anchors.

## `lower_chinwang_nametag.jsx`

What it proved:

- All five tags can look too close to the upper artwork even when only one tag is initially reported.
- Applying one equal downward offset does not create an equal visible head gap.
- Deriving a tag angle directly from the first clipping path can select geometry that does not match the visible upper border.

Reusable rule: calibrate anchor and angle per slot from the approved reference. Use the local upper-border angle as a QA constraint, not as the only runtime calculation.

## `match_standard_nametags.jsx`

What it proved:

- Ian, Kent, Chin Wang, Caleb, and Jorge required different vertical corrections.
- Fine adjustments are hard to judge at `18.54%` zoom.
- A script can run successfully while the visual result remains insufficient.
- Idempotency notes prevent accidental double application but also mean rerunning the same script will not strengthen the adjustment.

Reusable rule: use versioned slot calibration, inspect at `45%–100%`, and compare with the approved reference. When calibration changes, update the calibration version or start from the last approved copy instead of stacking diagnostic patches.

## Font and static-Chinese fixes

What they proved:

- `扫码购票` and other invariant Chinese text can change appearance when a required font is missing.
- The approved replacement for the tested editable Chinese text was `AlibabaPuHuiTi-3-105-Heavy.ttf`.

Reusable rule: outline invariant static Chinese text when permitted, or package the approved font. Keep dynamic date, time, and names editable and verify the actual installed PostScript font name before scripting it.
