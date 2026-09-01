# Brief and configuration schema

## Job brief

Normalize each request to this shape before opening Illustrator:

```yaml
template: /absolute/path/killer90mins.ai
reference: /absolute/path/approved-reference.jpg
output_name: killer90mins_2026-08-15
event:
  date: 2026-08-15
  time: 19:30-21:00
actors:
  - id: ian
    display_name: IAN
    host: true
  - id: kent
    display_name: KENT
  - id: chin-wang
    display_name: CHIN WANG
  - id: caleb
    display_name: CALEB
  - id: jorge
    display_name: JORGE
actor_05_mode: PHOTO
```

Secret-guest example:

```yaml
actor_05_mode: SECRET_GUEST
```

When `actor_05_mode` is `SECRET_GUEST`, omit the fifth actor or ignore it explicitly. Never infer secret-guest mode from a missing photo.

## Actor library

Store actor identity separately from slot assignment:

```json
{
  "kent": {
    "file": "/absolute/path/2.Kent.png",
    "display_name": "KENT",
    "focal_x": 0.55,
    "focal_y": 0.38,
    "visible_top": 0.13,
    "visible_bottom": 0.98
  },
  "chin-wang": {
    "file": "/absolute/path/3.ChinWang.png",
    "display_name": "CHIN WANG",
    "focal_x": 0.48,
    "focal_y": 0.40,
    "visible_top": 0.15,
    "visible_bottom": 0.89
  }
}
```

- Express focal and visible-bound values from `0` to `1` relative to the PNG canvas.
- Calibrate metadata against transparent pixels and the visible face/body, not only file dimensions.
- Reuse the same actor metadata when the actor moves to another slot.

## Slot calibration

Store master-specific layout separately from actors. Measure these values from the approved reference and Illustrator objects, then verify them visually:

```json
{
  "ACTOR_03": {
    "photo_group": "PHTOTO",
    "name_group": "NAME",
    "name_anchor_x": 0.50,
    "name_anchor_y": 0.08,
    "name_angle_deg": 18.0,
    "slot_upper_edge_angle_deg": 18.5,
    "name_max_width_mm": 42.0,
    "head_gap_mm": 12.0,
    "head_gap_tolerance_mm": 2.0,
    "portrait_bottom_bleed_mm": 2.0
  }
}
```

- Express `name_anchor_x` and `name_anchor_y` relative to the slot clipping mask.
- Measure `head_gap_mm` from the visible lower edge of the complete stamped name tag to the visible top of the actor's head, not to the PNG canvas.
- Keep `name_angle_deg` close to `slot_upper_edge_angle_deg`, unless the approved reference intentionally differs.
- Treat `PHTOTO` as a legacy alias only for the August 2026 test master; production masters should use `PHOTO`.
- Do not derive a new name-tag transform from each replacement portrait.
- Do not reuse actor-specific focal corrections as slot constants.

## Calibration versions

Store calibration separately from one-off JSX notes:

```yaml
template_id: killer90mins-0805
calibration_version: 1
approved_reference: /absolute/path/approved-reference.jpg
approved_at_zoom: 50%
```

Increase `calibration_version` when the approved slot geometry changes. A script marker from an older test patch is not evidence that the current calibration is correct.
