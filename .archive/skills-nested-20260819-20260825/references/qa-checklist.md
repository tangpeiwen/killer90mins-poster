# Visual QA checklist

## Content

- Confirm actor order exactly matches the brief.
- Confirm the host and host badge are on the correct actor.
- Confirm spelling, spaces, and case for every name.
- Confirm date, weekday, period, and time.
- Confirm `PHOTO` versus `SECRET_GUEST` mode.

## Portraits

- Center the visible face, not the transparent PNG canvas.
- Keep heads away from slot edges unless the approved master intentionally crops them.
- Fill the clipping mask fully; show no transparent or black gap at the bottom.
- Preserve natural proportions; do not stretch width and height independently.
- Compare each actor's apparent scale with adjacent actors.

## Name tags

- Preserve the approved white stamped style.
- Keep slot-specific anchor, angle, and scale from the master.
- Measure from the visible lower edge of the complete tag to the visible top of the head; keep the five gaps visually consistent and within the calibrated tolerance.
- Use approximately `12 mm ± 2 mm` only when that is the designer-approved target for this master.
- Keep every tag nearly parallel to its slot's local upper border; compare with the saved slot angle and approved reference rather than assuming one global rotation.
- Confirm the full `CHIN WANG` tag retains its white background, space, and safe margins.
- Prevent the upper KILLER artwork from covering the tag.
- Do not use a global fixed offset to repair all five slots.
- Do not accept clipping-path-derived placement without visual comparison; the visible border, text bounds, and clipping geometry may differ.

## Date and static content

- Fit `AUG 8 sat.`, `AUG 15 sat.`, `SEPT 7 sat.`, and `SEPT 22 sat.` within the safe area.
- Preserve the period in `sat.`.
- Keep the date clear of the red `90` and lower `MINS` artwork.
- Confirm QR codes, logo, border, venue line, and KILLER artwork are unchanged.
- Confirm static Chinese text has not turned pink or substituted fonts.

## Output

- Open the exported PNG and inspect the full poster plus actor/date crops.
- Compare against the approved reference at the same approximate scale and at `45%–100%` for fine alignment.
- Confirm changes were applied to the intended working copy; do not rely only on an Illustrator alert.
- If a versioned/idempotent JSX has already run, do not rerun it expecting more movement. Revise the calibration version or return to the approved working copy.
- Keep the editable AI output and source links together.
- Record any remaining manual adjustment instead of hiding it behind a successful-script message.
