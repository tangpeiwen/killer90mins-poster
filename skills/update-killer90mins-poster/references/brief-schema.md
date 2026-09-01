# 数据契约

三个文件，职责严格分离：**模板常量**（换模板才改）、**演员素材**（每人一次，永久缓存）、**每期 brief**。

---

## `config/slots.json` —— L1 模板常量

由 `killer90mins_v3.ai` 的只读审计实测得出，手写一次。

```jsonc
{
  "_source": "killer90mins_20260819/killer90mins_v3_12mm.ai",
  "artboard_pt": [-4708.06, -3.53, -3007.27, -2271.24],
  "artboard_mm": [600.0, 800.0],
  "rules": {
    "gap_card_to_head_mm": 12.0,      // R2
    "gap_panel_to_card_mm": 12.0,     // 兜底值；实际由各 slot 逐格覆盖，见下
    "target_head_width_mm": 64.0,     // 默认；brief 可按 slot 覆盖
    "bottom_bleed_mm": 1.0,
    "tol_gap_mm": 1.0,                // 容差全部由认可稿反推，见 qa-checklist.md
    "tol_center_mm": 5.0,
    "tol_card_center_mm": 1.5
  },
  "slots": {
    "ACTOR_01": {
      "photo_group": "PHOTO",          // ACTOR_03 是 "PHTOTO"，模板拼写错误
      "clip_pt": [[...],[...],[...],[...]],
      "left_pt": -4634.77, "right_pt": -4340.27, "bottom_pt": -1737.88,
      "center_x_pt": -4487.52,
      "width_mm": 103.89, "height_mm": 261.95,
      "gap_panel_to_card_mm": 16.13,   // 逐格 R0，覆盖 rules 里的兜底值
      "top_edge": { "slope": 0.141731, "through": [-4634.77, -995.33],
                    "deg": 8.07, "cos": 0.990095, "sin": 0.140254 }
    }
  }
}
```

---

## `actors/<id>.json` —— L2 素材指标

由 `tools/measure_actor.py` 生成，**测完永久缓存**。演员换格子不影响这些值。

```jsonc
{
  "id": "1.CASPER",
  "file": "0829 Killer/1.CASPER.png",
  "px": [2756, 3796],
  "headTopRatio":     0.0482,   // alpha>=128 连续覆盖 >=0.1% 图高的第一行 / 图高
  "headCenterXRatio": 0.4712,   // 发顶下 5%-20% 内最宽那一行的中点 / 图宽
  "headWidthRatio":   0.3142,   // 同一行的宽度 / 图宽
  "headWidestDepth":  0.1874,   // 最宽行在发顶下多少（占图高），用于自检
  "aspect":           0.726,
  "dpi_at_target":    368.0,
  "center_spread":    0.0,      // 三种搜索窗口的分歧，>0.003 触发警告
  "alpha_threshold":  128,
  "verdict": "OK",              // OK | OK-WARN | REJECT
  "fatal": [], "issues": []
}
```

三个比例的定义见 [measurement-definitions.md](measurement-definitions.md)。**不要发明 `focal_x`、`visible_top` 之类无法复现的字段。**

---

## `briefs/<date>.json` —— 每期输入

```jsonc
{
  "date": "2026-08-29",
  "month": "AUG", "day": "29", "weekday": "sat.",   // 与母版文本对象一一对应
  "time": "19:30-21:00",
  "host": "ACTOR_01",                                // HOST 徽章归属；靠 x 落在哪格判断
  "target_head_width_mm": 64.4,                      // 默认值
  "slots": {
    "ACTOR_01": {
      "mode": "PHOTO",
      "name": "casper",                              // 大小写均可，该字体全大写渲染
      "name_font": "LaMachineCompany",
      "name_size": 54.25,
      "name_fill": "glyph",                          // glyph = 字形自带白板；white = 纯白填充
      "photo": "0829 Killer/1.CASPER.png",
      "metrics": "actors/1.CASPER.json"
    },
    "ACTOR_04": {
      "mode": "PHOTO",
      "name": "凌 浩",
      "name_font": "Huiwen-MinchoGBK-Regular",
      "name_size": 54.25,
      "name_fill": "white",                          // 中文无白板，需显式白色填充
      "photo": "0829 Killer/4.凌浩.png",
      "metrics": "actors/4.凌浩.json"
    },
    "ACTOR_05": { "mode": "SECRET_GUEST" }           // 必须显式声明，不从缺照片推断
  }
}
```

### 按 slot 覆盖目标头宽

```jsonc
"ACTOR_03": {
  "target_head_width_mm": 70.0,
  "_note": "长发，轮廓被撑宽；此值由人工看图定，改完重跑 stage2 即可"
}
```

这是**唯一允许的人工干预点**，且每位演员只需定一次。其余任何"看着不对就挪一下"都属于打补丁，见 [history-to-rules.md](history-to-rules.md)。
