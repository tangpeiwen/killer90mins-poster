# Illustrator template contract

## Required layer structure

```text
STATIC
  background, KILLER artwork, logo, QR codes, venue/footer information

EVENT_INFO
  EVENT_DATE
    MONTH
    DAY
    WEEKDAY
  EVENT_TIME
  HOST_BADGE

ACTOR_01
  PHOTO
    clipping path
    replaceable image
  NAME
    editable name text
    white stamped plate/appearance

...

ACTOR_05
  PHOTO_MODE
    PHOTO
      clipping path
      replaceable image
    NAME
  SECRET_GUEST_MODE
    silhouette
    black panel
    secret-guest name tag
```

## Object requirements

- Keep `STATIC` locked and unchanged.
- Keep `ACTOR_01` through `ACTOR_05` as separate layers or named groups.
- Keep every `NAME` editable; do not outline it or bake it into the PNG.
- Keep the editable name and white stamped plate/appearance together as one transformable name-tag unit.
- Preserve the white stamped background when changing, moving, rotating, or scaling a name.
- Keep actor images linked or replaceable inside stable clipping groups.
- Keep each actor-slot upper border stable enough to measure and calibrate the name-tag angle.
- Keep `MONTH`, `DAY`, `WEEKDAY`, and `EVENT_TIME` editable and individually named.
- Reserve enough date width for `SEPT 22 sat.` without touching the red `90`.
- Convert invariant Chinese text such as `扫码购票` to outlines when font substitution must never occur.
- Package all fonts needed by dynamic text and verify their license permits the workflow.

## Current test-master aliases

The August 2026 test master may contain these temporary deviations:

- `ACTOR_03/PHTOTO` instead of `PHOTO`;
- `ACTOR_05/NAME：secret guest` instead of a normal `NAME` inside `PHOTO_MODE`;
- `EVENT DATE` objects identified by their contents rather than `MONTH`, `DAY`, and `WEEKDAY` names;
- a fifth photo group created by script rather than a designer-authored dual-state group.

Support these aliases only when processing that specific test master. Report them in the handoff and prefer a corrected master for production.

## Preflight failure conditions

Stop before mutation when:

- a required dynamic layer or object is missing;
- a name or date value is an outline or raster image;
- a name's editable text and stamped background cannot be transformed together safely;
- the clipping path cannot be isolated safely;
- actor links or source PNGs are missing;
- a requested fifth-slot mode has no corresponding master group;
- required fonts are missing and substitution would change dynamic layout.
